import { MemoryMessageQueue } from '../../src/queues/MemoryMessageQueue';
import { MessageQueueFixture } from './MessageQueueFixture';

suite('MemoryMessageQueue', () => {
    let queue: MemoryMessageQueue;
    let fixture: MessageQueueFixture;

    suiteSetup((done) => {
        queue = new MemoryMessageQueue("TestQueue");
        fixture = new MessageQueueFixture(queue);
        queue.open(null, done);
    });

    suiteTeardown((done) => {
        queue.close(null, done);
    });

    setup((done) => {
        queue.clear(null, done);
    });

    test('Send Receive Message', (done) => {
        fixture.testSendReceiveMessage(done);
    });

    test('Receive Send Message', (done) => {
        fixture.testReceiveSendMessage(done);
    });

    test('Receive And Complete Message', (done) => {
        fixture.testReceiveCompleteMessage(done);
    });

    test('Receive And Abandon Message', (done) => {
        fixture.testReceiveAbandonMessage(done);
    });

    test('Send Peek Message', (done) => {
        fixture.testSendPeekMessage(done);
    });

    test('Peek No Message', (done) => {
        fixture.testPeekNoMessage(done);
    });

    test('Move To Dead Message', (done) => {
        fixture.testMoveToDeadMessage(done);
    });

    test('On Message', (done) => {
        fixture.testOnMessage(done);
    });

});
