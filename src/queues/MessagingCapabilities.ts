/** @module queues */
/**
 * Used to define what a message queue is capable of.
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
     * 
     * @param canMessageCount   whether or not the queue's amount of messages can be counted.
     * @param canSend           whether or not messages can be sent.
     * @param canReceive        whether or not messages can be received.
     * @param canPeek           whether or not messages can be peeked.
     * @param canPeekBatch      whether or not multiple messages can be peeked at once.
     * @param canRenewLock      whether or not a message's lock can be renewed.
     * @param canAbandon        whether or not the queue can abandon a message.
     * @param canDeadLetter     whether or not the queue can move messages to a dead letter queue.
     * @param canClear          whether or not the queue can be cleared.
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

    /** Whether or not the queue's amount of messages can be counted. */
    public get canMessageCount(): boolean { return this._canMessageCount; }
    /** Whether or not messages can be sent. */
    public get canSend(): boolean { return this._canSend; }
    /** Whether or not messages can be received. */
    public get canReceive(): boolean { return this._canReceive; }
    /** Whether or not messages can be peeked. */
    public get canPeek(): boolean { return this._canPeek; }
    /** Whether or not multiple messages can be peeked at once. */
    public get canPeekBatch(): boolean { return this._canPeekBatch; }
    /** Whether or not a message's lock can be renewed. */
    public get canRenewLock(): boolean { return this._canRenewLock; }
    /** Whether or not the queue can abandon a message. */
    public get canAbandon(): boolean { return this._canAbandon; }
    /** Whether or not the queue can move messages to a dead letter queue. */
    public get canDeadLetter(): boolean { return this._canDeadLetter; }
    /** Whether or not the queue can be cleared. */
    public get canClear(): boolean { return this._canClear; }
}