
export enum ChatRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface Message {
  role: ChatRole;
  text: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  isAttendant?: boolean;
}
