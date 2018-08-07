/** @module queues */
/** @hidden */
var async = require('async');

import { IReferenceable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { NameResolver } from 'pip-services-commons-node';
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

export abstract class MessageQueue implements IMessageQueue, IReferenceable, IConfigurable {
    protected _logger: CompositeLogger = new CompositeLogger();
    protected _counters: CompositeCounters = new CompositeCounters();
    protected _connectionResolver: ConnectionResolver = new ConnectionResolver();
    protected _credentialResolver: CredentialResolver = new CredentialResolver();

    protected _name: string;
    protected _capabilities: MessagingCapabilities;

	public constructor(name?: string) {
        this._name = name;
	}
    
    public getName(): string { return this._name; }
    public getCapabilities(): MessagingCapabilities { return this._capabilities; }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }

    public configure(config: ConfigParams): void {
        this._name = NameResolver.resolve(config, this._name);
        this._logger.configure(config);
        this._connectionResolver.configure(config);
        this._credentialResolver.configure(config);
    }

    public open(correlationId: string, callback?: (err: any) => void): void {
        let connection: ConnectionParams;
        let credential: CredentialParams;

        async.series([
            (callback) => {
                this._connectionResolver.resolve(correlationId, (err: any, result: ConnectionParams) => {
                    connection = result;
                    callback(err);
                });
            },
            (callback) => {
                this._credentialResolver.lookup(correlationId, (err: any, result: CredentialParams) => {
                    credential = result;
                    callback(err);
                });
            }
        ])

        this.openWithParams(correlationId, connection, credential, callback);
    }

    protected abstract openWithParams(correlationId: string, connection: ConnectionParams, credential: CredentialParams, callback: (err: any) => void): void;

    public abstract isOpened(): boolean;
    public abstract close(correlationId: string, callback: (err: any) => void): void;
    public abstract clear(correlationId: string, callback: (err: any) => void): void;

    public abstract readMessageCount(callback: (err: any, count: number) => void): void;

    public abstract send(correlationId: string, envelop: MessageEnvelop, callback?: (err: any) => void): void;
    public sendAsObject(correlationId: string, messageType: string, message: any, callback?: (err: any) => void): void {
        var envelop = new MessageEnvelop(correlationId, messageType, message);
        this.send(correlationId, envelop, callback);
    }

    public abstract peek(correlationId: string, callback: (err: any, result: MessageEnvelop) => void): void;
    public abstract peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelop[]) => void): void;
    public abstract receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelop) => void): void;

    public abstract renewLock(message: MessageEnvelop, lockTimeout: number, callback?: (err: any) => void): void;
    public abstract complete(message: MessageEnvelop, callback?: (err: any) => void): void;
    public abstract abandon(message: MessageEnvelop, callback?: (err: any) => void): void;
    public abstract moveToDeadLetter(message: MessageEnvelop, callback?: (err: any) => void): void;

    public abstract listen(correlationId: string, receiver: IMessageReceiver): void;
    public abstract endListen(correlationId: string): void;

    public beginListen(correlationId: string, receiver: IMessageReceiver): void {
        setImmediate(() => {
            this.listen(correlationId, receiver);
        });
    }

    public toString(): string {
        return "[" + this.getName() + "]";
    }

}