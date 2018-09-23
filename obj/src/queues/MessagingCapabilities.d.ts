/** @module queues */
/**
 * Data object that contains supported capabilities of a message queue.
 * If certain capability is not supported a queue will throw NotImplemented exception.
 */
export declare class MessagingCapabilities {
    private _canMessageCount;
    private _canSend;
    private _canReceive;
    private _canPeek;
    private _canPeekBatch;
    private _canRenewLock;
    private _canAbandon;
    private _canDeadLetter;
    private _canClear;
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
    constructor(canMessageCount: boolean, canSend: boolean, canReceive: boolean, canPeek: boolean, canPeekBatch: boolean, canRenewLock: boolean, canAbandon: boolean, canDeadLetter: boolean, canClear: boolean);
    /**
     * Informs if the queue is able to read number of messages.
     *
     * @returns true if queue supports reading message count.
     */
    readonly canMessageCount: boolean;
    /**
     * Informs if the queue is able to send messages.
     *
     * @returns true if queue is able to send messages.
     */
    readonly canSend: boolean;
    /**
     * Informs if the queue is able to receive messages.
     *
     * @returns true if queue is able to receive messages.
     */
    readonly canReceive: boolean;
    /**
     * Informs if the queue is able to peek messages.
     *
     * @returns true if queue is able to peek messages.
     */
    readonly canPeek: boolean;
    /**
     * Informs if the queue is able to peek multiple messages in one batch.
     *
     * @returns true if queue is able to peek multiple messages in one batch.
     */
    readonly canPeekBatch: boolean;
    /**
     * Informs if the queue is able to renew message lock.
     *
     * @returns true if queue is able to renew message lock.
     */
    readonly canRenewLock: boolean;
    /**
     * Informs if the queue is able to abandon messages.
     *
     * @returns true if queue is able to abandon.
     */
    readonly canAbandon: boolean;
    /**
     * Informs if the queue is able to send messages to dead letter queue.
     *
     * @returns true if queue is able to send messages to dead letter queue.
     */
    readonly canDeadLetter: boolean;
    /**
     * Informs if the queue can be cleared.
     *
     * @returns true if queue can be cleared.
     */
    readonly canClear: boolean;
}
