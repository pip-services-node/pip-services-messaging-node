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
    constructor(canMessageCount: boolean, canSend: boolean, canReceive: boolean, canPeek: boolean, canPeekBatch: boolean, canRenewLock: boolean, canAbandon: boolean, canDeadLetter: boolean, canClear: boolean);
    readonly canMessageCount: boolean;
    readonly canSend: boolean;
    readonly canReceive: boolean;
    readonly canPeek: boolean;
    readonly canPeekBatch: boolean;
    readonly canRenewLock: boolean;
    readonly canAbandon: boolean;
    readonly canDeadLetter: boolean;
    readonly canClear: boolean;
}
