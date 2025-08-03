#!/usr/bin/env npx ts-node

import { HashedSet } from '../src/hashed-set';

console.log('🚀 HashedSet Library Demo\n');

// Basic usage
console.log('📝 Basic Usage:');
const set1 = new HashedSet([1, 2, 3, 'hello', 'world']);
const set2 = new HashedSet(['world', 'hello', 3, 2, 1]);

console.log(`Set 1: [${Array.from(set1).join(', ')}]`);
console.log(`Set 2: [${Array.from(set2).join(', ')}]`);
console.log(`Set 1 hash: ${set1.hash}`);
console.log(`Set 2 hash: ${set2.hash}`);
console.log(`Hashes equal: ${set1.hasSameHash(set2)}`);
console.log(`Sets equal: ${set1.deepEquals(set2)}\n`);

// Performance comparison
console.log('⚡ Performance Demo:');
const size = 50000;
const data1 = Array.from({ length: size }, (_, i) => `email${i}@example.com`);
const data2 = [...data1].reverse();

console.log(`Creating two sets with ${size.toLocaleString()} elements each...`);

const startTime = performance.now();
const bigSet1 = new HashedSet(data1);
const bigSet2 = new HashedSet(data2);
const creationTime = performance.now() - startTime;

console.log(`Creation time: ${creationTime.toFixed(2)}ms`);

// Hash comparison (fast)
const hashStart = performance.now();
const hashEqual = bigSet1.hasSameHash(bigSet2);
const hashTime = performance.now() - hashStart;

console.log(`Hash comparison: ${hashTime.toFixed(4)}ms - Result: ${hashEqual}`);

// Full comparison (slower but definitive)
const fullStart = performance.now();
const fullEqual = bigSet1.deepEquals(bigSet2);
const fullTime = performance.now() - fullStart;

console.log(`Full comparison: ${fullTime.toFixed(4)}ms - Result: ${fullEqual}`);
console.log(`Hash comparison is ${(fullTime / hashTime).toFixed(0)}x faster!\n`);

// Modification demo
console.log('🔧 Modification Demo:');
const modSet = new HashedSet(['a', 'b', 'c']);
console.log(`Initial: hash=${modSet.hash}, size=${modSet.size}`);

modSet.add('d');
console.log(`After add 'd': hash=${modSet.hash}, size=${modSet.size}`);

modSet.delete('a');
console.log(`After delete 'a': hash=${modSet.hash}, size=${modSet.size}`);

modSet.clear();
console.log(`After clear: hash=${modSet.hash}, size=${modSet.size}`);
