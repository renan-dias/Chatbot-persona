import React, { useState, useRef, useEffect } from 'react';
import { Persona, Message, ChatRole } from '../types';
import { sendMessageToAI, resetChatSession } from '../services/geminiService';
import { MessageBubble } from './MessageBubble';
import { BackIcon } from './icons/BackIcon';

interface ChatViewProps {
  personas: Persona[];
  activePersona: Persona;
  setActivePersona: (persona: Persona) => void;
  resetToAttendant: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ personas, activePersona, setActivePersona, resetToAttendant }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevActivePersonaIdRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const prevId = prevActivePersonaIdRef.current;
    const currentId = activePersona.id;
    prevActivePersonaIdRef.current = currentId;

    if (prevId === null) { // Initial load
        setMessages([]);
        resetChatSession(currentId);
        return;
    }

    if (prevId === currentId) { // No change
        return;
    }
    
    resetChatSession(currentId);

    const prevPersona = personas.find(p => p.id === prevId);
    const isTransfer = prevPersona?.isAttendant && !activePersona.isAttendant;

    if (isTransfer) {
        const introduceSpecialist = async () => {
            setIsLoading(true);
            try {
                const greetingText = await sendMessageToAI(
                    activePersona,
                    "INSTRUÇÃO: Você é um especialista que acabou de receber um usuário transferido por um atendente. Apresente-se de forma concisa (usando seu nome de persona) e pergunte como pode ajudar o usuário.",
                    [],
                    personas
                );
                const modelMessage: Message = { role: ChatRole.MODEL, text: greetingText };
                setMessages(prev => [...prev, modelMessage]);
            } catch (error) {
                console.error("Specialist introduction failed:", error);
                const errorMessage: Message = { role: ChatRole.MODEL, text: "Ocorreu um erro ao conectar com o especialista." };
                setMessages(prev => [...prev, errorMessage]);
            } finally {
                setIsLoading(false);
            }
        };
        introduceSpecialist();
    } else {
        setMessages([]);
    }
  }, [activePersona, personas]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: ChatRole.USER, text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const responseText = await sendMessageToAI(activePersona, currentInput, messages, personas);
        
        if (activePersona.isAttendant) {
            const jsonStartIndex = responseText.lastIndexOf('{');
            const jsonEndIndex = responseText.lastIndexOf('}');

            if (jsonStartIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                const conversationalPart = responseText.substring(0, jsonStartIndex).trim();
                const jsonPart = responseText.substring(jsonStartIndex, jsonEndIndex + 1);

                if (conversationalPart) {
                    const attendantMessage: Message = { role: ChatRole.MODEL, text: conversationalPart };
                    setMessages(prev => [...prev, attendantMessage]);
                }

                try {
                    const parsedResponse = JSON.parse(jsonPart);
                    if (parsedResponse.specialist) {
                        const nextPersona = personas.find(p => p.name === parsedResponse.specialist);
                        if (nextPersona) {
                            const systemMessage: Message = { role: ChatRole.SYSTEM, text: `Conectando com ${nextPersona.name}...`};
                            setMessages(prev => [...prev, systemMessage]);
                            setTimeout(() => setActivePersona(nextPersona), 1500);
                            setIsLoading(false);
                            return;
                        }
                    }
                } catch (e) {
                    console.warn("Could not parse specialist JSON from response, treating as a normal message.", e);
                }
            }
            const modelMessage: Message = { role: ChatRole.MODEL, text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } else {
            const modelMessage: Message = { role: ChatRole.MODEL, text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        }
    } catch (error) {
        console.error(error);
        const errorMessage: Message = { role: ChatRole.MODEL, text: "Desculpe, algo deu errado." };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full max-h-[calc(100vh-120px)] bg-brand-bg-light rounded-lg shadow-2xl">
      <header className="flex items-center p-4 border-b border-brand-surface">
        {!activePersona.isAttendant && (
          <button onClick={() => {
              resetChatSession(activePersona.id);
              resetToAttendant();
            }} className="mr-4 p-2 rounded-full hover:bg-brand-surface transition-colors">
              <BackIcon />
          </button>
        )}
        <div>
          <h2 className="text-lg font-bold">{activePersona.name}</h2>
          <p className="text-sm text-brand-text-light">{activePersona.description}</p>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col space-y-4">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}
          {isLoading && (
             <div className="flex justify-start">
                <div className="bg-brand-surface rounded-lg p-3 max-w-lg animate-pulse flex space-x-2">
                    <div className="w-2 h-2 bg-brand-text-light rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-brand-text-light rounded-full animate-bounce [animation-delay:0.3s]"></div>
                    <div className="w-2 h-2 bg-brand-text-light rounded-full animate-bounce [animation-delay:0.6s]"></div>
                </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-brand-surface">
        <div className="flex items-center space-x-2 bg-brand-surface rounded-lg p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Converse com ${activePersona.name}...`}
            className="flex-1 bg-transparent focus:outline-none px-2"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-primary-hover disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;