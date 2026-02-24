import fs from "node:fs/promises"
import { runCode } from "./compiler.js"
import { generateSolutions, generateTestCases, fetchProblemFromLeetcode } from "./utils.js"
import "dotenv/config"

async function pipeline(urlOrPs, type) {
    try {
        await fs.mkdir("io", { recursive: true });
    } catch (err) {
        // Ignore if exists
    }

    let problem;

    if (type === "url") {
        console.log(`\n[${new Date().toLocaleTimeString()}] Fetching problem from LeetCode...`)
        problem = await fetchProblemFromLeetcode(urlOrPs)
    } else if(type === "problem_statement") {
        problem = urlOrPs
    }

    console.log(`[${new Date().toLocaleTimeString()}] Problem fetched successfully. Length: ${problem.length} chars.`)
    await fs.writeFile("io/problem.txt", problem)

    console.log(`[${new Date().toLocaleTimeString()}] Generating Solutions for the fetched Problem...`)
    const solutions = await generateSolutions(problem);
    console.log(`[${new Date().toLocaleTimeString()}] Solutions generated.`)
    await fs.writeFile("io/solutions.json", JSON.stringify(solutions, null, 2))

    console.log(`[${new Date().toLocaleTimeString()}] Generating Test Cases for the given Problem...`)
    const testCases = await generateTestCases(problem, solutions)
    console.log(`[${new Date().toLocaleTimeString()}] Test cases generated. Count: ${testCases?.test_cases?.length || 0}`)
    await fs.writeFile("io/test_cases.json", JSON.stringify(testCases, null, 2))

    const valid = []

    if (!testCases || !testCases.code_stubs || !testCases.test_cases) {
        throw new Error("Invalid test cases structure returned from LLM.");
    }

    const codeStubs = testCases.code_stubs

    /* const c1 = `${solutions.brute_force || ""}\n\n${codeStubs.brute_force}`
    const c2 = `${solutions.optimal || ""}\n\n${codeStubs.optimal}` */

    const c1 = codeStubs.brute_force
    const c2 = codeStubs.optimal

    console.log(`[${new Date().toLocaleTimeString()}] Validating test cases...`)
    for (let i = 0; i < testCases.test_cases.length; i++) {
        const testCase = testCases.test_cases[i];
        try {
            process.stdout.write(`  Running test case ${i + 1}/${testCases.test_cases.length}... `);

            // Run brute force solution
            const o1 = await runCode(c1, testCase.input)

            // Run optimal solution
            const o2 = await runCode(c2, testCase.input)

            const output1 = (o1 || "").trim();
            const output2 = (o2 || "").trim();
            const expected = (testCase.output || "").trim();

            // Advanced Validations
            const normalize = (str) => str.replace(/\s+/g, "");
            const isMatch = (a, b) => {
                if (a === b) return true;
                if (normalize(a) === normalize(b)) return true;

                if (!a.trim() || !b.trim()) return false;

                const numA = Number(a);
                const numB = Number(b);

                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA == numB;
                }

                return false;
            };

            if (isMatch(output2, expected)) {
                process.stdout.write("PASSED\n");
                valid.push(testCase)
            } else {
                process.stdout.write(`FAILED (Expected: ${expected}, Got: BF=${output1}, OPT=${output2})\n`);
            }
        } catch (e) {
            console.error(`ERROR: ${e.message}\n`);
        }
    }

    console.log(`[${new Date().toLocaleTimeString()}] Validation complete. ${valid.length}/${testCases.test_cases.length} valid test cases found.`)
    await fs.writeFile("io/output.json", JSON.stringify(valid, null, 2))

    return {
        solutions: {
            brute_force: c1,
            optimal: c2
        },
        test_cases: valid
    }
}

export {
    pipeline
}