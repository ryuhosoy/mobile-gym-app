export interface ChatRoom {
  id: string;
  gymId: string;
  gymName: string;
  lastMessage?: string;
  lastMessageTime?: number;
  title: string;
  timestamp: number;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
}