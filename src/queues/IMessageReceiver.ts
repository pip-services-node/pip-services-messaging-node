import { IMessageQueue } from './IMessageQueue';
import { MessageEnvelop } from './MessageEnvelop';

export interface IMessageReceiver {
    receiveMessage(envelop: MessageEnvelop, queue: IMessageQueue, callback: (err: any) => void): void;
}