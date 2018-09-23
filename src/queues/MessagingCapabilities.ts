/** @module queues */

/**
 * Data object that contains supported capabilities of a message queue.
 * If certain capability is not supported a queue will throw NotImplemented exception.
 */
export class MessagingCapabilities {
    private _canMessageCount: boolean;
    private _canSend: boolean;
    private _canReceive: boolean;
    private _canPeek: boolean;
    private _canPeekBatch: boolean;
    private _canRenewLock: boolean;
    private _canAbandon: boolean;
    private _canDeadLetter: boolean;
    private _canClear: boolean;

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
    public constructor(canMessageCount: boolean, canSend: boolean, canReceive: boolean, 
        canPeek: boolean, canPeekBatch: boolean, canRenewLock: boolean, canAbandon: boolean, 
        canDeadLetter: boolean, canClear: boolean) {
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
    public get canMessageCount(): boolean { return this._canMessageCount; }

    /**
     * Informs if the queue is able to send messages.
     * 
     * @returns true if queue is able to send messages.
     */
    public get canSend(): boolean { return this._canSend; }
    
    /**
     * Informs if the queue is able to receive messages.
     * 
     * @returns true if queue is able to receive messages.
     */
    public get canReceive(): boolean { return this._canReceive; }
    
    /**
     * Informs if the queue is able to peek messages.
     * 
     * @returns true if queue is able to peek messages.
     */
    public get canPeek(): boolean { return this._canPeek; }
    
    /**
     * Informs if the queue is able to peek multiple messages in one batch.
     * 
     * @returns true if queue is able to peek multiple messages in one batch.
     */
    public get canPeekBatch(): boolean { return this._canPeekBatch; }
    
    /**
     * Informs if the queue is able to renew message lock.
     * 
     * @returns true if queue is able to renew message lock.
     */
    public get canRenewLock(): boolean { return this._canRenewLock; }
    
    /**
     * Informs if the queue is able to abandon messages.
     * 
     * @returns true if queue is able to abandon.
     */
    public get canAbandon(): boolean { return this._canAbandon; }
    
    /**
     * Informs if the queue is able to send messages to dead letter queue.
     * 
     * @returns true if queue is able to send messages to dead letter queue.
     */
    public get canDeadLetter(): boolean { return this._canDeadLetter; }
    
    /**
     * Informs if the queue can be cleared.
     * 
     * @returns true if queue can be cleared.
     */
    public get canClear(): boolean { return this._canClear; }
}