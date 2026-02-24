# LeetCode Test Case Generator & Validator

An automated tool that fetches LeetCode problems, generates solutions (Brute Force & Optimal) using a local LLM (Ollama), creates diverse test cases, and validates the solutions against each other.

## Features

- **Problem Fetching**: Scrapes problem descriptions directly from LeetCode URLs using Puppeteer.
- **Solution Generation**: Uses an LLM (via Ollama) to generate Python code for both Brute Force and Optimal solutions.
- **Test Case Generation**: Automatically creates a set of test cases, edge cases, and large inputs.
- **Automated Verification**: Runs the generated solutions locally against the test cases and validates the outputs.
- **Artifact Saving**: Saves the fetched problem, generated code, test cases, and validation results to the `io/` directory for inspection.

## Prerequisites

- **Node.js**: Ensure Node.js is installed.
- **Python**: Required to execute the generated solution code.
- **Ollama**: You need [Ollama](https://ollama.com/) running locally or accessible via a URL.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd test-case-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   # Optional: Defaults to http://localhost:11434
   OLLAMA_HOST=http://localhost:11434
   
   # Optional: Defaults to minimax-m2.5:cloud or your preferred model
   OLLAMA_MODEL=llama3:latest 
   ```

## Usage

1. Start the application:
   ```bash
   node index.js
   ```

2. Enter a LeetCode problem URL when prompted:
   ```
   :> https://leetcode.com/problems/two-sum/description
   ```

3. The tool will perform the following steps:
   - Fetch the problem content.
   - Generate efficient and brute-force Python solutions.
   - Generate a suite of test cases.
   - Run the code and compare the outputs.
   - Results will be logged to the console and saved in the `io/` folder.

## Output Structure

The `io/` directory will contain the generated artifacts:
- `problem.txt`: The scraped problem description.
- `solutions.json`: The generated Python code for solutions.
- `test_cases.json`: The generated test cases (inputs/outputs).
- `output.json`: The results of the valid test cases that passed verification.

## Architecture

- **`index.js`**: Main CLI entry point that orchestrates the flow.
- **`utils.js`**: Handles interactions with Ollama and Puppeteer for fetching/generation.
- **`compiler.js`**: Manages the execution of generated Python code using `child_process`.
- **`prompts/`**: Contains the system prompts used to guide the LLM.

## License

ISC
