/** @module queues */
/** @hidden */
const async = require('async');

import { ConnectionParams } from 'pip-services-components-node';
import { CredentialParams } from 'pip-services-components-node';

import { IMessageReceiver } from './IMessageReceiver';
import { MessageQueue } from './MessageQueue';
import { MessageEnvelope } from './MessageEnvelope';
import { MessagingCapabilities } from './MessagingCapabilities';
import { LockedMessage } from './LockedMessage';

/**
 * In-memory implementation of the abstract [[MessageQueue]] class. Capable of performing all queue actions, 
 * with the exception of moving messages to a dead letter queue.
 * 
 * @see [[MessageQueue]]
 * @see [[MessagingCapabilities]]
 */
export class MemoryMessageQueue extends MessageQueue {
    private _messages: MessageEnvelope[] = [];
    private _lockTokenSequence: number = 0;
    private _lockedMessages: { [id: number]: LockedMessage; } = {};
    private _opened: boolean = false;
    /** Used to stop the listening process. */
    private _cancel: boolean = false;

    /**
     * Creates a new MemoryMessageQueue, which is capable of performing all queue actions, 
     * except for moving messages to a dead letter queue.
     * 
     * @param name  the queue's name.
     * 
     * @see [[MessagingCapabilities]]
     */
    public constructor(name?: string) {
        super(name);
        this._capabilities = new MessagingCapabilities(true, true, true, true, true, true, true, false, true);
    }

    /**
     * @returns whether or not this queue is currently open.
     */
    public isOpen(): boolean {
        return this._opened;
    }

    /**
     * Since a memory queue does not establish any connections, simply sets this queue to 
     * "opened" and calls the callback with <code>null</code>. 
     * 
     * When overriding this method in child classes that require a connection to be established, 
     * use the provided connection parameters to establish the connection and the credential 
     * parameters for authentication.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param connection        the parameters of the connection.
     * @param credential        the credentials to use for authentication.
     * @param callback          the function to call once the connection has been opened.
     *                          Will be called with an error if one is raised.
     */
    protected openWithParams(correlationId: string, connection: ConnectionParams, credential: CredentialParams, callback: (err: any) => void): void {
        this._opened = true;
        callback(null);
    }

    /**
     * Closes this queue.
     * 
     * When overriding this method in child classes that establish a connection upon being opened, 
     * make sure to close the connection that was previously opened, before calling the callback.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param callback          the function to call once the connection has been closed.
     *                          Will be called with an error if one is raised.
     */
    public close(correlationId: string, callback: (err: any) => void): void {
        this._opened = false;
        this._cancel = true;
        this._logger.trace(correlationId, "Closed queue %s", this);
        callback(null);
    }

    /**
     * Clears this queue's messages (including locked messages).
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param callback          the function to call once the queue has been cleared.
     *                          Will be called with an error if one is raised.
     */
    public clear(correlationId: string, callback: (err?: any) => void): void {
        this._messages = [];
        this._lockedMessages = {};
        this._cancel = false;

        callback();
    }

    /**
     * Counts the amount of messages currently in the queue.
     * 
     * @param callback      the function to call with the number of messages in the queue 
     *                      (or with an error, if one is rasied).
     */
    public readMessageCount(callback: (err: any, count: number) => void): void {
        let count = this._messages.length;
        callback(null, count);
    }

    /**
     * Sends a [[MessageEnvelope]] to the queue and sets its sent time to the current time.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param envelope          the MessageEnvelope to send.
     * @param callback          (optional) the function to call once sending is complete.
     *                          Will be called with an error if one is raised.
     * 
     * @see [[MessageEnvelope]]
     */
    public send(correlationId: string, envelope: MessageEnvelope, callback?: (err: any) => void): void {
        try {
            envelope.sent_time = new Date();
            // Add message to the queue
            this._messages.push(envelope);

            this._counters.incrementOne("queue." + this.getName() + ".sent_messages");
            this._logger.debug(envelope.correlation_id, "Sent message %s via %s", envelope.toString(), this.toString());

            if (callback) callback(null);
        } catch (ex) {
            if (callback) callback(ex);
            else throw ex;
        }
    }

