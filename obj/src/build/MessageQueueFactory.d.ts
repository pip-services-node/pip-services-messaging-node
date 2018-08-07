/** @module build */
import { Factory } from 'pip-services-components-node';
import { Descriptor } from 'pip-services-commons-node';
/**
 * Contains a static read-only descriptor for [[MemoryMessageQueue]] and a default "message-queue" descriptor.
 *
 * @see [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/build.factory.html Factory]]
 */
export declare class MessageQueueFactory extends Factory {
    static readonly Descriptor: Descriptor;
    static readonly MemoryQueueDescriptor: Descriptor;
    /**
     * Create a new MessageQueueFactory object, containing a [[MemoryMessageQueue]] object factory.
     *
     * @see [[MemoryMessageQueue]]
     */
    constructor();
}
