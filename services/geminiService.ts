
import { GoogleGenAI, Chat } from "@google/genai";
import { Persona, Message, ChatRole } from '../types';

if (!process.env.API_KEY) {
  // This is a placeholder for environments where the key is not set.
  // In a real deployment, this would be handled by the hosting environment.
  // For local development, you might use a .env file.
  console.warn("API_KEY environment variable not set. Using a placeholder.");
  // A placeholder key allows the app to load, but API calls will fail.
  // This prevents the app from crashing outright if the key is missing.
  process.env.API_KEY = "YOUR_API_KEY_HERE"; 
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We use a map to store chat sessions for each persona to maintain conversation history.
const chatSessions = new Map<string, Chat>();

function getChatSession(persona: Persona, specialists?: Persona[]): Chat {
  if (chatSessions.has(persona.id)) {
    return chatSessions.get(persona.id)!;
  }

  let systemInstruction = persona.systemInstruction;
  if (persona.isAttendant && specialists) {
      const specialistList = specialists
          .filter(p => !p.isAttendant)
          .map(p => `- Nome: "${p.name}", Descrição: "${p.description}"`)
          .join('\n');
      systemInstruction = systemInstruction.replace('[[SPECIALISTS_LIST]]', specialistList);
  }

  const newChat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: systemInstruction,
    },
    history: [],
  });

  chatSessions.set(persona.id, newChat);
  return newChat;
}

export const sendMessageToAI = async (
  persona: Persona,
  message: string,
  history: Message[],
  allPersonas: Persona[]
): Promise<string> => {
  try {
    const chat = getChatSession(persona, allPersonas);
    
    // Gemini API's history alternates between 'user' and 'model'.
    // We send only the last message, as the session is stateful.
    const response = await chat.sendMessage({ message: message });

    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini API:", error);
    return "Desculpe, ocorreu um erro ao me conectar com a IA. Verifique a chave da API e tente novamente.";
  }
};

export const resetChatSession = (personaId: string) => {
    chatSessions.delete(personaId);
};
