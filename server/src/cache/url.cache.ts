import {redis} from "../utils/redis.js"

export async function getShortUrl(code:string) {
    const key=`short:${code}`;
    const cached = await redis.get(key);

    if (cached) return JSON.parse(cached);

    return null;
}
export async function setShortUrl(
  code: string,
  data: any,
  ttlSeconds: number
) {
  const key = `short:${code}`;
  await redis.set(key, JSON.stringify(data));
  await redis.expire(key, ttlSeconds);
}
export async function invalidateShortUrl(code: string) {
  await redis.del(`short:${code}`);
}