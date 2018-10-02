"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @module queues */
/** @hidden */
const async = require('async');
const MessageQueue_1 = require("./MessageQueue");
const MessagingCapabilities_1 = require("./MessagingCapabilities");
const LockedMessage_1 = require("./LockedMessage");
/**
 * Message queue that sends and receives messages within the same process by using shared memory.
 *
 * This queue is typically used for testing to mock real queues.
 *
 * ### Configuration parameters ###
 *
 * name:                        name of the message queue
 *
 * ### References ###
 *
 * - <code>*:logger:*:*:1.0</code>           (optional) [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>*:counters:*:*:1.0</code>         (optional) [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 *
 * @see [[MessageQueue]]
 * @see [[MessagingCapabilities]]
 *
 * ### Example ###
 *
 *     let queue = new MessageQueue("myqueue");
 *
 *     queue.send("123", new MessageEnvelop(null, "mymessage", "ABC"));
 *
 *     queue.receive("123", (err, message) => {
 *         if (message != null) {
 *            ...
 *            queue.complete("123", message);
 *         }
 *     });
 */
class MemoryMessageQueue extends MessageQueue_1.MessageQueue {
    /**
     * Creates a new instance of the message queue.
     *
     * @param name  (optional) a queue name.
     *
     * @see [[MessagingCapabilities]]
     */
    constructor(name) {
        super(name);
        this._messages = [];
        this._lockTokenSequence = 0;
        this._lockedMessages = {};
        this._opened = false;
        /** Used to stop the listening process. */
        this._cancel = false;
        this._capabilities = new MessagingCapabilities_1.MessagingCapabilities(true, true, true, true, true, true, true, false, true);
    }
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    isOpen() {
        return this._opened;
    }
    /**
     * Opens the component with given connection and credential parameters.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param connection        connection parameters
     * @param credential        credential parameters
     * @param callback 			callback function that receives error or null no errors occured.
     */
    openWithParams(correlationId, connection, credential, callback) {
        this._opened = true;
        callback(null);
    }
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    close(correlationId, callback) {
        this._opened = false;
        this._cancel = true;
        this._logger.trace(correlationId, "Closed queue %s", this);
        callback(null);
    }
    /**
     * Clears component state.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    clear(correlationId, callback) {
        this._messages = [];
        this._lockedMessages = {};
        this._cancel = false;
        callback();
    }
    /**
     * Reads the current number of messages in the queue to be delivered.
     *
     * @param callback      callback function that receives number of messages or error.
     */
    readMessageCount(callback) {
        let count = this._messages.length;
        callback(null, count);
    }
    /**
     * Sends a message into the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param envelope          a message envelop to be sent.
     * @param callback          (optional) callback function that receives error or null for success.
     */
    send(correlationId, envelope, callback) {
        try {
            envelope.sent_time = new Date();
            // Add message to the queue
            this._messages.push(envelope);
            this._counters.incrementOne("queue." + this.getName() + ".sent_messages");
            this._logger.debug(envelope.correlation_id, "Sent message %s via %s", envelope.toString(), this.toString());
            if (callback)
                callback(null);
        }
        catch (ex) {
            if (callback)
                callback(ex);
            else
                throw ex;
        }
    }
    /**
     * Peeks a single incoming message from the queue without removing it.
     * If there are no messages available in the queue it returns null.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param callback          callback function that receives a message or error.
     */
    peek(correlationId, callback) {
        try {
            let message = null;
            // Pick a message
            if (this._messages.length > 0)
                message = this._messages[0];
            if (message != null)
                this._logger.trace(message.correlation_id, "Peeked message %s on %s", message, this.toString());
            callback(null, message);
        }
        catch (ex) {
            callback(ex, null);
        }
    }
    /**
     * Peeks multiple incoming messages from the queue without removing them.
     * If there are no messages available in the queue it returns an empty list.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageCount      a maximum number of messages to peek.
     * @param callback          callback function that receives a list with messages or error.
     */
    peekBatch(correlationId, messageCount, callback) {
        try {
            let messages = this._messages.slice(0, messageCount);
            this._logger.trace(correlationId, "Peeked %d messages on %s", messages.length, this.toString());
            callback(null, messages);
        }
        catch (ex) {
            callback(ex, null);
        }
    }
    /**
     * Receives an incoming message and removes it from the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param waitTimeout       a timeout in milliseconds to wait for a message to come.
     * @param callback          callback function that receives a message or error.
     */
    receive(correlationId, waitTimeout, callback) {
        let err = null;
        let message = null;
        let messageReceived = false;
        let checkIntervalMs = 100;
        let i = 0;
        async.whilst(() => {
            return i < waitTimeout && !messageReceived;
        }, (whilstCallback) => {
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
                        let lockedMessage = new LockedMessage_1.LockedMessage();
                        let now = new Date();
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
                }
                catch (ex) {
                    err = ex;
                }
                messageReceived = true;
                whilstCallback();
            }, checkIntervalMs);
        }, (err) => {
            callback(err, message);
        });
    }
    /**
     * Renews a lock on a message that makes it invisible from other receivers in the queue.
     * This method is usually used to extend the message processing time.
     *
     * @param message       a message to extend its lock.
     * @param lockTimeout   a locking timeout in milliseconds.
     * @param callback      (optional) callback function that receives an error or null for success.
     */
    renewLock(message, lockTimeout, callback) {
        if (message.getReference() == null) {
            if (callback)
                callback(null);
            return;
        }
        // Get message from locked queue
        try {
            let lockedToken = message.getReference();
            let lockedMessage = this._lockedMessages[lockedToken];
            // If lock is found, extend the lock
            if (lockedMessage) {
                let now = new Date();
                // Todo: Shall we skip if the message already expired?
                if (lockedMessage.expirationTime > now) {
                    now.setMilliseconds(now.getMilliseconds() + lockedMessage.timeout);
                    lockedMessage.expirationTime = now;
                }
            }
            this._logger.trace(message.correlation_id, "Renewed lock for message %s at %s", message, this.toString());
            if (callback)
                callback(null);
        }
        catch (ex) {
            if (callback)
                callback(ex);
            else
                throw ex;
        }
    }
    /**
     * Permanently removes a message from the queue.
     * This method is usually used to remove the message after successful processing.
     *
     * @param message   a message to remove.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    complete(message, callback) {
        if (message.getReference() == null) {
            if (callback)
                callback(null);
            return;
        }
        try {
            let lockKey = message.getReference();
            delete this._lockedMessages[lockKey];
            message.setReference(null);
            this._logger.trace(message.correlation_id, "Completed message %s at %s", message, this.toString());
            if (callback)
                callback(null);
        }
        catch (ex) {
            if (callback)
                callback(ex);
            else
                throw ex;
        }
    }
    /**
     * Returnes message into the queue and makes it available for all subscribers to receive it again.
     * This method is usually used to return a message which could not be processed at the moment
     * to repeat the attempt. Messages that cause unrecoverable errors shall be removed permanently
     * or/and send to dead letter queue.
     *
     * @param message   a message to return.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    abandon(message, callback) {
        if (message.getReference() == null) {
            if (callback)
                callback(null);
            return;
        }
        try {
            // Get message from locked queue
            let lockedToken = message.getReference();
            let lockedMessage = this._lockedMessages[lockedToken];
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
                if (callback)
                    callback(null);
                return;
            }
            this._logger.trace(message.correlation_id, "Abandoned message %s at %s", message, this.toString());
            if (callback)
                callback(null);
        }
        catch (ex) {
            if (callback)
                callback(ex);
            else
                throw ex;
        }
        this.send(message.correlation_id, message, null);
    }
    /**
     * Permanently removes a message from the queue and sends it to dead letter queue.
     *
     * @param message   a message to be removed.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    moveToDeadLetter(message, callback) {
        if (message.getReference() == null) {
            if (callback)
                callback(null);
            return;
        }
        try {
            let lockedToken = message.getReference();
            delete this._lockedMessages[lockedToken];
            message.setReference(null);
            this._counters.incrementOne("queue." + this.getName() + ".dead_messages");
            this._logger.trace(message.correlation_id, "Moved to dead message %s at %s", message, this.toString());
            if (callback)
                callback(null);
        }
        catch (ex) {
            if (callback)
                callback(ex);
            else
                throw ex;
        }
    }
    /**
     * Listens for incoming messages and blocks the current thread until queue is closed.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param receiver          a receiver to receive incoming messages.
     *
     * @see [[IMessageReceiver]]
     * @see [[receive]]
     */
    listen(correlationId, receiver) {
        let timeoutInterval = 1000;
        this._logger.trace(null, "Started listening messages at %s", this.toString());
        this._cancel = false;
        async.whilst(() => {
            return !this._cancel;
        }, (whilstCallback) => {
            let message;
            async.series([
                (callback) => {
                    this.receive(correlationId, timeoutInterval, (err, result) => {
                        message = result;
                        if (err)
                            this._logger.error(correlationId, err, "Failed to receive the message");
                        callback();
                    });
                },
                (callback) => {
                    if (message != null && !this._cancel) {
                        receiver.receiveMessage(message, this, (err) => {
                            if (err)
                                this._logger.error(correlationId, err, "Failed to process the message");
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
        }, (err) => {
            if (err)
                this._logger.error(correlationId, err, "Failed to process the message");
        });
    }
    /**
     * Ends listening for incoming messages.
     * When this method is call [[listen]] unblocks the thread and execution continues.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    endListen(correlationId) {
        this._cancel = true;
    }
}
exports.MemoryMessageQueue = MemoryMessageQueue;
//# sourceMappingURL=MemoryMessageQueue.js.map