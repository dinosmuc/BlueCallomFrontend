import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './IO.css';
import SavedItemsList from '../components/SavedItemsList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faList, faEye, faTimes, faSync, faFile, faChevronDown, faFont } from '@fortawesome/free-solid-svg-icons';
import Footer from '../components/Footer';
import WorkflowBuilder from '../components/WorkflowBuilder';


function IO() {
    const [prompts, setPrompts] = useState([]);
    const [agents, setAgents] = useState([]);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentExecutingPrompt, setCurrentExecutingPrompt] = useState(-1);
    const [pausedExecution, setPausedExecution] = useState(null);
    const [humanInputs, setHumanInputs] = useState({});
    const [typingText, setTypingText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [selectedVariable, setSelectedVariable] = useState(null);
    const [variables, setVariables] = useState({});
    const [promptOutputs, setPromptOutputs] = useState([]);
    const [hasRun, setHasRun] = useState(false);
    const [openVariables, setOpenVariables] = useState({});
    const [showContentModal, setShowContentModal] = useState(false);
    const [openSteps, setOpenSteps] = useState({});
    const [selectedContent, setSelectedContent] = useState(null);

    useEffect(() => {
        fetchPrompts();
        fetchAgents();
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}prompts/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setPrompts(data);
        } catch (error) {
            console.error('Error fetching prompts:', error);
        }
    };

    const fetchAgents = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}agents/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAgents(data);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    const formatStepOutput = (output, type, iterations) => {
        if (type === 'loop' && iterations) {
            return iterations.map((iteration, idx) => ({
                item: iteration.item,
                output: iteration.output
            }));
        }
        return output;
    };

    const handleRun = async () => {
        console.log('Starting agent execution');
        setIsLoading(true);
        setOutput('');
        setHasRun(false);

        try {
            let response;

            if (selectedAgent) {
                console.log('Executing agent:', selectedAgent);
                response = await fetch(`${process.env.REACT_APP_API_URL}agents/${selectedAgent.id}/execute/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ input: userInput })
                });
            } else if (selectedPrompt) {
                console.log('Executing single prompt:', selectedPrompt);
                response = await fetch(`${process.env.REACT_APP_API_URL}prompts/${selectedPrompt.id}/execute/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        input: userInput,
                        system_prompt: selectedPrompt.system_prompt,
                        user_prompt: selectedPrompt.default_user_prompt || userInput
                    })
                });
            }

            const data = await response.json();
            console.log('Execution response:', data);

            if (selectedAgent) {
                if (data.execution_result) {
                    console.log('Agent execution result:', data.execution_result);
                    setVariables(data.execution_result.variables || {});
                    setPromptOutputs(data.execution_result.prompt_outputs || []);
                    setOutput(data.execution_result.response || '');
                    setHasRun(true);
                }
            } else {
                console.log('Single prompt result:', data);
                // Handle single prompt response
                let formattedOutput;
                try {
                    const parsed = JSON.parse(data.response);
                    console.log('Parsed JSON response:', parsed);
                    if (Array.isArray(parsed)) {
                        formattedOutput = parsed.join('\n• ');
                        if (formattedOutput) {
                            formattedOutput = '• ' + formattedOutput;
                        }
                    } else {
                        formattedOutput = JSON.stringify(parsed, null, 2);
                    }
                } catch (e) {
                    console.log('Non-JSON response:', data.response);
                    formattedOutput = data.response;
                }
                setOutput(formattedOutput);
                setHasRun(true);
            }
        } catch (error) {
            console.error('Error during execution:', error);
            setOutput('Error executing: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePromptSelect = (prompt) => {
        if (selectedPrompt?.id === prompt.id) {
            setSelectedPrompt(null);
        } else {
            setSelectedPrompt(prompt);
            setSelectedAgent(null);
            setVariables({});
            setPromptOutputs([]);
        }
        setOutput('');
    };

    const handleAgentSelect = (agent) => {
        if (selectedAgent?.id === agent.id) {
            setSelectedAgent(null);
            setVariables({});
            setPromptOutputs([]);
        } else {
            setSelectedAgent(agent);
            setSelectedPrompt(null);
            setPromptOutputs([]);

            // Initialize variables with the agent's variables
            if (agent && agent.variables) {
                const initialVariables = {};
                agent.variables.forEach(variable => {
                    initialVariables[variable.name] = variable.default_value || '';
                });
                setVariables(initialVariables);
            }
        }
        setOutput('');
    };

    const handleHumanInputSubmit = async () => {
        if (!pausedExecution) return;

        setHumanInputs(prev => ({
            ...prev,
            [pausedExecution.agent_prompt_id]: userInput
        }));
        setUserInput('');
        setPausedExecution(null);
        handleRun();
    };

    const animateTyping = (text, speed = 5) => {
        setIsTyping(true);
        let currentText = '';
        const words = text.split(' ');

        const typeWord = (index) => {
            if (index < words.length) {
                currentText += (index > 0 ? ' ' : '') + words[index];
                setTypingText(currentText);
                setTimeout(() => typeWord(index + 1), speed);
            } else {
                setIsTyping(false);
            }
        };

        typeWord(0);
    };

    const handleOutput = (text) => {
        if (!text) {
            console.log('No output text provided');
            return;
        }

        // Reset typing state
        setTypingText('');
        setIsTyping(true);

        // Ensure text is a string
        const outputText = text.toString();

        // Split the text into characters
        const characters = outputText.split('');
        let currentText = '';
        let currentIndex = 0;

        // Type each character
        const typingInterval = setInterval(() => {
            if (currentIndex < characters.length) {
                currentText += characters[currentIndex];
                setTypingText(currentText);
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setIsTyping(false);
            }
        }, 10); // Adjust typing speed as needed
    };

    const handleVariableClick = (varName) => {
        if (variables && variables[varName]) {
            setSelectedVariable({
                name: varName,
                value: variables[varName]
            });
        }
    };

    const closeModal = () => {
        setSelectedVariable(null);
    };

    const ExecutionHistory = ({ promptOutputs }) => {
        return (
            <div className="execution-history">
                <div className="execution-steps-title">Execution Steps</div>
                {promptOutputs.map((step, index) => (
                    <details key={index} className="step-details">
                        <summary className="step-summary">
                            Step {index + 1}: {step.name}
                            {step.type === 'loop' && <span className="loop-indicator">🔄</span>}
                        </summary>
                        <div className="step-content">
                            {step.type === 'loop' ? (
                                <div className="loop-iterations">
                                    {step.iterations.map((iteration, iterIndex) => (
                                        <details key={iterIndex} className="nested-dropdown">
                                            <summary className="nested-summary">
                                                Iteration {iterIndex + 1}: {iteration.item}
                                            </summary>
                                            <div className="nested-content">
                                                {iteration.output}
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            ) : (
                                <ReactMarkdown>{step.output}</ReactMarkdown>
                            )}
                        </div>
                    </details>
                ))}
            </div>
        );
    };

    const renderVariableValue = (value) => {
        if (Array.isArray(value)) {
            // Join array items with proper spacing and line breaks
            return (
                <div className="array-variable">
                    {value.map((item, index) => (
                        <div key={index} className="array-item">
                            {item.trim()} {/* Trim to remove any extra whitespace */}
                        </div>
                    ))}
                </div>
            );
        } else if (typeof value === 'string') {
            // Handle string values that might be JSON arrays
            try {
                const parsedValue = JSON.parse(value);
                if (Array.isArray(parsedValue)) {
                    return (
                        <div className="array-variable">
                            {parsedValue.map((item, index) => (
                                <div key={index} className="array-item">
                                    {item.trim()}
                                </div>
                            ))}
                        </div>
                    );
                }
            } catch (e) {
                // If not JSON, display as regular string
                return value;
            }
        }
        return String(value);
    };

    const VariableDisplay = ({ variables }) => {
        const handleViewContent = (key, value) => {
            setSelectedContent({ name: key, value });
            setShowContentModal(true);
        };

        const isListVariable = (value) => {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed);
            } catch {
                return Array.isArray(value);
            }
        };

        return (
            <div className="variables-grid">
                {Object.entries(variables).map(([key, value]) => (
                    <div key={key} className="variable-card">
                        <div className="variable-header">
                            <div className="variable-name-type">
                                <span className="variable-name">${key}</span>
                                <span className={`variable-type ${isListVariable(value) ? 'list-type' : 'text-type'}`}>
                                    {isListVariable(value) ? (
                                        <>
                                            <FontAwesomeIcon icon={faList} className="type-icon" />
                                            LIST
                                        </>
                                    ) : (
                                        <>
                                            <FontAwesomeIcon icon={faFont} className="type-icon" />
                                            TEXT
                                        </>
                                    )}
                                </span>
                            </div>
                        </div>
                        <button
                            className="view-content-button"
                            onClick={() => handleViewContent(key, value)}
                        >
                            <FontAwesomeIcon icon={faEye} />
                            View Content
                        </button>
                    </div>
                ))}

                {/* Content Modal */}
                {showContentModal && selectedContent && (
                    <div className="modal-overlay" onClick={() => setShowContentModal(false)}>
                        <div className="variable-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <div className="modal-title">
                                    <div className="variable-icon">
                                        <FontAwesomeIcon icon={faFile} />
                                    </div>
                                    <div className="variable-details">
                                        <h3>${selectedContent.name}</h3>
                                    </div>
                                </div>
                                <button
                                    className="modal-close"
                                    onClick={() => setShowContentModal(false)}
                                >
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>
                            <div className="modal-content">
                                <pre>{
                                    Array.isArray(selectedContent.value)
                                        ? selectedContent.value.join('\n')
                                        : selectedContent.value
                                }</pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const formatVariableContent = (content) => {
        try {
            // Try to parse and prettify JSON
            const parsed = JSON.parse(content);
            return JSON.stringify(parsed, null, 2);
        } catch {
            // If not JSON, return as is
            return content;
        }
    };

    const renderVariablesSection = () => {
        // Count variables that have content/values
        const filledVariablesCount = Object.values(variables).filter(variable =>
            variable && variable.value !== undefined && variable.value !== null
        ).length;

        return (
            <div className="agent-variables-section">
                <div className="agent-variables-header">
                    <h2 className="agent-variables-title">Agent Variables</h2>
                    <span className="variables-count">
                        {filledVariablesCount} filled variables
                    </span>
                </div>
                <div className="variables-grid">
                    {variables.map((variable, index) => (
                        <div key={index} className="variable-card">
                            <div className="variable-header">
                                <div className="variable-name">
                                    <FontAwesomeIcon icon={faDollarSign} className="dollar-icon" />
                                    {variable.name}
                                </div>
                                {variable.type === 'list' && (
                                    <span className="variable-type-badge">
                                        <FontAwesomeIcon icon={faList} className="list-icon" />
                                        LIST
                                    </span>
                                )}
                            </div>
                            <div className="variable-default">
                                Default: {variable.default_value || '[]'}
                            </div>
                            <button
                                className="view-content-button"
                                onClick={() => handleViewContent(variable)}
                            >
                                <FontAwesomeIcon icon={faEye} className="eye-icon" />
                                View Content
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const handleViewContent = (variable) => {
        setSelectedVariable(variable);
        setShowContentModal(true);
    };

    const toggleStep = (index) => {
        setOpenSteps(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const renderLoopPrompt = (iterations) => {
        return (
            <div className="loop-iterations">
                {iterations.map((iteration, index) => (
                    <details key={index} className="nested-dropdown">
                        <summary className="nested-summary">
                            Iteration {index + 1}: {iteration.item}
                        </summary>
                        <div className="nested-content">
                            {iteration.output}
                        </div>
                    </details>
                ))}
            </div>
        );
    };

    const renderPromptOutput = (prompt) => {
        if (prompt.type === 'loop' && prompt.iterations) {
            return renderLoopPrompt(prompt.iterations);
        }
        return <div className="prompt-output">{prompt.output}</div>;
    };

    const ExecutionSteps = ({ steps }) => {
        const getFinalOutput = () => {
            // Get the last step's output
            if (steps && steps.length > 0) {
                const lastStep = steps[steps.length - 1];
                if (lastStep.type === 'loop') {
                    // For loop steps, combine all iteration outputs
                    return lastStep.iterations
                        .map(iteration => iteration.output)
                        .join('\n\n');
                }
                return lastStep.output;
            }
            return null;
        };

        return (
            <>
                <div className="execution-steps">
                    <div className="execution-steps-title">Execution Steps</div>
                    {steps.map((step, index) => (
                        <details
                            key={index}
                            className={`step-details ${step.type === 'loop' ? 'loop-step' : ''}`}
                        >
                            <summary className="step-header">
                                <div className="step-title">
                                    <span className="step-number">{index + 1}</span>
                                    {step.name}
                                    {step.type === 'loop' && (
                                        <FontAwesomeIcon icon={faSync} className="loop-indicator" />
                                    )}
                                </div>
                                <FontAwesomeIcon icon={faChevronDown} className="expand-icon" />
                            </summary>
                            <div className="step-content">
                                {step.type === 'loop' ? (
                                    <div className="iterations-container">
                                        {step.iterations.map((iteration, iterIndex) => (
                                            <details key={iterIndex} className="nested-details">
                                                <summary className="iteration-header">
                                                    <div className="iteration-title">
                                                        <span className="iteration-number">{iterIndex + 1}</span>
                                                        <span className="movie-title">{iteration.item}</span>
                                                    </div>
                                                    <FontAwesomeIcon icon={faChevronDown} className="expand-collapse-icon" />
                                                </summary>
                                                <div className="iteration-content">
                                                    <div className="analysis-content">
                                                        <ReactMarkdown>{iteration.output}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            </details>
                                        ))}
                                    </div>
                                ) : (
                                    <ReactMarkdown>{step.output}</ReactMarkdown>
                                )}
                            </div>
                        </details>
                    ))}
                </div>

                {/* Final Output Section */}
                {getFinalOutput() && (
                    <div className="final-output-section">
                        <div className="final-output-header">
                            <h2 className="final-output-title">Final Output</h2>
                        </div>
                        <div className="final-output-content">
                            <div className="markdown-content">
                                <ReactMarkdown>
                                    {getFinalOutput()}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    const VariablesDisplay = ({ variables }) => {
        if (!variables || Object.keys(variables).length === 0) {
            return null;
        }

        return (
            <div className="variables-display">
                <h2>Variables</h2>
                {Object.entries(variables).map(([key, value]) => (
                    <div key={key} className="variable-item">
                        <div className="variable-header">
                            <span className="variable-name">{key}</span>
                            <span className="variable-type">
                                {Array.isArray(value) ? 'array' : typeof value}
                            </span>
                        </div>
                        <div className="variable-value">
                            {Array.isArray(value) ? (
                                <div className="array-variable">
                                    {value.map((item, idx) => (
                                        <div key={idx} className="array-item">
                                            {typeof item === 'object' ? JSON.stringify(item, null, 2) : item}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="regular-value">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="page-wrapper">
            <div className="io-container">
                <div className="io-sidebar">
                    <SavedItemsList
                        title="Saved Agents"
                        items={agents}
                        selectedItem={selectedAgent}
                        onItemClick={handleAgentSelect}
                        type="agent"
                        showDelete={false}
                    />

                    <SavedItemsList
                        title="Available Prompts"
                        items={prompts}
                        selectedItem={selectedPrompt}
                        onItemClick={handlePromptSelect}
                        type="prompt"
                        showDelete={false}
                    />
                </div>

                <div className="io-main-content">
                    {selectedAgent && (
                        <div className="agent-variables-section">
                            <h3>Agent Variables</h3>
                            <VariableDisplay variables={variables} />
                        </div>
                    )}

                    {selectedAgent && (
                        <div className="workflow-container">
                            <h3>Workflow Visualization</h3>
                            <WorkflowBuilder
                                workflowItems={selectedAgent.prompts.map(prompt => ({
                                    type: 'prompt',
                                    name: prompt.name,
                                    id: prompt.id,
                                    hideControls: true
                                }))}
                                onRemovePrompt={() => { }}
                                onMovePrompt={() => { }}
                            />
                        </div>
                    )}

                    <div className="io-input-area">
                        <textarea
                            className="io-input-field"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Enter your input here..."
                        />
                    </div>

                    <button
                        className="io-execute-button"
                        onClick={handleRun}
                        disabled={isLoading || (!selectedPrompt && !selectedAgent)}
                    >
                        {isLoading ? 'Processing...' : 'Run'}
                    </button>

                    {hasRun && selectedAgent && promptOutputs.length > 0 && (
                        <ExecutionSteps steps={promptOutputs} />
                    )}

                    {output && !selectedAgent && (
                        <div className="output-section">
                            <h3>Output</h3>
                            <div className="output-content">
                                <pre>{output}</pre>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default IO; 