
import React from 'react';
import { Persona } from '../types';
import { TrashIcon } from './icons/TrashIcon';

interface PersonaCardProps {
    persona: Persona;
    onEdit: (persona: Persona) => void;
    onDelete: (personaId: string) => void;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onEdit, onDelete }) => {
    return (
        <div className="bg-brand-bg-light rounded-lg shadow-lg p-5 flex flex-col justify-between transition-transform transform hover:scale-105">
            <div>
                <h3 className="text-xl font-bold text-brand-primary">{persona.name} {persona.isAttendant && '(Atendente)'}</h3>
                <p className="text-brand-text-light mt-2 mb-4 h-12">{persona.description}</p>
            </div>
            <div className="flex justify-end space-x-2">
                {!persona.isAttendant && (
                     <button onClick={() => onDelete(persona.id)} className="p-2 text-red-400 hover:text-red-300 rounded-md hover:bg-red-900 bg-opacity-50 transition-colors">
                        <TrashIcon />
                    </button>
                )}
                <button onClick={() => onEdit(persona)} className="bg-brand-surface hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition-colors">
                    Editar
                </button>
            </div>
        </div>
    );
};
