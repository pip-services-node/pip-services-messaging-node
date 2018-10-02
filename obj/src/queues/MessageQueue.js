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
/**
 * Abstract message queue that is used as a basis for specific message queue implementations.
 *
 * ### Configuration parameters ###
 *
 * name:                        name of the message queue
 *
 * connection(s):
 *   - discovery_key:             key to retrieve parameters from discovery service
 *   - protocol:                  connection protocol like http, https, tcp, udp
 *   - host:                      host name or IP address
 *   - port:                      port number
 *   - uri:                       resource URI or connection string with all parameters in it
 *
 * credential(s):
 *   - store_key:                 key to retrieve parameters from credential store
 *   - username:                  user name
 *   - password:                  user password
 *   - access_id:                 application access id
 *   - access_key:                application secret key
 *
 * ### References ###
 *
 * - <code>*:logger:*:*:1.0</code>           (optional) [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/interfaces/log.ilogger.html ILogger]] components to pass log messages
 * - <code>*:counters:*:*:1.0</code>         (optional) [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/interfaces/count.icounters.html ICounters]] components to pass collected measurements
 * - <code>*:discovery:*:*:1.0</code>        (optional) [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/interfaces/connect.idiscovery.html IDiscovery]] components to discover connection(s)
 * - <code>*:credential-store:*:*:1.0</code> (optional) [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/interfaces/auth.icredentialstore.html ICredentialStore]] componetns to lookup credential(s)
 */
class MessageQueue {
    /**
     * Creates a new instance of the message queue.
     *
     * @param name  (optional) a queue name
     */
    constructor(name) {
        this._logger = new pip_services_components_node_1.CompositeLogger();
        this._counters = new pip_services_components_node_2.CompositeCounters();
        this._connectionResolver = new pip_services_components_node_3.ConnectionResolver();
        this._credentialResolver = new pip_services_components_node_4.CredentialResolver();
        this._name = name;
    }
    /**
     * Gets the queue name
     *
     * @returns the queue name.
     */
    getName() { return this._name; }
    /**
     * Gets the queue capabilities
     *
     * @returns the queue's capabilities object.
     */
    getCapabilities() { return this._capabilities; }
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config) {
        this._name = pip_services_commons_node_1.NameResolver.resolve(config, this._name);
        this._logger.configure(config);
        this._connectionResolver.configure(config);
        this._credentialResolver.configure(config);
    }
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
        this._credentialResolver.setReferences(references);
    }
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
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
    /**
     * Sends an object into the queue.
     * Before sending the object is converted into JSON string and wrapped in a [[MessageEnvelop]].
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageType       a message type
     * @param value             an object value to be sent
     * @param callback          (optional) callback function that receives error or null for success.
     *
     * @see [[send]]
     */
    sendAsObject(correlationId, messageType, message, callback) {
        var envelope = new MessageEnvelope_1.MessageEnvelope(correlationId, messageType, message);
        this.send(correlationId, envelope, callback);
    }
    /**
     * Listens for incoming messages without blocking the current thread.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param receiver          a receiver to receive incoming messages.
     *
     * @see [[listen]]
     * @see [[IMessageReceiver]]
     */
    beginListen(correlationId, receiver) {
        setImmediate(() => {
            this.listen(correlationId, receiver);
        });
    }
    /**
     * Gets a string representation of the object.
     *
     * @returns a string representation of the object.
     */
    toString() {
        return "[" + this.getName() + "]";
    }
}
exports.MessageQueue = MessageQueue;
//# sourceMappingURL=MessageQueue.js.map