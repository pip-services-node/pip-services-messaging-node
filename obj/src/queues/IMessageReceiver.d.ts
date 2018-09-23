/** @module queues */
import { IMessageQueue } from './IMessageQueue';
import { MessageEnvelope } from './MessageEnvelope';
/**
 * Callback interface to receive incoming messages.
 *
 * ### Example ###
 *
 * class MyMessageReceiver implements IMessageReceiver {
 *   public receiveMessage(envelop: MessageEnvelop, queue: IMessageQueue, callback) {
 *       console.log("Received message: " + envelop.getMessageAsString());
 *   }
 * }
 *
 * let messageQueue = new MemoryMessageQueue();
 * messageQueue.listen("123", new MyMessageReceiver());
 *
 * messageQueue.open("123", (err) => {
 *    messageQueue.send("123", new MessageEnvelop(null, "mymessage", "ABC")); // Output in console: "ABC"
 * });
 */
export interface IMessageReceiver {
    /**
     * Receives incoming message from the queue.
     *
     * @param envelope  an incoming message
     * @param queue     a queue where the message comes from
     * @param callback  callback function that receives error or null for success.
     *
     * @see [[MessageEnvelope]]
     * @see [[IMessageQueue]]
     */
    receiveMessage(envelope: MessageEnvelope, queue: IMessageQueue, callback: (err: any) => void): void;
}
