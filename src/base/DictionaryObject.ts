export class Dict {
	private readonly keyValues: { [key: string]: any }

	/**
	 * Creates new Dict object
	 * @param {object} obj - object with preset keyvalues
	 */
	constructor(obj: {} = {}) {
		this.keyValues = obj
	}

	/**
	 * Returns key value or default value if key doesn't exist
	 * @param {string} key - key to find value for
	 * @param {any} defaultValue - value to return if key wasn't found
	 */
	public get(key: string, defaultValue: any = null): any {
		return (key in this.keyValues) ? this.keyValues[key] : defaultValue
	}

	/**
	 * Sets/changes key value in a Dict
	 * @param {string} key - key to find value for
	 * @param {any} value - value to return if key wasn't found
	 */
	public set(key: string, value: any): void {
		this.keyValues[key] = value
	}

	/**
	 * Returns key value and removes it from Dict instance
	 * @param {string} key - key to find value for
	 */
	public pop(key: string) {
		const value = this.get(key)
		delete this.keyValues[key]
		return value
	}
}
