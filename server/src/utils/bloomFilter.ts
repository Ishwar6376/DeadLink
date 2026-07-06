import crypto from 'crypto';

class BloomFilter {
    private bitArray: Uint8Array;
    private size: number;
    private hashFunctionsCount: number;

    constructor(size: number, hashFunctionsCount: number) {
        this.size = size;
        this.hashFunctionsCount = hashFunctionsCount;
        this.bitArray = new Uint8Array(Math.ceil(size / 8));
    }

    private getHashes(item: string): number[] {
        const hashes: number[] = [];
        for (let i = 0; i < this.hashFunctionsCount; i++) {
            const hash = crypto.createHash('sha256').update(item + i).digest('hex');
            // Use the first 8 hex characters (32 bits) to get a number
            const num = parseInt(hash.substring(0, 8), 16);
            hashes.push(num % this.size);
        }
        return hashes;
    }

    add(item: string) {
        const hashes = this.getHashes(item);
        for (const hash of hashes) {
            const byteIndex = Math.floor(hash / 8);
            const bitIndex = hash % 8;
            this.bitArray[byteIndex] |= (1 << bitIndex);
        }
    }

    mightContain(item: string): boolean {
        const hashes = this.getHashes(item);
        for (const hash of hashes) {
            const byteIndex = Math.floor(hash / 8);
            const bitIndex = hash % 8;
            if ((this.bitArray[byteIndex] & (1 << bitIndex)) === 0) {
                return false;
            }
        }
        return true;
    }
}

// Export a singleton instance.
// For ~1 million items with 1% false positive rate:
// Size: 9,585,058 bits, Hash Functions: 7
export const slugBloomFilter = new BloomFilter(10000000, 7);
