"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
class MessageEnvelop {
    constructor(correlationId, messageType, message) {
        this.correlation_id = correlationId;
        this.message_type = messageType;
        this.message = message != null ? Buffer.from(message) : null;
        this.message_id = pip_services_commons_node_1.IdGenerator.nextLong();
    }
    getReference() {
        return this._reference;
    }
    setReference(value) {
        this._reference = value;
    }
    getMessageAsString() {
        return this.message != null ? this.message.toString('utf8') : null;
    }
    setMessageAsString(value) {
        this.message = Buffer.from(value, 'utf8');
    }
    getMessageAsJson() {
        if (this.message == null)
            return null;
        let temp = this.message.toString();
        return JSON.parse(temp);
    }
    setMessageAsJson(value) {
        if (value == null)
            this.message = null;
        else {
            let temp = JSON.stringify(value);
            this.message = Buffer.from(temp, 'utf8');
        }
    }
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
exports.MessageEnvelop = MessageEnvelop;
//# sourceMappingURL=MessageEnvelop.js.map