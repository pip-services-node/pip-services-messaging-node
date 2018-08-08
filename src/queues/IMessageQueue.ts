/** @module queues */
import { IOpenable } from 'pip-services-commons-node';
import { IClosable } from 'pip-services-commons-node';

import { MessagingCapabilities } from './MessagingCapabilities';
import { MessageEnvelope } from './MessageEnvelope';
import { IMessageReceiver } from './IMessageReceiver';

/**
 * Interface for classes that need to be able to manage a queue of messages.
 */
export interface IMessageQueue extends IOpenable, IClosable {
    /**
     * Abstract method that will contain the logic for retrieving the queue's name.
     * 
     * @returns the queue's name.
     */
    getName(): string;
    /**
     * Abstract method that will contain the logic for retrieving the queue's 
     * messaging capabilities.
     * 
     * @returns the queue's capabilities.
     * 
     * @see [[MessagingCapabilities]]
     */
	getCapabilities(): MessagingCapabilities;
    
    /**
     * Abstract method that will contain the logic for establishing the amount of 
     * messages currently in the queue.
     * 
     * @param callback      the function to call with the number of messages in the queue 
     *                      (or with an error, if one is rasied).
     */
    readMessageCount(callback: (err: any, count: number) => void): void;

    //TODO: sent over the connection or to the queue?
    /**
     * Abstract method that will contain the logic for sending a [[MessageEnvelope]].
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param envelope          the MessageEnvelope to send.
     * @param callback          (optional) the function to call once sending is complete.
     *                          Will be called with an error if one is raised.
     * 
     * @see [[MessageEnvelope]]
     */
    send(correlationId: string, envelope: MessageEnvelope, callback?: (err: any) => void): void;
    /**
     * Abstract method that will contain the logic for sending an object as a message.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param messageType       the message's type. Will used when converting the message to a
     *                          MessageEnvelope.
     * @param message           the message to send.
     * @param callback          (optional) the function to call once sending is complete.
     *                          Will be called with an error if one is raised.
     * 
     * @see [[MessageEnvelope]]
     */
    sendAsObject(correlationId: string, messageType: string, message: any, callback?: (err: any) => void): void;
    /**
     * Abstract method that will contain the logic for retrieving the next message without removing 
     * it from the queue.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param callback          the function to call with the peeked message 
     *                          (or with an error, if one is raised).
     */
    peek(correlationId: string, callback: (err: any, result: MessageEnvelope) => void): void;
    /**
     * Abstract method that will contain the logic for retrieving a batch of messages without 
     * removing them from the queue.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param messageCount      the number of message to peek.
     * @param callback          the function to call with the peeked messages 
     *                          (or with an error, if one is raised).
     */
    peekBatch(correlationId: string, messageCount: number, callback: (err: any, result: MessageEnvelope[]) => void): void;
    /**
     * Abstract method that will wait the given amount of time for a message to arrive in 
     * the queue (if it is empty) and, once one arrives, will remove it from the queue and lock it
     * for processing. If the queue already contains messages then the next one will be received.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param waitTimeout       the amount of time to wait for a message to arrive.
     * @param callback          the function to call with the received message 
     *                          (or with an error, if one is raised).
     */
    receive(correlationId: string, waitTimeout: number, callback: (err: any, result: MessageEnvelope) => void): void;

    /**
     * Abstract method that will contain the logic for renewing the given message's lock.
     * 
     * @param message       the message to renew a lock for.
     * @param lockTimeout   the lock's new timeout.
     * @param callback      (optional) the function to call once the lock has been renewed.
     *                      Will be called with an error if one is raised.
     */
    renewLock(message: MessageEnvelope, lockTimeout: number, callback?: (err: any) => void): void;
    /**
     * Abstract method that will contain the logic for completing the 
     * processing of a locked message and removing its lock.
     * 
     * @param message   the message to complete.
     * @param callback  (optional) the function to call once the message has been completed.
     *                  Will be called with an error if one is raised.
     */
    complete(message: MessageEnvelope, callback?: (err: any) => void): void;
    /**
     * Abstract method that will contain the logic for abandoning the processing of a 
     * locked message and removing its lock.
     * 
     * @param message   the message to abandon.
     * @param callback  (optional) the function to call once the message has been abandoned.
     *                  Will be called with an error if one is raised.
     */
    abandon(message: MessageEnvelope, callback?: (err: any) => void): void; 
    /**
     * Abstract method that will contain the logic for moving a locked message to the dead 
     * letter queue.
     * 
     * @param message   the dead letter.
     * @param callback  (optional) the function to call once the message has been moved.
     *                  Will be called with an error if one is raised.
     */
    moveToDeadLetter(message: MessageEnvelope, callback?: (err: any) => void): void;

    //TODO: listen vs beginListen
    /**
     * Abstract method that will listen to the queue and, if a message is [[receive received]], 
     * will pass it to the given message receiver for processing.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param receiver          the message receiver to pass the received message(s) to.
     * 
     * @see [[IMessageReceiver]]
     * @see [[receive]]
     */
    listen(correlationId: string, receiver: IMessageReceiver): void;
    /**
     * Abstract method that will contain the logic starting the [[listen listening]] process.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     * @param receiver          the message receiver to pass the received message(s) to.
     * 
     * @see [[listen]]
     * @see [[IMessageReceiver]]
     */
    beginListen(correlationId: string, receiver: IMessageReceiver): void;
    /**
     * Abstract method that will contain the logic for stopping this queue's listening process.
     * 
     * @param correlationId     unique business transaction id to trace calls across components.
     */
    endListen(correlationId: string): void;
}