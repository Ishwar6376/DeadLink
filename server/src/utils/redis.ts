import { createClient } from 'redis';

export const redis = createClient({
    username: 'default',
    password: 'QDOUrk5xyi0iZHGssYD4MQDs155vC559',
    socket: {
        host: 'redis-12816.crce206.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 12816
    }
});