    /**
     * Reads the next message without removing it from the queue.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param callback          the function to call with the peeked message 
     *                          (or with an error, if one is raised).
     */
    public peek(correlationId: string, callback: (err: any, result: MessageEnvelope) => void): void {
        try {
            let message: MessageEnvelope = null;

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

    /**
     * Reads a batch of messages without removing them from the queue.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param messageCount      the number of message to peek.
     * @param callback          the function to call with the peeked messages 
     *                          (or with an error, if one is raised).
     */
    public peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelope[]) => void): void {
        try {
            let messages = this._messages.slice(0, messageCount);
            
            this._logger.trace(correlationId, "Peeked %d messages on %s", messages.length, this.toString());
        
            callback(null, messages);
        } catch (ex) {
            callback(ex, null);
        }
    }

    /**
     * Waits the given amount of time for a message to arrive in the queue (if it is empty) and, once one arrives, 
     * removes it from the queue and locks it for processing. If the queue already contains messages then the next 
     * one will be received.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param waitTimeout       the amount of time to wait for a message to arrive. Will be 
     *                          set as the lock's timeout as well.
     * @param callback          the function to call with the received message 
     *                          (or with an error, if one is raised).
     */
    public receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelope) => void): void {
        let err: any = null;
        let message: MessageEnvelope = null;
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

    /**
     * Renews the given message's lock. This method only renews locks that have already
     * expired.
     * 
     * @param message       the message to renew a lock for.
     * @param lockTimeout   the lock's new timeout. NOT USED in this method - the lock's
     *                      timeout will be extended using the timeout set in the lock itself.
     * @param callback      (optional) the function to call once the lock has been renewed.
     *                      Will be called with an error if one is raised.
     */
    public renewLock(message: MessageEnvelope, lockTimeout: number, callback?: (err: any) => void): void {
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

    /**
     * Completes the processing of a locked message and removes its lock.
     * 
     * @param message   the message to complete.
     * @param callback  the function to call once the message has been completed.
     *                  Will be called with an error if one is raised.
     */
    public complete(message: MessageEnvelope, callback: (err: any) => void): void {
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

    /**
     * Abandons the processing of a locked message and removes its lock.
     * 
     * @param message   the message to abandon.
     * @param callback  the function to call once the message has been abandoned.
     *                  Will be called with an error if one is raised.
     */
    public abandon(message: MessageEnvelope, callback: (err: any) => void): void {
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

    /**
     * Moves a locked message to the dead letter queue. Since this class does not support 
     * moving message to a dead letter queue, the message will actually be abandoned. Logs 
     * and counters, however, will log and count the message as a dead message.
     * 
     * @param message   the dead letter.
     * @param callback  the function to call once the message has been moved.
     *                  Will be called with an error if one is raised.
     */
    public moveToDeadLetter(message: MessageEnvelope, callback: (err: any) => void): void {
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

    /**
     * Makes the queue start listening for a message and, if one is [[receive received]], passes
     * it to the given message receiver for processing.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param receiver          the message receiver to pass the received message to.
     * 
     * @see [[IMessageReceiver]]
     * @see [[receive]]
     */
    public listen(correlationId: string, receiver: IMessageReceiver): void {
        let timeoutInterval = 1000;

        this._logger.trace(null, "Started listening messages at %s", this.toString());

        this._cancel = false;

        async.whilst(
            () => {
                return !this._cancel;
            },
            (whilstCallback) => {
                let message: MessageEnvelope;

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

    /**
     * Makes the queue stop listening for messages.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     */
    public endListen(correlationId: string): void {
        this._cancel = true;
    }

}