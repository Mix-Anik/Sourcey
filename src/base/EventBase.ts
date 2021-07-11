import {Dict} from './Dictionary'

export abstract class EventBase {
	/**
	 * @param name - name of the event
	 * @param description - event description
	 * @param once - allow to run this event only once
	 * @param lastCalled - timestamp of the last call
	 */
	public name: string
	public description: string
	public once: boolean
	public lastCalled: number

	/**
	 * Create event
	 * @param eventDict - data
	 */
	constructor(eventDict: Dict) {
		this.name = eventDict.get('name', null)
		this.description = eventDict.get('description', 'Event description is missing')
		this.once = eventDict.get('once', false)
		this.lastCalled = 0
	}

	/**
	 * event call handler
	 */
	public call(...args): void {
		this.lastCalled = Date.now()
		this.execute(args)
	}

	public abstract execute(...args): Promise<void>

	public docs(): string {
		return '```\n' +
			`Event: ${this.name}\n` +
			`Description: ${this.description}` +
			'```'
	}
}
