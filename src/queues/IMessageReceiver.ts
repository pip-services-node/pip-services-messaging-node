/** @module queues */
import { IMessageQueue } from './IMessageQueue';
import { MessageEnvelope } from './MessageEnvelope';

//TODO: other classes?
/**
 * Interface for classes that need to be able to receive messages. Message receivers 
 * can be listened to by queues and other classes.
 */
export interface IMessageReceiver {
    /**
     * Abstract method that will contain the logic for receiving a message.
     * 
     * @param envelope  the message's envelope
     * @param queue     the queue that the message is in.
     * @param callback  the function to call once the message has been received.
     *                  Will be called with an error, if one is raised.
     * 
     * @see [[MessageEnvelope]]
     * @see [[IMessageQueue]]
     */
    receiveMessage(envelope: MessageEnvelope, queue: IMessageQueue, callback: (err: any) => void): void;
}