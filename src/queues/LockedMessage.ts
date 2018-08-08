/** @module queues */
import { MessageEnvelope } from './MessageEnvelope';

/**
 * Allows locking messages in message queues.
 */
export class LockedMessage {
    /** The message to lock. */
    public message: MessageEnvelope;
    /** The time at which the lock expires. Calculated as <code><time when locked> + timeout</code> */
    public expirationTime: Date;
    /** The locks timeout. */
    public timeout: number;
}