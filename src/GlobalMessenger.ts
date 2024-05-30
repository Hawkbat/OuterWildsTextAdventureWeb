
export interface GlobalObserver
{
	onReceiveGlobalMessage(message: Message): void;
}

export class GlobalMessenger
{
	_observers: GlobalObserver[];

	constructor()
	{
		this._observers = new Array<GlobalObserver>();
	}

	addObserver(observer: GlobalObserver): void
	{
		if (!this._observers.includes(observer))
		{
			this._observers.push(observer);
		}
		//println("Observer Count:", this._observers.length);
	}

	removeObserver(observer: GlobalObserver): void
	{
		this._observers.splice(this._observers.indexOf(observer), 1);
	}

	removeAllObservers(): void
	{
		this._observers.length = 0;
	}

	sendMessage(messageID: string): void
	sendMessage(message: Message): void
	sendMessage(messageOrID: string | Message): void
	{
		const message = messageOrID instanceof Message ? messageOrID : new Message(messageOrID);
		for (let i: number = 0; i < this._observers.length; i++)
		{
			this._observers[i].onReceiveGlobalMessage(message);
		}
	}
}

export class Message
{
	id: string;
	text: string;

	constructor(messageID: string, t?: string)
	{
		this.id = messageID;
		if (t !== undefined) this.text = t;
	}
}