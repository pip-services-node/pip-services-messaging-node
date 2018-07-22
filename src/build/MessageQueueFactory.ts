import { Factory } from 'pip-services-components-node';
import { Descriptor } from 'pip-services-commons-node';

import { MemoryMessageQueue } from '../queues/MemoryMessageQueue';

export class MessageQueueFactory extends Factory {
	public static readonly Descriptor: Descriptor = new Descriptor("pip-services", "factory", "message-queue", "default", "1.0");
    public static readonly MemoryQueueDescriptor: Descriptor = new Descriptor("pip-services", "message-queue", "memory", "*", "1.0");

    public constructor() {
        super();
        this.register(MessageQueueFactory.MemoryQueueDescriptor, (locator: Descriptor) => {
            return new MemoryMessageQueue(locator.getName());
        });
    }
}
