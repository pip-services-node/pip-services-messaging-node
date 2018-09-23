"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @module queues */
const pip_services_commons_node_1 = require("pip-services-commons-node");
//TODO: UTF-8 important?
/**
 * Allows adding additional information to messages. A correlation id, message id, and a message type
 * are added to the data being sent/received. Additionally, a MessageEnvelope can reference a lock token.
 *
 * Side note: a MessageEnvelope's message is stored as a buffer, so strings are converted
 * using utf8 conversions.
 */
class MessageEnvelope {
    /**
     * Creates a new MessageEnvelope, which adds a correlation id, message id, and a type to the
     * data being sent/received.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageType       a string value that defines the message's type.
     * @param message           the data being sent/received.
     */
    constructor(correlationId, messageType, message) {
        this.correlation_id = correlationId;
        this.message_type = messageType;
        this.message = message != null ? Buffer.from(message) : null;
        this.message_id = pip_services_commons_node_1.IdGenerator.nextLong();
    }
    /**
     * @returns the lock token that this MessageEnvelope references.
     */
    getReference() {
        return this._reference;
    }
    /**
     * Sets a lock token reference for this MessageEnvelope.
     *
     * @param value     the lock token to reference.
     */
    setReference(value) {
        this._reference = value;
    }
    /**
     * @returns the information stored in this message as a UTF-8 encoded string.
     */
    getMessageAsString() {
        return this.message != null ? this.message.toString('utf8') : null;
    }
    /**
     * Stores the given string.
     *
     * @param value     the string to set. Will be converted to
     *                  a buffer, using UTF-8 encoding.
     */
    setMessageAsString(value) {
        this.message = Buffer.from(value, 'utf8');
    }
    /**
     * @returns the value that was stored in this message
     *          as a JSON string.
     *
     * @see [[setMessageAsJson]]
     */
    getMessageAsJson() {
        if (this.message == null)
            return null;
        let temp = this.message.toString();
        return JSON.parse(temp);
    }
    /**
     * Stores the given value as a JSON string.
     *
     * @param value     the value to convert to JSON and store in
     *                  this message.
     *
     * @see [[getMessageAsJson]]
     */
    setMessageAsJson(value) {
        if (value == null)
            this.message = null;
        else {
            let temp = JSON.stringify(value);
            this.message = Buffer.from(temp, 'utf8');
        }
    }
    /**
     * Convert's this MessageEnvelope to a string, using the following format:
     *
     * <code>"[<correlation_id>,<message_type>,<message.toString>]"</code>.
     *
     * If any of the values are <code>null</code>, they will be replaced with <code>---</code>.
     *
     * @returns the generated string.
     */
    toString() {
        var builder = '[';
        builder += this.correlation_id || "---";
        builder += ',';
        builder += this.message_type || "---";
        builder += ',';
        builder += this.message ? this.message.toString('utf8', 0, 50) : "---";
        builder += ']';
        return builder;
    }
}
exports.MessageEnvelope = MessageEnvelope;
//# sourceMappingURL=MessageEnvelope.js.map