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
import { MessageEnvelope } from './MessageEnvelope';

/**
 * Abstract class for creating message queues that support logging, connection establishment, 
 * and performance counters. 
 * 
 * MessageQueues can be configured using the [[configure]] method, which searches for and sets:
 * - the queue's name as the configuration's name ("name", "id", or "descriptor" parameters);
 * - the logger's log-level and source ("level" and "source" parameters);
 * - the connection resolver's connections ("connection(s)" section);
 * - the credential resolver's credentials ("credential(s)" section).
 * 
 * @see [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/log.compositelogger.html CompositeLogger]] (in the PipServices "Components" package)
 * @see [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/count.compositecounters.html CompositeCounters]] (in the PipServices "Components" package)
 * @see [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/connect.connectionresolver.html ConnectionResolver]] (in the PipServices "Components" package)
 * @see [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/auth.credentialresolver.html CredentialResolver]] (in the PipServices "Components" package)
 */
export abstract class MessageQueue implements IMessageQueue, IReferenceable, IConfigurable {
    /** The [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/log.compositelogger.html CompositeLogger]] to log with. */
    protected _logger: CompositeLogger = new CompositeLogger();
    /** The [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/count.compositecounters.html CompositeCounters]] to count performance parameters with. */
    protected _counters: CompositeCounters = new CompositeCounters();
    /** The [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/connect.connectionresolver.html ConnectionResolver]] to establish connections with. */
    protected _connectionResolver: ConnectionResolver = new ConnectionResolver();
    /** The [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/auth.credentialresolver.html CredentialResolver]] to authenticate connections with. */
    protected _credentialResolver: CredentialResolver = new CredentialResolver();

    /** The queue's name. */
    protected _name: string;
    /** The queue's [[MessagingCapabilities messaging capabilities]]. */
    protected _capabilities: MessagingCapabilities;

    /**
     * Creates a new MessageQueue.
     * 
     * @param name  the name to give to the queue.
     */
	public constructor(name?: string) {
        this._name = name;
	}
    
    /**
     * @returns the queue's name.
     */
    public getName(): string { return this._name; }
    /**
     * @returns the queue's [[MessagingCapabilities messaging capabilities]].
     */
    public getCapabilities(): MessagingCapabilities { return this._capabilities; }

