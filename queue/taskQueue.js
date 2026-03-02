import { Queue } from "bullmq"
import { redis } from "./redis.js"

export const taskQueue = new Queue("taskQueue", {
    connection: redis
})