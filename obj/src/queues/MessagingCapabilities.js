"use strict";
/** @module queues */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Data object that contains supported capabilities of a message queue.
 * If certain capability is not supported a queue will throw NotImplemented exception.
 */
class MessagingCapabilities {
    /**
     * Creates a new instance of the capabilities object.
     *
     * @param canMessageCount   true if queue supports reading message count.
     * @param canSend           true if queue is able to send messages.
     * @param canReceive        true if queue is able to receive messages.
     * @param canPeek           true if queue is able to peek messages.
     * @param canPeekBatch      true if queue is able to peek multiple messages in one batch.
     * @param canRenewLock      true if queue is able to renew message lock.
     * @param canAbandon        true if queue is able to abandon messages.
     * @param canDeadLetter     true if queue is able to send messages to dead letter queue.
     * @param canClear          true if queue can be cleared.
     */
    constructor(canMessageCount, canSend, canReceive, canPeek, canPeekBatch, canRenewLock, canAbandon, canDeadLetter, canClear) {
        this._canMessageCount = canMessageCount;
        this._canSend = canSend;
        this._canReceive = canReceive;
        this._canPeek = canPeek;
        this._canPeekBatch = canPeekBatch;
        this._canRenewLock = canRenewLock;
        this._canAbandon = canAbandon;
        this._canDeadLetter = canDeadLetter;
        this._canClear = canClear;
    }
    /**
     * Informs if the queue is able to read number of messages.
     *
     * @returns true if queue supports reading message count.
     */
    get canMessageCount() { return this._canMessageCount; }
    /**
     * Informs if the queue is able to send messages.
     *
     * @returns true if queue is able to send messages.
     */
    get canSend() { return this._canSend; }
    /**
     * Informs if the queue is able to receive messages.
     *
     * @returns true if queue is able to receive messages.
     */
    get canReceive() { return this._canReceive; }
    /**
     * Informs if the queue is able to peek messages.
     *
     * @returns true if queue is able to peek messages.
     */
    get canPeek() { return this._canPeek; }
    /**
     * Informs if the queue is able to peek multiple messages in one batch.
     *
     * @returns true if queue is able to peek multiple messages in one batch.
     */
    get canPeekBatch() { return this._canPeekBatch; }
    /**
     * Informs if the queue is able to renew message lock.
     *
     * @returns true if queue is able to renew message lock.
     */
    get canRenewLock() { return this._canRenewLock; }
    /**
     * Informs if the queue is able to abandon messages.
     *
     * @returns true if queue is able to abandon.
     */
    get canAbandon() { return this._canAbandon; }
    /**
     * Informs if the queue is able to send messages to dead letter queue.
     *
     * @returns true if queue is able to send messages to dead letter queue.
     */
    get canDeadLetter() { return this._canDeadLetter; }
    /**
     * Informs if the queue can be cleared.
     *
     * @returns true if queue can be cleared.
     */
    get canClear() { return this._canClear; }
}
exports.MessagingCapabilities = MessagingCapabilities;
//# sourceMappingURL=MessagingCapabilities.js.map