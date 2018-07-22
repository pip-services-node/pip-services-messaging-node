import { ConnectionParams } from 'pip-services-components-node';
import { CredentialParams } from 'pip-services-components-node';
import { IMessageReceiver } from './IMessageReceiver';
import { MessageQueue } from './MessageQueue';
import { MessageEnvelop } from './MessageEnvelop';
export declare class MemoryMessageQueue extends MessageQueue {
    private _messages;
    private _lockTokenSequence;
    private _lockedMessages;
    private _opened;
    private _cancel;
    constructor(name?: string);
    isOpened(): boolean;
    protected openWithParams(correlationId: string, connection: ConnectionParams, credential: CredentialParams, callback: (err: any) => void): void;
    close(correlationId: string, callback: (err: any) => void): void;
    clear(correlationId: string, callback: (err?: any) => void): void;
    readMessageCount(callback: (err: any, count: number) => void): void;
    send(correlationId: string, envelop: MessageEnvelop, callback?: (err: any) => void): void;
    peek(correlationId: string, callback: (err: any, result: MessageEnvelop) => void): void;
    peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelop[]) => void): void;
    receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelop) => void): void;
    renewLock(message: MessageEnvelop, lockTimeout: number, callback?: (err: any) => void): void;
    complete(message: MessageEnvelop, callback: (err: any) => void): void;
    abandon(message: MessageEnvelop, callback: (err: any) => void): void;
    moveToDeadLetter(message: MessageEnvelop, callback: (err: any) => void): void;
    listen(correlationId: string, receiver: IMessageReceiver): void;
    endListen(correlationId: string): void;
}
