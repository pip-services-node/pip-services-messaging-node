import { IReferenceable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { CompositeLogger } from 'pip-services-components-node';
import { CompositeCounters } from 'pip-services-components-node';
import { ConnectionResolver } from 'pip-services-components-node';
import { CredentialResolver } from 'pip-services-components-node';
import { ConnectionParams } from 'pip-services-components-node';
import { CredentialParams } from 'pip-services-components-node';
import { IMessageQueue } from './IMessageQueue';
import { IMessageReceiver } from './IMessageReceiver';
import { MessagingCapabilities } from './MessagingCapabilities';
import { MessageEnvelope } from './MessageEnvelope';
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
export declare abstract class MessageQueue implements IMessageQueue, IReferenceable, IConfigurable {
    protected _logger: CompositeLogger;
    protected _counters: CompositeCounters;
    protected _connectionResolver: ConnectionResolver;
    protected _credentialResolver: CredentialResolver;
    protected _name: string;
    protected _capabilities: MessagingCapabilities;
    /**
     * Creates a new instance of the message queue.
     *
     * @param name  (optional) a queue name
     */
    constructor(name?: string);
    /**
     * Gets the queue name
     *
     * @returns the queue name.
     */
    getName(): string;
    /**
     * Gets the queue capabilities
     *
     * @returns the queue's capabilities object.
     */
    getCapabilities(): MessagingCapabilities;
    /**
     * Configures component by passing configuration parameters.
     *
     * @param config    configuration parameters to be set.
     */
    configure(config: ConfigParams): void;
    /**
     * Sets references to dependent components.
     *
     * @param references 	references to locate the component dependencies.
     */
    setReferences(references: IReferences): void;
    /**
     * Checks if the component is opened.
     *
     * @returns true if the component has been opened and false otherwise.
     */
    abstract isOpen(): boolean;
    /**
     * Opens the component.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    open(correlationId: string, callback?: (err: any) => void): void;
    /**
     * Opens the component with given connection and credential parameters.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param connection        connection parameters
     * @param credential        credential parameters
     * @param callback 			callback function that receives error or null no errors occured.
     */
    protected abstract openWithParams(correlationId: string, connection: ConnectionParams, credential: CredentialParams, callback: (err: any) => void): void;
    /**
     * Closes component and frees used resources.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    abstract close(correlationId: string, callback: (err: any) => void): void;
    /**
     * Clears component state.
     *
     * @param correlationId 	(optional) transaction id to trace execution through call chain.
     * @param callback 			callback function that receives error or null no errors occured.
     */
    abstract clear(correlationId: string, callback: (err: any) => void): void;
    /**
     * Reads the current number of messages in the queue to be delivered.
     *
     * @param callback      callback function that receives number of messages or error.
     */
    abstract readMessageCount(callback: (err: any, count: number) => void): void;
    /**
     * Sends a message into the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param envelope          a message envelop to be sent.
     * @param callback          (optional) callback function that receives error or null for success.
     */
    abstract send(correlationId: string, envelope: MessageEnvelope, callback?: (err: any) => void): void;
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
    sendAsObject(correlationId: string, messageType: string, message: any, callback?: (err: any) => void): void;
    /**
     * Peeks a single incoming message from the queue without removing it.
     * If there are no messages available in the queue it returns null.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param callback          callback function that receives a message or error.
     */
    abstract peek(correlationId: string, callback: (err: any, result: MessageEnvelope) => void): void;
    /**
     * Peeks multiple incoming messages from the queue without removing them.
     * If there are no messages available in the queue it returns an empty list.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param messageCount      a maximum number of messages to peek.
     * @param callback          callback function that receives a list with messages or error.
     */
    abstract peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelope[]) => void): void;
    /**
     * Receives an incoming message and removes it from the queue.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param waitTimeout       a timeout in milliseconds to wait for a message to come.
     * @param callback          callback function that receives a message or error.
     */
    abstract receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelope) => void): void;
    /**
     * Renews a lock on a message that makes it invisible from other receivers in the queue.
     * This method is usually used to extend the message processing time.
     *
     * @param message       a message to extend its lock.
     * @param lockTimeout   a locking timeout in milliseconds.
     * @param callback      (optional) callback function that receives an error or null for success.
     */
    abstract renewLock(message: MessageEnvelope, lockTimeout: number, callback?: (err: any) => void): void;
    /**
     * Permanently removes a message from the queue.
     * This method is usually used to remove the message after successful processing.
     *
     * @param message   a message to remove.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    abstract complete(message: MessageEnvelope, callback?: (err: any) => void): void;
    /**
     * Returnes message into the queue and makes it available for all subscribers to receive it again.
     * This method is usually used to return a message which could not be processed at the moment
     * to repeat the attempt. Messages that cause unrecoverable errors shall be removed permanently
     * or/and send to dead letter queue.
     *
     * @param message   a message to return.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    abstract abandon(message: MessageEnvelope, callback?: (err: any) => void): void;
    /**
     * Permanently removes a message from the queue and sends it to dead letter queue.
     *
     * @param message   a message to be removed.
     * @param callback  (optional) callback function that receives an error or null for success.
     */
    abstract moveToDeadLetter(message: MessageEnvelope, callback?: (err: any) => void): void;
    /**
     * Listens for incoming messages and blocks the current thread until queue is closed.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param receiver          a receiver to receive incoming messages.
     *
     * @see [[IMessageReceiver]]
     * @see [[receive]]
     */
    abstract listen(correlationId: string, receiver: IMessageReceiver): void;
    /**
     * Ends listening for incoming messages.
     * When this method is call [[listen]] unblocks the thread and execution continues.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     */
    abstract endListen(correlationId: string): void;
    /**
     * Listens for incoming messages without blocking the current thread.
     *
     * @param correlationId     (optional) transaction id to trace execution through call chain.
     * @param receiver          a receiver to receive incoming messages.
     *
     * @see [[listen]]
     * @see [[IMessageReceiver]]
     */
    beginListen(correlationId: string, receiver: IMessageReceiver): void;
    /**
     * Gets a string representation of the object.
     *
     * @returns a string representation of the object.
     */
    toString(): string;
}
