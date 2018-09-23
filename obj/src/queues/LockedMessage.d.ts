/** @module queues */
import { MessageEnvelope } from './MessageEnvelope';
/**
 * Data object used to store and lock incoming messages
 * in [[MemoryMessageQueue]].
 *
 * @see [[MemoryMessageQueue]]
 */
export declare class LockedMessage {
    /**
     * The incoming message.
     */
    message: MessageEnvelope;
    /**
     * The expiration time for the message lock.
     * If it is null then the message is not locked.
     */
    expirationTime: Date;
    /**
     * The lock timeout in milliseconds.
     */
    timeout: number;
}
