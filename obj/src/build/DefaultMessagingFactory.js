"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/** @module build */
const pip_services_components_node_1 = require("pip-services-components-node");
const pip_services_commons_node_1 = require("pip-services-commons-node");
const MemoryMessageQueue_1 = require("../queues/MemoryMessageQueue");
class DefaultMessagingFactory extends pip_services_components_node_1.Factory {
    constructor() {
        super();
        this.register(DefaultMessagingFactory.MemoryQueueDescriptor, (locator) => {
            return new MemoryMessageQueue_1.MemoryMessageQueue(locator.getName());
        });
    }
}
DefaultMessagingFactory.Descriptor = new pip_services_commons_node_1.Descriptor("pip-services", "factory", "messaging", "default", "1.0");
DefaultMessagingFactory.MemoryQueueDescriptor = new pip_services_commons_node_1.Descriptor("pip-services", "message-queue", "memory", "*", "1.0");
exports.DefaultMessagingFactory = DefaultMessagingFactory;
//# sourceMappingURL=DefaultMessagingFactory.js.map