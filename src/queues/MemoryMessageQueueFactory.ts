import { Factory } from 'pip-services-components-node';
import { Descriptor } from 'pip-services-commons-node';

import { MemoryMessageQueue } from './MemoryMessageQueue';

export class MemoryMessageQueueFactory extends Factory {
	public static readonly Descriptor: Descriptor = new Descriptor("pip-services-messaging", "factory", "message-queue", "memory", "1.0");
    public static readonly MemoryQueueDescriptor: Descriptor = new Descriptor("pip-services-messaging", "message-queue", "memory", "*", "1.0");

    public constructor() {
        super();
        this.register(MemoryMessageQueueFactory.MemoryQueueDescriptor, (locator: Descriptor) => {
            return new MemoryMessageQueue(locator.getName());
        });
    }
}
