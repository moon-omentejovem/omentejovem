export function isEmptyStringOrUndefined(value: unknown): boolean {
	if (typeof value === 'string' && !value) {
		return true
	}

	if (value === undefined) {
		return true
	}

	return false
}
