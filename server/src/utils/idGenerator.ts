import { Sequence } from "../model/sequenceModel.js";

const BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function encodeBase62(num: number): string {
    if (num === 0) return BASE62[0];
    let str = "";
    while (num > 0) {
        str = BASE62[num % 62] + str;
        num = Math.floor(num / 62);
    }
    return str;
}

class IdGenerator {
    private currentId: number = 0;
    private maxId: number = 0;
    private readonly blockSize: number = 1000;

    async getNextId(): Promise<string> {
        if (this.currentId >= this.maxId) {
            await this.fetchBlock();
        }
        
        this.currentId++;
        return encodeBase62(this.currentId);
    }

    private async fetchBlock() {
        const result = await Sequence.findOneAndUpdate(
            { name: "url_id" },
            { $inc: { seq: this.blockSize } },
            { new: true, upsert: true }
        );
        
        if (!result) {
            throw new Error("Failed to fetch ID block from Sequence collection");
        }

        this.maxId = result.seq;
        this.currentId = this.maxId - this.blockSize;
    }
}

export const idGenerator = new IdGenerator();
