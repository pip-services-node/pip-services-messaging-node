import { MessageEnvelop } from './MessageEnvelop';

export class LockedMessage {
    public message: MessageEnvelop;
    public expirationTime: Date;
    public timeout: number;
}