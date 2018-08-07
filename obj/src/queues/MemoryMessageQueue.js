"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @module queues */
/** @hidden */
const async = require('async');
const MessageQueue_1 = require("./MessageQueue");
const MessagingCapabilities_1 = require("./MessagingCapabilities");
const LockedMessage_1 = require("./LockedMessage");
class MemoryMessageQueue extends MessageQueue_1.MessageQueue {
    constructor(name) {
        super(name);
        this._messages = [];
        this._lockTokenSequence = 0;
        this._lockedMessages = {};
        this._opened = false;
        this._cancel = false;
        this._capabilities = new MessagingCapabilities_1.MessagingCapabilities(true, true, true, true, true, true, true, false, true);
    }
    isOpen() {
        return this._opened;
    }
    openWithParams(correlationId, connection, credential, callback) {
        this._opened = true;
        callback(null);
    }
    close(correlationId, callback) {
        this._opened = false;
        this._cancel = true;
        this._logger.trace(correlationId, "Closed queue %s", this);
        callback(null);
    }
    clear(correlationId, callback) {
        this._messages = [];
        this._lockedMessages = {};
        this._cancel = false;
        callback();
    }
    readMessageCount(callback) {
        let count = this._messages.length;
        callback(null, count);
    }
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
    endListen(correlationId) {
        this._cancel = true;
    }
}
exports.MemoryMessageQueue = MemoryMessageQueue;
//# sourceMappingURL=MemoryMessageQueue.js.map