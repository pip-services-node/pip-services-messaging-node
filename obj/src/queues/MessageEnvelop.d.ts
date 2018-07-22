/// <reference types="node" />
export declare class MessageEnvelop {
    private _reference;
    constructor(correlationId: string, messageType: string, message: any);
    correlation_id: string;
    message_id: string;
    message_type: string;
    sent_time: Date;
    message: Buffer;
    getReference(): any;
    setReference(value: any): void;
    getMessageAsString(): string;
    setMessageAsString(value: string): void;
    getMessageAsJson(): any;
    setMessageAsJson(value: any): void;
    toString(): string;
}
