const async = require('async');

import { ConnectionParams } from 'pip-services-components-node';
import { CredentialParams } from 'pip-services-components-node';

import { IMessageReceiver } from './IMessageReceiver';
import { MessageQueue } from './MessageQueue';
import { MessageEnvelop } from './MessageEnvelop';
import { MessagingCapabilities } from './MessagingCapabilities';
import { LockedMessage } from './LockedMessage';

export class MemoryMessageQueue extends MessageQueue {
    private _messages: MessageEnvelop[] = [];
    private _lockTokenSequence: number = 0;
    private _lockedMessages: { [id: number]: LockedMessage; } = {};
    private _opened: boolean = false;
    private _cancel: boolean = false;

    public constructor(name?: string) {
        super(name);
        this._capabilities = new MessagingCapabilities(true, true, true, true, true, true, true, false, true);
    }

    public isOpen(): boolean {
        return this._opened;
    }

    protected openWithParams(correlationId: string, connection: ConnectionParams, credential: CredentialParams, callback: (err: any) => void): void {
        this._opened = true;
        callback(null);
    }

    public close(correlationId: string, callback: (err: any) => void): void {
        this._opened = false;
        this._cancel = true;
        this._logger.trace(correlationId, "Closed queue %s", this);
        callback(null);
    }

    public clear(correlationId: string, callback: (err?: any) => void): void {
        this._messages = [];
        this._lockedMessages = {};
        this._cancel = false;

        callback();
    }

    public readMessageCount(callback: (err: any, count: number) => void): void {
        let count = this._messages.length;
        callback(null, count);
    }

    public send(correlationId: string, envelop: MessageEnvelop, callback?: (err: any) => void): void {
        try {
            envelop.sent_time = new Date();
            // Add message to the queue
            this._messages.push(envelop);

            this._counters.incrementOne("queue." + this.getName() + ".sent_messages");
            this._logger.debug(envelop.correlation_id, "Sent message %s via %s", envelop.toString(), this.toString());

            if (callback) callback(null);
        } catch (ex) {
            if (callback) callback(ex);
            else throw ex;
        }
    }

    public peek(correlationId: string, callback: (err: any, result: MessageEnvelop) => void): void {
        try {
            let message: MessageEnvelop = null;

            // Pick a message
            if (this._messages.length > 0)
                message = this._messages[0];

            if (message != null)
                this._logger.trace(message.correlation_id, "Peeked message %s on %s", message, this.toString());

            callback(null, message);
        } catch (ex) {
            callback(ex, null);
        }
    }

