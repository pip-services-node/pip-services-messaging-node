/** @module queues */
import { IOpenable } from 'pip-services-commons-node';
import { IClosable } from 'pip-services-commons-node';
import { MessagingCapabilities } from './MessagingCapabilities';
import { MessageEnvelope } from './MessageEnvelope';
import { IMessageReceiver } from './IMessageReceiver';
export interface IMessageQueue extends IOpenable, IClosable {
    getName(): string;
    getCapabilities(): MessagingCapabilities;
    readMessageCount(callback: (err: any, count: number) => void): void;
    send(correlationId: string, envelope: MessageEnvelope, callback?: (err: any) => void): void;
    sendAsObject(correlationId: string, messageType: string, message: any, callback?: (err: any) => void): void;
    peek(correlationId: string, callback: (err: any, result: MessageEnvelope) => void): void;
    peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelope[]) => void): void;
    receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelope) => void): void;
    renewLock(message: MessageEnvelope, lockTimeout: number, callback?: (err: any) => void): void;
    complete(message: MessageEnvelope, callback?: (err: any) => void): void;
    abandon(message: MessageEnvelope, callback?: (err: any) => void): void;
    moveToDeadLetter(message: MessageEnvelope, callback?: (err: any) => void): void;
    listen(correlationId: string, receiver: IMessageReceiver): void;
    beginListen(correlationId: string, receiver: IMessageReceiver): void;
    endListen(correlationId: string): void;
}
