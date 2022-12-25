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
	 * @returns {any}
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
	 * Returns whether key exists or not
	 * @param {string} key - key to search for
	 * @returns {boolean}
	 */
	public has(key: string): boolean {
		return (key in this.keyValues)
	}

	/**
	 * Returns key value and removes it from Dict instance
	 * @param {string} key - key to find value for
	 * @returns {any}
	 */
	public pop(key: string): any {
		let poppedValue = null

		if (this.has(key)) {
			poppedValue = this.get(key)
			delete this.keyValues[key]
		}

		return poppedValue
	}

	/**
	 * Removes key value from Dict instance
	 * @param {string} key - key to remove key value for
	 */
	public remove(key: string): void {
		if (this.has(key)) {
			delete this.keyValues[key]
		}
	}

	/**
	 * Returns values
	 * @returns {Array}
	 */
	public values(): any[] {
		return Object.values(this.keyValues)
	}
}
