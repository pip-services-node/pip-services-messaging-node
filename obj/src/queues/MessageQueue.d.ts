import { IReferenceable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-components-node';
import { CompositeCounters } from 'pip-services-components-node';
import { ConnectionResolver } from 'pip-services-components-node';
import { CredentialResolver } from 'pip-services-components-node';
import { ConnectionParams } from 'pip-services-components-node';
import { CredentialParams } from 'pip-services-components-node';
import { IMessageQueue } from './IMessageQueue';
import { IMessageReceiver } from './IMessageReceiver';
import { MessagingCapabilities } from './MessagingCapabilities';
import { MessageEnvelop } from './MessageEnvelop';
export declare abstract class MessageQueue implements IMessageQueue, IReferenceable, IConfigurable {
    protected _logger: CompositeLogger;
    protected _counters: CompositeCounters;
    protected _connectionResolver: ConnectionResolver;
    protected _credentialResolver: CredentialResolver;
    protected _name: string;
    protected _capabilities: MessagingCapabilities;
    constructor(name?: string);
    getName(): string;
    getCapabilities(): MessagingCapabilities;
    setReferences(references: IReferences): void;
    configure(config: ConfigParams): void;
    open(correlationId: string, callback?: (err: any) => void): void;
    protected abstract openWithParams(correlationId: string, connection: ConnectionParams, credential: CredentialParams, callback: (err: any) => void): void;
    abstract isOpen(): boolean;
    abstract close(correlationId: string, callback: (err: any) => void): void;
    abstract clear(correlationId: string, callback: (err: any) => void): void;
    abstract readMessageCount(callback: (err: any, count: number) => void): void;
    abstract send(correlationId: string, envelop: MessageEnvelop, callback?: (err: any) => void): void;
    sendAsObject(correlationId: string, messageType: string, message: any, callback?: (err: any) => void): void;
    abstract peek(correlationId: string, callback: (err: any, result: MessageEnvelop) => void): void;
    abstract peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelop[]) => void): void;
    abstract receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelop) => void): void;
    abstract renewLock(message: MessageEnvelop, lockTimeout: number, callback?: (err: any) => void): void;
    abstract complete(message: MessageEnvelop, callback?: (err: any) => void): void;
    abstract abandon(message: MessageEnvelop, callback?: (err: any) => void): void;
    abstract moveToDeadLetter(message: MessageEnvelop, callback?: (err: any) => void): void;
    abstract listen(correlationId: string, receiver: IMessageReceiver): void;
    abstract endListen(correlationId: string): void;
    beginListen(correlationId: string, receiver: IMessageReceiver): void;
    toString(): string;
}
