import { Message } from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  return messages.filter((message) => message.content.length > 0);
}
