import { spawn } from "node:child_process"
import { randomUUID } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

async function runCode(code, input) {
    const filename = randomUUID()
    const filepath = path.join("tmp", `${filename}.py`)
    
    try {
        await fs.mkdir("tmp", { recursive: true })
    } catch (err) {
        // Ignore if exists
    }

    await fs.writeFile(filepath, code)

    return new Promise((resolve, reject) => {
        const pythonPs = spawn("python", [filepath], {
            timeout: 5000 
        })

        let output = ""
        let errorOutput = ""

        if (input) {
            pythonPs.stdin.write(input + "\n")
            pythonPs.stdin.end()
        }

        pythonPs.stdout.on("data", data => {
            output += data.toString()
        })

        pythonPs.stderr.on("data", data => {
            errorOutput += data.toString()
        })

        pythonPs.on("close", async code => {
            try {
                await fs.unlink(filepath)
            } catch (e) {
                console.error(`Failed to delete temp file ${filepath}:`, e)
            }

            if (code !== 0) {
                reject(new Error(`Process exited with code ${code}. Error: ${errorOutput}`))
            } else {
                resolve(output.trim())
            }
        })
        
        pythonPs.on("error", async err => {
            try {
                await fs.unlink(filepath)
            } catch (e) {
                // Ignore cleanup error
            }
            reject(err)
        })
    })
}

export {
    runCode
}