/** @module queues */
import { MessageEnvelope } from './MessageEnvelope';
export declare class LockedMessage {
    message: MessageEnvelope;
    expirationTime: Date;
    timeout: number;
}
