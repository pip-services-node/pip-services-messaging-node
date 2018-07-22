"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class MessagingCapabilities {
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
    get canMessageCount() { return this._canMessageCount; }
    get canSend() { return this._canSend; }
    get canReceive() { return this._canReceive; }
    get canPeek() { return this._canPeek; }
    get canPeekBatch() { return this._canPeekBatch; }
    get canRenewLock() { return this._canRenewLock; }
    get canAbandon() { return this._canAbandon; }
    get canDeadLetter() { return this._canDeadLetter; }
    get canClear() { return this._canClear; }
}
exports.MessagingCapabilities = MessagingCapabilities;
//# sourceMappingURL=MessagingCapabilities.js.map