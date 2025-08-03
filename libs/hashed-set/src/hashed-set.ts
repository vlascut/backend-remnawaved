/**
 * A high-performance Set implementation that maintains a hash value for fast equality comparison.
 * This allows for O(1) set comparison operations instead of O(n) when comparing two sets.
 *
 * @example
 * ```typescript
 * const set1 = new HashedSet([1, 2, 3]);
 * const set2 = new HashedSet([3, 2, 1]);
 *
 * // Fast comparison using hash values
 * console.log(set1.hash === set2.hash); // true - same elements, same hash
 *
 * // Standard Set operations work as expected
 * set1.add(4);
 * set1.delete(1);
 * console.log(set1.has(2)); // true
 * ```
 */
export class HashedSet<T = any> extends Set<T> {
    private _hash: number;

    /**
     * Creates a new HashedSet instance.
     * @param iterable Optional iterable to initialize the set with
     */
    constructor(iterable?: Iterable<T>) {
        super(iterable ? Array.from(iterable) : undefined);
        this._hash = 0;
        for (const v of this) {
            this._hash ^= this._valHash(v);
        }
    }

    /**
     * Computes a hash value for a given value.
     * @param v The value to hash
     * @returns The computed hash value
     */
    private _valHash(v: T): number {
        if (typeof v === 'number') return v | 0;
        if (typeof v === 'string') {
            let h = 0;
            for (let i = 0; i < v.length; i++) {
                h = (h * 31 + v.charCodeAt(i)) | 0;
            }
            return h;
        }
        return Object.is(v, null) ? 0 : this._objHash(v);
    }

    /**
     * Computes a hash value for an object by assigning a unique identifier.
     * @param obj The object to hash
     * @returns The computed hash value
     */
    private _objHash(obj: any): number {
        return (obj.__hid ??= (Math.random() * 0xffffffff) | 0);
    }

    /**
     * Adds a value to the set and updates the hash.
     * @param v The value to add
     * @returns The HashedSet instance
     */
    add(v: T): this {
        if (!this.has(v)) {
            this._hash ^= this._valHash(v);
        }
        return super.add(v);
    }

    /**
     * Removes a value from the set and updates the hash.
     * @param v The value to remove
     * @returns True if the value was removed, false otherwise
     */
    delete(v: T): boolean {
        if (this.has(v)) {
            this._hash ^= this._valHash(v);
        }
        return super.delete(v);
    }

    /**
     * Clears all values from the set and resets the hash.
     */
    clear(): void {
        this._hash = 0;
        super.clear();
    }

    /**
     * Gets the current hash value of the set.
     * Two sets with the same elements will have the same hash value.
     * @returns The hash value as an unsigned 32-bit integer
     */
    get hash(): number {
        return this._hash >>> 0;
    }

    /**
     * Checks if this set has the same hash as another HashedSet.
     * This is a fast way to check if two sets might be equal.
     * @param other The other HashedSet to compare with
     * @returns True if the hash values are equal
     */
    hasSameHash(other: HashedSet<T>): boolean {
        return this.hash === other.hash;
    }

    /**
     * Checks if this set is equal to another set by comparing elements.
     * For HashedSets, this first checks hash equality for performance.
     * If the other set is a HashedSet and the hashes don't match, returns false immediately.
     * Otherwise, compares each element to ensure both sets contain the same values.
     * @param other The other set to compare with
     * @returns True if both sets contain exactly the same elements, false otherwise
     */
    deepEquals(other: Set<T>): boolean {
        if (other instanceof HashedSet && !this.hasSameHash(other)) {
            return false;
        }

        for (const value of this) {
            if (!other.has(value)) {
                return false;
            }
        }

        return true;
    }
}
