/** @module build */
import { Factory } from 'pip-services-components-node';
import { Descriptor } from 'pip-services-commons-node';

import { MemoryMessageQueue } from '../queues/MemoryMessageQueue';

/**
 * Contains a static read-only descriptor for [[MemoryMessageQueue]] and a default "messaging" descriptor.
 * 
 * @see [[https://rawgit.com/pip-services-node/pip-services-components-node/master/doc/api/classes/build.factory.html Factory]]
 */
export class DefaultMessagingFactory extends Factory {
	public static readonly Descriptor: Descriptor = new Descriptor("pip-services", "factory", "messaging", "default", "1.0");
    public static readonly MemoryQueueDescriptor: Descriptor = new Descriptor("pip-services", "message-queue", "memory", "*", "1.0");

    /**
	 * Create a new DefaultMessagingFactory object, containing a [[MemoryMessageQueue]] object factory.
	 * 
	 * @see [[MemoryMessageQueue]]
	 */
    public constructor() {
        super();
        this.register(DefaultMessagingFactory.MemoryQueueDescriptor, (locator: Descriptor) => {
            return new MemoryMessageQueue(locator.getName());
        });
    }
}
