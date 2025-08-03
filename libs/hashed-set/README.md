# @remnawave/hashed-set

A high-performance Set implementation that maintains a hash value for fast equality comparison. This allows for O(1) set comparison operations instead of O(n) when comparing two sets.

## Features

- **Fast Set Comparison**: Compare sets in O(1) time using hash values
- **TypeScript Support**: Full TypeScript definitions included
- **Standard Set API**: Extends native JavaScript Set with additional methods
- **Memory Efficient**: Minimal overhead compared to standard Set
- **Multiple Data Types**: Supports numbers, strings, and objects

## Installation

```bash
npm install @remnawave/hashed-set
```

## Usage

### Basic Usage

```typescript
import { HashedSet } from '@remnawave/hashed-set';

// Create a new HashedSet
const set1 = new HashedSet([1, 2, 3]);
const set2 = new HashedSet([3, 2, 1]);

// Fast comparison using hash values
console.log(set1.hash === set2.hash); // true - same elements, same hash

// Standard Set operations work as expected
set1.add(4);
set1.delete(1);
console.log(set1.has(2)); // true
console.log(set1.size); // 3
```

### Advanced Features

```typescript
import { HashedSet } from '@remnawave/hashed-set';

const set1 = new HashedSet(['alice@example.com', 'bob@example.com']);
const set2 = new HashedSet(['bob@example.com', 'alice@example.com']);

// Quick hash comparison
if (set1.hasSameHash(set2)) {
  console.log('Sets likely contain the same elements');
}

// Full equality check
if (set1.deepEquals(set2)) {
  console.log('Sets are definitely equal');
}

// Get unique hash for the set
console.log(`Set hash: ${set1.hash}`);
```

### Performance Example

```typescript
import { HashedSet } from '@remnawave/hashed-set';

// Create large sets
const emails1 = Array.from({ length: 100000 }, (_, i) => `user${i}@example.com`);
const emails2 = [...emails1].reverse();

const set1 = new HashedSet(emails1);
const set2 = new HashedSet(emails2);

// O(1) comparison instead of O(n)
const startTime = performance.now();
const areEqual = set1.hash === set2.hash;
const endTime = performance.now();

console.log(`Comparison took ${endTime - startTime}ms`); // ~0.01ms instead of ~100ms
```

## API Reference

### Constructor

- `new HashedSet<T>(iterable?: Iterable<T>)` - Creates a new HashedSet

### Properties

- `hash: number` - Gets the current hash value of the set (unsigned 32-bit integer)
- `size: number` - Number of elements in the set (inherited from Set)

### Methods

#### Standard Set Methods

- `add(value: T): this` - Adds a value to the set
- `delete(value: T): boolean` - Removes a value from the set
- `has(value: T): boolean` - Checks if a value exists in the set
- `clear(): void` - Removes all values from the set
- `forEach()`, `values()`, `keys()`, `entries()` - Standard iteration methods

#### Additional Methods

- `hasSameHash(other: HashedSet<T>): boolean` - Fast hash-based comparison
- `deepEquals(other: Set<T>): boolean` - Deep equality comparison

## Hash Algorithm

The library uses a combination of:

- **Numbers**: Direct integer conversion
- **Strings**: 31-polynomial rolling hash
- **Objects**: Random unique identifier assignment

The final set hash is computed using XOR operations, making it order-independent.

## Performance Characteristics

- **Set Creation**: O(n) where n is the number of elements
- **Add/Delete**: O(1) average case
- **Hash Comparison**: O(1)
- **Full Equality Check**: O(n) worst case, O(1) best case with hash pre-check

## License

AGPL-3.0-only
