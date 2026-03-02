import express from "express"
import { taskQueue } from "./queue/taskQueue.js"
import "./jobs/taskWorker.js"
import "dotenv/config"

const app = express()
app.use(express.json())
app.use(express.static("public"))

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
})

/* app.get("/", (req, res) => {
    res.send({
        message: "Welcome to Test Case Generator!"
    })
}) */

app.post("/generate", async (req, res) => {
    const { url, problem_statement } = req.body

    if (url ^ problem_statement) {
        return res.status(400).send({
            error: "A valid url or a problem_statement must be provided"
        })
    }

    const job = await taskQueue.add("generateTestCases", { url, problem_statement })

    res.status(202).send({
        message: "Job accepted",
        jobId: job.id
    })
})

app.get("/jobs/:id", async (req, res) => {
    const id = req.params.id;

    if (!id) {
        return res.status(400).send({
            success: false,
            error: "A Job Id must be provided"
        })
    }

    const job = await taskQueue.getJob(id)

    if (!job) {
        return res.status(404).send({
            success: false,
            error: "Job not found"
        })
    }

    const status = await job.getState()
    const result = job.returnvalue
    const failedReason = job.failedReason

    return res.send({
        jobId: id,
        status,
        result,
        failedReason
    })
})
