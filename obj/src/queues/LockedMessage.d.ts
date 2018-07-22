import { MessageEnvelop } from './MessageEnvelop';
export declare class LockedMessage {
    message: MessageEnvelop;
    expirationTime: Date;
    timeout: number;
}
