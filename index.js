import express from "express"
import { pipeline } from "./pipeline.js"
import "dotenv/config"

const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`)
})

app.get("/", (req, res) => {
    res.send({
        message: "Welcome to Test Case Generator!"
    })
})

app.post("/generate", async (req, res) => {
    const { url, problem_statement } = req.body

    if (url ^ problem_statement) {
        return res.status(400).send({
            error: "A valid url or a problem_statement must be provided"
        })
    }

    try {
        const { test_cases } = await pipeline(url || problem_statement, (url)? "url": "problem_statement")

        res.status(201).send({
            test_cases,
            success: true
        })
    } catch (err) {
        console.error(`[${new Date().toLocaleTimeString()}] Error:`, err.message)
        if (err.stack) console.error(err.stack);
        res.status(500).send({
            error: err.message,
            success: false
        })
    }
})