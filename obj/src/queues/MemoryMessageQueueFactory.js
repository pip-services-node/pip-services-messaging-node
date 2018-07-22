"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_components_node_1 = require("pip-services-components-node");
const pip_services_commons_node_1 = require("pip-services-commons-node");
const MemoryMessageQueue_1 = require("./MemoryMessageQueue");
class MemoryMessageQueueFactory extends pip_services_components_node_1.Factory {
    constructor() {
        super();
        this.register(MemoryMessageQueueFactory.MemoryQueueDescriptor, (locator) => {
            return new MemoryMessageQueue_1.MemoryMessageQueue(locator.getName());
        });
    }
}
MemoryMessageQueueFactory.Descriptor = new pip_services_commons_node_1.Descriptor("pip-services-messaging", "factory", "message-queue", "memory", "1.0");
MemoryMessageQueueFactory.MemoryQueueDescriptor = new pip_services_commons_node_1.Descriptor("pip-services-messaging", "message-queue", "memory", "*", "1.0");
exports.MemoryMessageQueueFactory = MemoryMessageQueueFactory;
//# sourceMappingURL=MemoryMessageQueueFactory.js.map