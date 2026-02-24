document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const inputGroups = document.querySelectorAll('.input-group');
    const generateBtn = document.getElementById('generate-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultArea = document.getElementById('result-area');
    const jsonOutput = document.getElementById('json-output');
    const copyBtn = document.getElementById('copy-btn');
    const urlInput = document.getElementById('leetcode-url');
    const textInput = document.getElementById('problem-text');

    const resultTabs = document.querySelectorAll('.result-tab');
    
    let activeTab = 'url'; // Default

    // Tab Switching for Inputs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;

            inputGroups.forEach(group => {
                group.classList.remove('active');
                if (group.id === `${activeTab}-input-group`) {
                    group.classList.add('active');
                    // Focus input
                    const input = group.querySelector('input, textarea');
                    if(input) input.focus();
                }
            });
        });
    });

    // Tab Switching for Results (Test Cases vs Solutions)
    resultTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active tab state
            resultTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Show relevant pane
            const targetId = tab.dataset.target;
            document.querySelectorAll('.result-pane').forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetId) {
                    pane.classList.add('active');
                }
            });
        });
    });

    // Generate Button
    generateBtn.addEventListener('click', async () => {
        const payload = {};
        
        // Validation
        if (activeTab === 'url') {
            const url = urlInput.value.trim();
            if (!url) {
                alert('Please enter a LeetCode URL');
                urlInput.focus();
                return;
            }
            if (!isValidUrl(url)) {
                alert('Please enter a valid URL');
                urlInput.focus();
                return;
            }
            payload.url = url;
        } else {
            const text = textInput.value.trim();
            if (!text) {
                alert('Please enter the problem statement');
                textInput.focus();
                return;
            }
            payload.problem_statement = text;
        }

        // UI State: Loading
        setLoading(true);
        resultArea.classList.add('hidden');
        jsonOutput.innerHTML = '';

        try {
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate test cases');
            }

            // Success
            displayResult(data);
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    });

    // Suggestion: Handle result tab clicking logic here if needed (e.g. tracking analytics)

    // Copy to Clipboard (Test Cases)
    copyBtn.addEventListener('click', () => {
        const text = jsonOutput.innerText; // Get raw text
        copyToClipboard(text, copyBtn);
    });

    // Copy to Clipboard (Solutions)
    const copySolutionBtns = document.querySelectorAll('.copy-solution-btn');
    copySolutionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const codeElement = document.getElementById(targetId);
            if (codeElement) {
                copyToClipboard(codeElement.innerText, btn);
            }
        });
    });

    // Generic Copy function
    function copyToClipboard(text, btn) {
        navigator.clipboard.writeText(text).then(() => {
            const originalIcon = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => {
                btn.innerHTML = originalIcon;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            generateBtn.disabled = true;
            generateBtn.classList.add('loading');
            loadingIndicator.classList.remove('hidden');
        } else {
            generateBtn.disabled = false;
            generateBtn.classList.remove('loading');
            loadingIndicator.classList.add('hidden');
        }
    }

    function displayResult(data) {
        resultArea.classList.remove('hidden');

        // Extract test_cases array if present
        const testCases = data.test_cases || data;
        const solutions = data.solutions || {};

        const count = Array.isArray(testCases) ? testCases.length : 0;
        
        // Update count badge
        const countElement = document.getElementById('test-case-count');
        if (countElement) {
            countElement.textContent = `${count} Case${count !== 1 ? 's' : ''}`;
        }

        // Set JSON Content
        const jsonString = JSON.stringify(testCases, null, 4);
        jsonOutput.textContent = jsonString; // Use textContent to let Prism parse it

        // Update Solutions Content
        const bruteForceCode = document.getElementById('brute-force-code');
        const optimalCode = document.getElementById('optimal-code');

        if (bruteForceCode) bruteForceCode.textContent = solutions.brute_force || '# No brute force solution available';
        if (optimalCode) optimalCode.textContent = solutions.optimal || '# No optimal solution available';
        
        // Trigger Prism Highlight
        if (window.Prism) {
            Prism.highlightAll();
        }

        // Scroll to result
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Deprecated manual highlight function
    // function syntaxHighlight(json) { ... }

    // Helper functions
    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
});
