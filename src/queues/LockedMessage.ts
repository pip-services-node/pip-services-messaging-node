/** @module queues */
import { MessageEnvelope } from './MessageEnvelope';

export class LockedMessage {
    public message: MessageEnvelope;
    public expirationTime: Date;
    public timeout: number;
}