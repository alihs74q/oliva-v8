import { EventEmitter } from "node:events";

export interface PublishedContentEvent {
  version: number;
  publishedAt: string;
}

export const contentEvents = new EventEmitter();
contentEvents.setMaxListeners(0);