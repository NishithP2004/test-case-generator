import readline from "node:readline"
import { pipeline } from "./pipeline.js"

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
rl.setPrompt(":> ")
rl.prompt()

rl.on("line", async line => {
    try {
        const url = line.trim()
        if (!url) return;
        await pipeline(url)
    } catch (err) {
        console.error(`[${new Date().toLocaleTimeString()}] Error:`, err.message)
        if (err.stack) console.error(err.stack);
    } finally {
        rl.prompt()
    }
})

rl.on("SIGINT", () => {
    console.log("Bye!")
    rl.close()
})

