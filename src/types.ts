export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface AttachedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  isImage: boolean;
  base64?: string;
  textContent?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
}
