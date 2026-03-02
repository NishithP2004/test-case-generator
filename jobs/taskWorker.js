import { Worker } from "bullmq";
import { redis } from "../queue/redis.js";
import { pipeline } from "../pipeline.js";

const taskWorker = new Worker(
    'taskQueue',
    async (job) => {
        console.log(`Starting job ${job.id}...`)
        try {
            const { url, problem_statement } = job.data;
            const { test_cases, solutions } = await pipeline(url || problem_statement, (url) ? "url" : "problem_statement")

            return { test_cases, solutions }
        } catch (err) {
            console.error(`[${new Date().toLocaleTimeString()}] Error:`, err.message)
            throw err;
        }

    }, 
    { connection: redis }
)

taskWorker.on("completed", job => {
    console.log(`Test Case generation task ${job.id} completed`)
})

taskWorker.on("failed", (job, err) => {
    console.error(`Test Case generation job ${job.id} failed:`, err)
})

