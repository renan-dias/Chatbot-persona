
import React, { useState } from 'react';
import { Persona } from '../types';
import { PersonaCard } from './PersonaCard';
import { PlusIcon } from './icons/PlusIcon';

interface ConfigurationViewProps {
  personas: Persona[];
  setPersonas: (personas: Persona[]) => void;
}

const PersonaForm: React.FC<{
    persona: Persona | null;
    onSave: (persona: Persona) => void;
    onCancel: () => void;
}> = ({ persona, onSave, onCancel }) => {
    const [name, setName] = useState(persona?.name || '');
    const [description, setDescription] = useState(persona?.description || '');
    const [systemInstruction, setSystemInstruction] = useState(persona?.systemInstruction || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPersona: Persona = {
            id: persona?.id || `persona-${Date.now()}`,
            name,
            description,
            systemInstruction,
            isAttendant: persona?.isAttendant || false,
        };
        onSave(newPersona);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-brand-bg-light rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
                <h2 className="text-2xl font-bold mb-4">{persona ? 'Editar Persona' : 'Nova Persona'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-brand-text-light">Nome</label>
                        <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-brand-surface border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-brand-text-light">Descrição Curta</label>
                        <input id="description" type="text" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full bg-brand-surface border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label htmlFor="systemInstruction" className="block text-sm font-medium text-brand-text-light">Instrução de Personalidade (System Prompt)</label>
                        <textarea id="systemInstruction" value={systemInstruction} onChange={e => setSystemInstruction(e.target.value)} required rows={8} className="mt-1 block w-full bg-brand-surface border border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onCancel} className="bg-brand-surface hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Cancelar</button>
                        <button type="submit" className="bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-2 px-4 rounded-md transition-colors">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const ConfigurationView: React.FC<ConfigurationViewProps> = ({ personas, setPersonas }) => {
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSave = (personaToSave: Persona) => {
    const index = personas.findIndex(p => p.id === personaToSave.id);
    if (index > -1) {
      const updated = [...personas];
      updated[index] = personaToSave;
      setPersonas(updated);
    } else {
      setPersonas([...personas, personaToSave]);
    }
    setIsFormVisible(false);
    setEditingPersona(null);
  };

  const handleDelete = (personaId: string) => {
    setPersonas(personas.filter(p => p.id !== personaId));
  };

  const handleEdit = (persona: Persona) => {
    setEditingPersona(persona);
    setIsFormVisible(true);
  };
  
  const handleAddNew = () => {
    setEditingPersona(null);
    setIsFormVisible(true);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">Gerenciar Personas</h2>
          <button onClick={handleAddNew} className="flex items-center bg-brand-primary text-white font-bold py-2 px-4 rounded-md hover:bg-brand-primary-hover transition-colors">
            <PlusIcon />
            <span className="ml-2">Nova Persona</span>
          </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map(p => (
          <PersonaCard key={p.id} persona={p} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>

      {isFormVisible && (
        <PersonaForm 
          persona={editingPersona}
          onSave={handleSave}
          onCancel={() => { setIsFormVisible(false); setEditingPersona(null); }}
        />
      )}
    </div>
  );
};

export default ConfigurationView;
