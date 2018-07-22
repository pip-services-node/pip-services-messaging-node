import { IdGenerator } from 'pip-services-commons-node';

export class MessageEnvelop {
    private _reference: any;

	public constructor(correlationId: string, messageType: string, message: any) {
		this.correlation_id = correlationId;
		this.message_type = messageType;
		this.message = message != null ? Buffer.from(message) : null;
        this.message_id = IdGenerator.nextLong();
	}

	public correlation_id: string;
	public message_id: string;
	public message_type: string;
	public sent_time: Date;
    public message: Buffer;

    public getReference(): any {
        return this._reference;
    }
    
    public setReference(value: any): void {
        this._reference = value;
    }

    public getMessageAsString(): string {
        return this.message != null ? this.message.toString('utf8') : null
    }

    public setMessageAsString(value: string): void {
        this.message = Buffer.from(value, 'utf8');
    }

    public getMessageAsJson(): any {
        if (this.message == null) return null;
        let temp = this.message.toString();
        return JSON.parse(temp);
    }

    public setMessageAsJson(value: any): void {
        if (value == null) this.message = null;
        else {
            let temp = JSON.stringify(value);
            this.message = Buffer.from(temp, 'utf8');
        }
    }

    public toString(): string {
        var builder = '[';
        builder += this.correlation_id || "---";
        builder += ',';
        builder += this.message_type || "---";
        builder += ',';
        builder += this.message ? this.message.toString('utf8', 0, 50) : "---";
        builder += ']';
        return builder;
    }

}