    /**
     * Sets references to this queue's logger, counters, connection resolver, 
     * and credential resolver.
     * 
     * @param references    an IReferences object, containing "logger" and "counters" references, 
     *                      as well as the references to set for the connection and credential resolvers.
     * 
     * @see [[https://rawgit.com/pip-services-node/pip-services-commons-node/master/doc/api/interfaces/refer.ireferences.html IReferences]]
     */
    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }

    /**
     * Configures this queue by searching for and setting:
     * - the queue's name as the configuration's name ("name", "id", or "descriptor" parameters);
     * - the logger's log-level and source ("level" and "source" parameters);
     * - the connection resolver's connections ("connection(s)" section);
     * - the credential resolver's credentials ("credential(s)" section).
     * 
     * @param config    the configuration parameters to configure this queue with.
     * 
     * @see [[https://rawgit.com/pip-services-node/pip-services-commons-node/master/doc/api/classes/config.configparams.html ConfigParams]]
     */
    public configure(config: ConfigParams): void {
        this._name = NameResolver.resolve(config, this._name);
        this._logger.configure(config);
        this._connectionResolver.configure(config);
        this._credentialResolver.configure(config);
    }

    /**
     * Opens a connection for message transferring using the connection and credential parameters 
     * resolved by the corresponding resolvers.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param callback          (optional) the function to call once the connection has been opened.
     *                          Will be called with an error, if one is raised.
     */
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

    /**
     * Abstract method that will contain the logic for opening a connection using the provided 
     * connection and credential parameters.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param connection        the parameters of the connection.
     * @param credential        the credentials to use for authentication.
     * @param callback          the function to call once the connection has been opened.
     *                          Will be called with an error if one is raised.
     */
    protected abstract openWithParams(correlationId: string, connection: ConnectionParams, credential: CredentialParams, callback: (err: any) => void): void;

    /**
     * Abstract method that will contain the logic for determining whether or not the 
     * queue's connection is currently open.
     */
    public abstract isOpen(): boolean;
    /**
     * Abstract method that will contain the logic for closing the queue's connection.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param callback          the function to call once the connection has been closed.
     *                          Will be called with an error if one is raised.
     */
    public abstract close(correlationId: string, callback: (err: any) => void): void;
    /**
     * Abstract method that will contain the logic for clearing the queue.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param callback          the function to call once the queue has been cleared.
     *                          Will be called with an error if one is raised.
     */
    public abstract clear(correlationId: string, callback: (err: any) => void): void;

    /**
     * Abstract method that will contain the logic for establishing the amount of 
     * messages currently in the queue.
     * 
     * @param callback      the function to call with the number of messages in the queue 
     *                      (or with an error, if one is rasied).
     */
    public abstract readMessageCount(callback: (err: any, count: number) => void): void;

    //TODO: sent over the connection or to the queue?
    /**
     * Abstract method that will contain the logic for sending a [[MessageEnvelope]].
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param envelope          the MessageEnvelope to send.
     * @param callback          (optional) the function to call once sending is complete.
     *                          Will be called with an error if one is raised.
     * 
     * @see [[MessageEnvelope]]
     */
    public abstract send(correlationId: string, envelope: MessageEnvelope, callback?: (err: any) => void): void;
    /**
     * Send the object passed as the message.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param messageType       the message's type. Will used when converting the message to a
     *                          MessageEnvelope.
     * @param message           the message to send.
     * @param callback          (optional) the function to call once sending is complete.
     *                          Will be called with an error if one is raised.
     * 
     * @see [[MessageEnvelope]]
     * @see [[send]]
     */
    public sendAsObject(correlationId: string, messageType: string, message: any, callback?: (err: any) => void): void {
        var envelope = new MessageEnvelope(correlationId, messageType, message);
        this.send(correlationId, envelope, callback);
    }

    /**
     * Abstract method that will contain the logic for retrieving the next message without removing 
     * it from the queue.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param callback          the function to call with the peeked message 
     *                          (or with an error, if one is raised).
     */
    public abstract peek(correlationId: string, callback: (err: any, result: MessageEnvelope) => void): void;
    /**
     * Abstract method that will contain the logic for retrieving a batch of messages without 
     * removing them from the queue.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param messageCount      the number of message to peek.
     * @param callback          the function to call with the peeked messages 
     *                          (or with an error, if one is raised).
     */
    public abstract peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelope[]) => void): void;
    /**
     * Abstract method that will wait the given amount of time for a message to arrive in 
     * the queue (if it is empty) and, once one arrives, will remove it from the queue and lock it 
     * for processing. If the queue already contains messages then the next one will be received.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param waitTimeout       the amount of time to wait for a message to arrive.
     * @param callback          the function to call with the received message 
     *                          (or with an error, if one is raised).
     */
    public abstract receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelope) => void): void;

    /**
     * Abstract method that will contain the logic for renewing the given message's lock.
     * 
     * @param message       the message to renew a lock for.
     * @param lockTimeout   the lock's new timeout.
     * @param callback      (optional) the function to call once the lock has been renewed.
     *                      Will be called with an error if one is raised.
     */
    public abstract renewLock(message: MessageEnvelope, lockTimeout: number, callback?: (err: any) => void): void;
    /**
     * Abstract method that will contain the logic for completing the processing of a 
     * locked message and removing its lock.
     * 
     * @param message   the message to complete.
     * @param callback  (optional) the function to call once the message has been completed.
     *                  Will be called with an error if one is raised.
     */
    public abstract complete(message: MessageEnvelope, callback?: (err: any) => void): void;
    /**
     * Abstract method that will contain the logic for abandoning the processing of a 
     * locked message and removing its lock.
     * 
     * @param message   the message to abandon.
     * @param callback  (optional) the function to call once the message has been abandoned.
     *                  Will be called with an error if one is raised.
     */
    public abstract abandon(message: MessageEnvelope, callback?: (err: any) => void): void;
    /**
     * Abstract method that will contain the logic for moving a locked message to the dead 
     * letter queue.
     * 
     * @param message   the dead letter.
     * @param callback  (optional) the function to call once the message has been moved.
     *                  Will be called with an error if one is raised.
     */
    public abstract moveToDeadLetter(message: MessageEnvelope, callback?: (err: any) => void): void;

    /**
     * Abstract method that will listen to the queue and, if a message is [[receive received]], 
     * will pass it to the given message receiver for processing.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param receiver          the message receiver to pass the received message(s) to.
     * 
     * @see [[IMessageReceiver]]
     * @see [[receive]]
     */
    public abstract listen(correlationId: string, receiver: IMessageReceiver): void;
    /**
     * Abstract method that will contain the logic for stopping this queue's listening process.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     */
    public abstract endListen(correlationId: string): void;

    /**
     * Starts the [[listen listening]] process.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param receiver          the message receiver to pass the received message(s) to.
     * 
     * @see [[listen]]
     * @see [[IMessageReceiver]]
     */
    public beginListen(correlationId: string, receiver: IMessageReceiver): void {
        setImmediate(() => {
            this.listen(correlationId, receiver);
        });
    }

    /**
     * @returns this queues name in the following format: "[<name>]".
     */
    public toString(): string {
        return "[" + this.getName() + "]";
    }

}