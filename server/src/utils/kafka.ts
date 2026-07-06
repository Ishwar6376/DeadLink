import { Kafka, Partitioners } from "kafkajs";
import { Url } from "../model/urlModel.js";

const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";

const kafka = new Kafka({
  clientId: "url-shortener-server",
  brokers: [KAFKA_BROKER],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner });
const consumer = kafka.consumer({ groupId: "click-tracking-group" });
const admin = kafka.admin();

let isConnected = false;

export const kafkaClient = {
  async connect() {
    try {
  
      await admin.connect();
      await admin.createTopics({
        topics: [{ topic: "url-clicks", numPartitions: 1 }],
      });
      await admin.disconnect();

      await producer.connect();
      await consumer.connect();

      await this.startClickConsumer();
      
      isConnected = true;
      console.log("Connected to Kafka");
    } catch (err) {
      console.error("Failed to connect to Kafka", err);
      isConnected = false;
    }
  },

  async sendClickEvent(urlId: string) {
    if (!isConnected) {
      //fallback
      await Url.updateOne({ url_id: urlId }, { $inc: { clicks: 1 } });
      return;
    }

    try {
      await producer.send({
        topic: "url-clicks",
        messages: [{ value: JSON.stringify({ urlId, timestamp: Date.now() }) }],
      });
    } catch (err) {
      console.error("Failed to send click event, falling back to DB write", err);
      // Fallback if Kafka producer fails for any reason
      await Url.updateOne({ url_id: urlId }, { $inc: { clicks: 1 } });
    }
  },

  async startClickConsumer() {
    await consumer.subscribe({ topic: "url-clicks", fromBeginning: false });

    await consumer.run({
      eachBatchAutoResolve: true,
      eachBatch: async ({ batch }) => {
        // Aggregate clicks by urlId to minimize DB updates
        const clickCounts: Record<string, number> = {};
        
        for (const message of batch.messages) {
          if (!message.value) continue;
          try {
            const data = JSON.parse(message.value.toString());
            clickCounts[data.urlId] = (clickCounts[data.urlId] || 0) + 1;
          } catch (e) {
            console.error("Error parsing Kafka message", e);
          }
        }

        // Perform bulk write to MongoDB
        const bulkOps = Object.keys(clickCounts).map((urlId) => ({
          updateOne: {
            filter: { $or: [{ url_id: urlId }, { shortUrl: urlId }] },
            update: { $inc: { clicks: clickCounts[urlId] } }
          }
        }));

        if (bulkOps.length > 0) {
          try {
            await Url.bulkWrite(bulkOps);
            console.log(`Processed ${batch.messages.length} clicks into ${bulkOps.length} DB updates.`);
          } catch (e) {
            console.error("Failed to bulkWrite clicks to DB", e);
            throw e; // trigger retry by kafkajs
          }
        }
      },
    });
  }
};
