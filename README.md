# LeetCode Test Case Generator & Validator

An automated tool that fetches LeetCode problems, generates solutions (Brute Force & Optimal) using a local LLM (Ollama), creates diverse test cases, and validates the solutions against each other.

## Features

- **Problem Fetching**: Scrapes problem descriptions directly from LeetCode URLs using Puppeteer.
- **Solution Generation**: Uses an LLM (via Ollama) to generate Python code for both Brute Force and Optimal solutions.
- **Test Case Generation**: Automatically creates a set of test cases, edge cases, and large inputs.
- **Automated Verification**: Runs the generated solutions locally against the test cases and validates the outputs.
- **Artifact Saving**: Saves the fetched problem, generated code, test cases, and validation results to the `io/` directory for inspection.
- **API Support**: Provides a REST API to interact with the generator.

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
   
   # Optional: Defaults to "minimax-m2.5:cloud" or your preferred model
   OLLAMA_MODEL=minimax-m2.5:cloud
   
   # Optional: Port for the server (defaults to 3000)
   PORT=3000
   ```

## Usage

### Web Interface

The application now includes a modern, user-friendly web interface for generating test cases.

1.  **Start the Server**: Run `node index.js`.
2.  **Open Browser**: Navigate to `http://localhost:3000`.
3.  **Input Problem**:
    *   **LeetCode URL**: Paste the URL of the LeetCode problem (e.g., `https://leetcode.com/problems/two-sum/`).
    *   **Problem Text**: Paste the full problem description in text markdown format.
4.  **Generate**: Click the **Generate Test Cases** button.
5.  **View Results**:
    *   **Test Cases**: View the generated test cases in prettified JSON format.
    *   **Solutions**: Switch to the "Solutions" tab to see the generated Python code for both Brute Force and Optimal solutions.
    *   **Copy**: Use the copy buttons to easily copy the test cases or solution code to your clipboard.

### API Usage

1. Start the server:
   ```bash
   node index.js
   ```
   The server will start on `http://localhost:3000` (or your configured PORT).

2. Generate Test Cases via API:

   **Endpoint:** `POST /generate`

   **Body:**
   ```json
   {
       "url": "https://leetcode.com/problems/two-sum/",
       "problem_statement": "Or provide the full text/markdown of the problem here"
   }
   ```
   *Note: Provide either `url` OR `problem_statement`, not both.*

   **Response:**
   ```json
   {
       "test_cases": [ ... ],
       "solutions": {
         "brute_force": "<Python Code>",
         "optimal": "<Python Code>"
       }
       "success": true
   }
   ```

## Docker

You can also run the application using Docker.

1. Build the image:
   ```bash
   docker build -t test-case-generator .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 test-case-generator
   ```

3. Interact with the API as described in the Usage section above.

The application will:
- Fetch the problem content.
- Generate efficient and brute-force Python solutions.
- Generate a suite of test cases.
- Run the code and compare the outputs.
- Results will be logged to the server console and returned in the API response.
- Artifacts (problem, code, test cases) are also saved in the `io/` folder inside the container.

## Output Structure

The `io/` directory will contain the generated artifacts:
- `problem.txt`: The scraped problem description.
- `solutions.json`: The generated Python code for solutions.
- `test_cases.json`: The generated test cases (inputs/outputs).
- `output.json`: The results of the valid test cases that passed verification.

## Architecture

- **`index.js`**: Express server entry point that handles API requests.
- **`pipeline.js`**: Orchestrates the core logic: fetching, generating, and validating.
- **`utils.js`**: Helper functions for Ollama interaction, Puppeteer scraping, and file operations.
- **`compiler.js`**: Manages the execution of generated Python code using `child_process`.
- **`prompts/`**: Contains the system prompts used to guide the LLM.

## License

ISC
