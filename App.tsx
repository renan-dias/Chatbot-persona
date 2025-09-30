
import React, { useState, useEffect } from 'react';
import ChatView from './components/ChatView';
import ConfigurationView from './components/ConfigurationView';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Persona } from './types';
import { INITIAL_PERSONAS } from './constants';
import { CogIcon } from './components/icons/CogIcon';
import { ChatIcon } from './components/icons/ChatIcon';

type View = 'chat' | 'config';

const App: React.FC = () => {
  const [personas, setPersonas] = useLocalStorage<Persona[]>('personas', INITIAL_PERSONAS);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);
  const [view, setView] = useState<View>('chat');

  useEffect(() => {
    if (!activePersona) {
      const attendant = personas.find(p => p.isAttendant);
      setActivePersona(attendant || personas[0] || null);
    }
  }, [personas, activePersona]);

  const handleSelectPersona = (persona: Persona) => {
    setActivePersona(persona);
    setView('chat');
  };

  const handleUpdatePersonas = (updatedPersonas: Persona[]) => {
    setPersonas(updatedPersonas);
    // If the active persona was deleted, reset to the attendant
    if (activePersona && !updatedPersonas.find(p => p.id === activePersona.id)) {
        const attendant = updatedPersonas.find(p => p.isAttendant);
        setActivePersona(attendant || updatedPersonas[0] || null);
    }
  };
  
  const resetToAttendant = () => {
    const attendant = personas.find(p => p.isAttendant);
    setActivePersona(attendant || personas[0] || null);
  };

  return (
    <div className="min-h-screen bg-brand-bg-dark text-brand-text font-sans flex flex-col">
      <header className="bg-brand-bg-light shadow-md w-full p-4 flex justify-between items-center z-10">
        <h1 className="text-xl md:text-2xl font-bold text-brand-primary">Multi-Persona AI Chatbot</h1>
        <nav>
          <button
            onClick={() => setView('chat')}
            className={`p-2 rounded-md transition-colors duration-200 ${view === 'chat' ? 'bg-brand-primary text-white' : 'hover:bg-brand-surface'}`}
            aria-label="Chat View"
          >
            <ChatIcon />
          </button>
          <button
            onClick={() => setView('config')}
            className={`p-2 rounded-md transition-colors duration-200 ml-2 ${view === 'config' ? 'bg-brand-primary text-white' : 'hover:bg-brand-surface'}`}
            aria-label="Configuration View"
          >
            <CogIcon />
          </button>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6 flex">
        {view === 'chat' ? (
          activePersona && <ChatView 
            personas={personas} 
            activePersona={activePersona} 
            setActivePersona={handleSelectPersona} 
            resetToAttendant={resetToAttendant}
          />
        ) : (
          <ConfigurationView 
            personas={personas} 
            setPersonas={handleUpdatePersonas} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
