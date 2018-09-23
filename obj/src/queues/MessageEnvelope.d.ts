/// <reference types="node" />
/**
 * Allows adding additional information to messages. A correlation id, message id, and a message type
 * are added to the data being sent/received. Additionally, a MessageEnvelope can reference a lock token.
 *
 * Side note: a MessageEnvelope's message is stored as a buffer, so strings are converted
 * using utf8 conversions.
 */
export declare class MessageEnvelope {
    private _reference;
    /**
     * Creates a new MessageEnvelope, which adds a correlation id, message id, and a type to the
     * data being sent/received.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageType       a string value that defines the message's type.
     * @param message           the data being sent/received.
     */
    constructor(correlationId: string, messageType: string, message: any);
    /** The unique business transaction id that is used to trace calls across components. */
    correlation_id: string;
    /** The message's auto-generated ID. */
    message_id: string;
    /** String value that defines the stored message's type. */
    message_type: string;
    /** The time at which the message was sent. */
    sent_time: Date;
    /** The stored message. */
    message: Buffer;
    /**
     * @returns the lock token that this MessageEnvelope references.
     */
    getReference(): any;
    /**
     * Sets a lock token reference for this MessageEnvelope.
     *
     * @param value     the lock token to reference.
     */
    setReference(value: any): void;
    /**
     * @returns the information stored in this message as a UTF-8 encoded string.
     */
    getMessageAsString(): string;
    /**
     * Stores the given string.
     *
     * @param value     the string to set. Will be converted to
     *                  a buffer, using UTF-8 encoding.
     */
    setMessageAsString(value: string): void;
    /**
     * @returns the value that was stored in this message
     *          as a JSON string.
     *
     * @see [[setMessageAsJson]]
     */
    getMessageAsJson(): any;
    /**
     * Stores the given value as a JSON string.
     *
     * @param value     the value to convert to JSON and store in
     *                  this message.
     *
     * @see [[getMessageAsJson]]
     */
    setMessageAsJson(value: any): void;
    /**
     * Convert's this MessageEnvelope to a string, using the following format:
     *
     * <code>"[<correlation_id>,<message_type>,<message.toString>]"</code>.
     *
     * If any of the values are <code>null</code>, they will be replaced with <code>---</code>.
     *
     * @returns the generated string.
     */
    toString(): string;
}
