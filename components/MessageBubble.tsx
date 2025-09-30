
import React from 'react';
import { Message, ChatRole } from '../types';

interface MessageBubbleProps {
    message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === ChatRole.USER;
    const isSystem = message.role === ChatRole.SYSTEM;
    
    if (isSystem) {
        return (
            <div className="text-center my-2">
                <span className="text-xs text-brand-text-light italic bg-brand-surface px-3 py-1 rounded-full">{message.text}</span>
            </div>
        )
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg p-3 max-w-lg ${isUser ? 'bg-brand-primary text-white' : 'bg-brand-surface'}`}>
                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
            </div>
        </div>
    );
};
