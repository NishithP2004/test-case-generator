import { Ollama } from "ollama"
import fs from "node:fs/promises"
import puppeteer from "puppeteer"

const ollama = new Ollama({
    host: process.env.OLLAMA_HOST || "http://localhost:11434"
})

const model = process.env.OLLAMA_MODEL || "minimax-m2.5:cloud"

const cp_expert_prompt = await fs.readFile("prompts/coding_expert.txt", "utf-8")
const test_case_generator_prompt = await fs.readFile("prompts/test_case_generator.txt", "utf-8")

function parseJsonResponse(response) {
    try {
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
        const jsonString = jsonMatch ? jsonMatch[1] : response;
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON response:", response);
        throw e;
    }
}

async function generateSolutions(problem) {
    try {
        const solutions = await ollama.generate({
            model,
            system: cp_expert_prompt,
            prompt: problem,
            format: "json"
        })
            .then(res => res.response)

        return parseJsonResponse(solutions);
    } catch (err) {
        console.log("Error generating solutions for the given problem:", err.message);
        throw err;
    }
}

async function generateTestCases(problem, solutions) {
    try {
        const prompt = `
        Problem Statement:
        ${problem}

        Solutions:
        1. Brute Force

        ${solutions.brute_force}

        2. Optimal

        ${solutions.optimal}
        `

        const testCases = await ollama.generate({
            model,
            system: test_case_generator_prompt,
            prompt,
            format: "json"
        })
            .then(res => res.response)

        return parseJsonResponse(testCases);
    } catch (err) {
        console.log("Error generating test cases for the given problem:", err.message);
        throw err;
    }
}

async function fetchProblemFromLeetcode(url) {
    let browser;
    try {
        console.log(`Launching browser to fetch problem from: ${url}`);
        browser = await puppeteer.launch({
            headless: false, 
            defaultViewport: {
                width: 1920,
                height: 1080
            }
        });
        const page = await browser.newPage();
        
        // Block unnecessary resources to speed up loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000 
        });

        let content = await page.$eval("meta[name='description']", e => e.content).catch(() => "");

        try {
            const descriptionSelector = 'div[data-track-load="description_content"]'; 
            await page.waitForSelector(descriptionSelector, { timeout: 5000 });
            const descriptionText = await page.$eval(descriptionSelector, el => el.innerText);
            if (descriptionText) {
                content = descriptionText;
            }
        } catch (e) {
            console.error("Could not find specific description selector, falling back to meta description.");
        }

        if (!content) {
            throw new Error("Could not fetch problem content.");
        }

        return content;
    } catch (err) {
        console.error(`Error navigating to ${url}:`, err.message);
        throw err;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

export {
    generateSolutions,
    generateTestCases,
    fetchProblemFromLeetcode
}