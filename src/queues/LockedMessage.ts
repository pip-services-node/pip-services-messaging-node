/** @module queues */
import { MessageEnvelope } from './MessageEnvelope';

/**
 * Data object used to store and lock incoming messages
 * in [[MemoryMessageQueue]].
 * 
 * @see [[MemoryMessageQueue]]
 */
export class LockedMessage {
    /**
     * The incoming message.
     */
    public message: MessageEnvelope;

    /**
     * The expiration time for the message lock.
     * If it is null then the message is not locked.
     */
    public expirationTime: Date;

    /**
     * The lock timeout in milliseconds.
     */
    public timeout: number;
}