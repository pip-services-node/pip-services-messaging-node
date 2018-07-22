import { Factory } from 'pip-services-components-node';
import { Descriptor } from 'pip-services-commons-node';
export declare class DefaultMessagingFactory extends Factory {
    static readonly Descriptor: Descriptor;
    static readonly MemoryQueueDescriptor: Descriptor;
    constructor();
}