    public peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelop[]) => void): void {
        try {
            let messages = this._messages.slice(0, messageCount);
            
            this._logger.trace(correlationId, "Peeked %d messages on %s", messages.length, this.toString());
        
            callback(null, messages);
        } catch (ex) {
            callback(ex, null);
        }
    }

    public receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelop) => void): void {
        let err: any = null;
        let message: MessageEnvelop = null;
        let messageReceived: boolean = false;

        let checkIntervalMs = 100;
        let i = 0;
        async.whilst(
            () => {
                return i < waitTimeout && !messageReceived;
            },
            (whilstCallback) => {
                i = i + checkIntervalMs;

                setTimeout(() => {
                    if (this._messages.length == 0) {
                        whilstCallback();
                        return;
                    }

                    try {
                        // Get message the the queue
                        message = this._messages.shift();

                        if (message != null) {
                            // Generate and set locked token
                            var lockedToken = this._lockTokenSequence++;
                            message.setReference(lockedToken);

                            // Add messages to locked messages list
                            let lockedMessage: LockedMessage = new LockedMessage();
                            let now: Date = new Date();
                            now.setMilliseconds(now.getMilliseconds() + waitTimeout);
                            lockedMessage.expirationTime = now;
                            lockedMessage.message = message;
                            lockedMessage.timeout = waitTimeout;
                            this._lockedMessages[lockedToken] = lockedMessage;
                        }

                        if (message != null) {
                            this._counters.incrementOne("queue." + this.getName() + ".received_messages");
                            this._logger.debug(message.correlation_id, "Received message %s via %s", message, this.toString());
                        }
                    } catch (ex) {
                        err = ex;
                    }

                    messageReceived = true;
                    whilstCallback();
                }, checkIntervalMs);
            },
            (err) => {
                callback(err, message);
            }
        );
    }

    public renewLock(message: MessageEnvelop, lockTimeout: number, callback?: (err: any) => void): void {
        if (message.getReference() == null) {
            if (callback) callback(null);
            return;
        }

        // Get message from locked queue
        try {
            let lockedToken: number = message.getReference();
            let lockedMessage: LockedMessage = this._lockedMessages[lockedToken];

            // If lock is found, extend the lock
            if (lockedMessage) {
                let now: Date = new Date();
                // Todo: Shall we skip if the message already expired?
                if (lockedMessage.expirationTime > now) {
                    now.setMilliseconds(now.getMilliseconds() + lockedMessage.timeout);
                    lockedMessage.expirationTime = now;
                }
            }

            this._logger.trace(message.correlation_id, "Renewed lock for message %s at %s", message, this.toString());

            if (callback) callback(null);
        } catch (ex) {
            if (callback) callback(ex);
            else throw ex;
        }
    }

    public complete(message: MessageEnvelop, callback: (err: any) => void): void {
        if (message.getReference() == null) {
            if (callback) callback(null);
            return;
        }

        try {
            let lockKey: number = message.getReference();
            delete this._lockedMessages[lockKey];
            message.setReference(null);

            this._logger.trace(message.correlation_id, "Completed message %s at %s", message, this.toString());

            if (callback) callback(null);
        } catch (ex) {
            if (callback) callback(ex);
            else throw ex;
        }
    }

    public abandon(message: MessageEnvelop, callback: (err: any) => void): void {
        if (message.getReference() == null) {
            if (callback) callback(null);
            return;
        }

        try {
            // Get message from locked queue
            let lockedToken: number = message.getReference();
            let lockedMessage: LockedMessage = this._lockedMessages[lockedToken];
            if (lockedMessage) {
                // Remove from locked messages
                delete this._lockedMessages[lockedToken];
                message.setReference(null);

                // Skip if it is already expired
                if (lockedMessage.expirationTime <= new Date()) {
                    callback(null);
                    return;
                }
            }
            // Skip if it absent
            else {
                if (callback) callback(null);
                return;
            }

            this._logger.trace(message.correlation_id, "Abandoned message %s at %s", message, this.toString());

            if (callback) callback(null);
        } catch (ex) {
            if (callback) callback(ex);
            else throw ex;
        }

        this.send(message.correlation_id, message, null);
    }

    public moveToDeadLetter(message: MessageEnvelop, callback: (err: any) => void): void {
        if (message.getReference() == null) {
            if (callback) callback(null);
            return;
        }

        try {
            let lockedToken: number = message.getReference();
            delete this._lockedMessages[lockedToken];
            message.setReference(null);

            this._counters.incrementOne("queue." + this.getName() + ".dead_messages");
            this._logger.trace(message.correlation_id, "Moved to dead message %s at %s", message, this.toString());

            if (callback) callback(null);
        } catch (ex) {
            if (callback) callback(ex);
            else throw ex;
        }
    }

    public listen(correlationId: string, receiver: IMessageReceiver): void {
        let timeoutInterval = 1000;

        this._logger.trace(null, "Started listening messages at %s", this.toString());

        this._cancel = false;

        async.whilst(
            () => {
                return !this._cancel;
            },
            (whilstCallback) => {
                let message: MessageEnvelop;

                async.series([
                    (callback) => {
                        this.receive(correlationId, timeoutInterval, (err, result) => {
                            message = result;
                            if (err) this._logger.error(correlationId, err, "Failed to receive the message");
                            callback();
                        })
                    },
                    (callback) => {
                        if (message != null && !this._cancel) {
                            receiver.receiveMessage(message, this, (err) => {
                                if (err) this._logger.error(correlationId, err, "Failed to process the message");
                                callback();
                            });
                        }
                    },
                ]);

                async.series([
                    (callback) => {
                        setTimeout(callback, timeoutInterval);
                    }
                ], whilstCallback);
            },
            (err) => {
                if (err) this._logger.error(correlationId, err, "Failed to process the message");
            }
        );
    }

    public endListen(correlationId: string): void {
        this._cancel = true;
    }

}