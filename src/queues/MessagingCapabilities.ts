/** @module queues */
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

    public get canMessageCount(): boolean { return this._canMessageCount; }
    public get canSend(): boolean { return this._canSend; }
    public get canReceive(): boolean { return this._canReceive; }
    public get canPeek(): boolean { return this._canPeek; }
    public get canPeekBatch(): boolean { return this._canPeekBatch; }
    public get canRenewLock(): boolean { return this._canRenewLock; }
    public get canAbandon(): boolean { return this._canAbandon; }
    public get canDeadLetter(): boolean { return this._canDeadLetter; }
    public get canClear(): boolean { return this._canClear; }
}