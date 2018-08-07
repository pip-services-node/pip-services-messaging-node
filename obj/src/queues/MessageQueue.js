"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @module queues */
/** @hidden */
var async = require('async');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_components_node_1 = require("pip-services-components-node");
const pip_services_components_node_2 = require("pip-services-components-node");
const pip_services_components_node_3 = require("pip-services-components-node");
const pip_services_components_node_4 = require("pip-services-components-node");
const MessageEnvelope_1 = require("./MessageEnvelope");
class MessageQueue {
    constructor(name) {
        this._logger = new pip_services_components_node_1.CompositeLogger();
        this._counters = new pip_services_components_node_2.CompositeCounters();
        this._connectionResolver = new pip_services_components_node_3.ConnectionResolver();
        this._credentialResolver = new pip_services_components_node_4.CredentialResolver();
        this._name = name;
    }
    getName() { return this._name; }
    getCapabilities() { return this._capabilities; }
    setReferences(references) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }
    configure(config) {
        this._name = pip_services_commons_node_1.NameResolver.resolve(config, this._name);
        this._logger.configure(config);
        this._connectionResolver.configure(config);
        this._credentialResolver.configure(config);
    }
    open(correlationId, callback) {
        let connection;
        let credential;
        async.series([
            (callback) => {
                this._connectionResolver.resolve(correlationId, (err, result) => {
                    connection = result;
                    callback(err);
                });
            },
            (callback) => {
                this._credentialResolver.lookup(correlationId, (err, result) => {
                    credential = result;
                    callback(err);
                });
            }
        ]);
        this.openWithParams(correlationId, connection, credential, callback);
    }
    sendAsObject(correlationId, messageType, message, callback) {
        var envelope = new MessageEnvelope_1.MessageEnvelope(correlationId, messageType, message);
        this.send(correlationId, envelope, callback);
    }
    beginListen(correlationId, receiver) {
        setImmediate(() => {
            this.listen(correlationId, receiver);
        });
    }
    toString() {
        return "[" + this.getName() + "]";
    }
}
exports.MessageQueue = MessageQueue;
//# sourceMappingURL=MessageQueue.js.map