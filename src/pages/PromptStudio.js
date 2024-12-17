import React, { useState, useEffect } from 'react';
import './PromptStudio.css';
import SavedItemsList from '../components/SavedItemsList';
import { SystemPromptTooltip, DataHandlingTooltip, DefaultUserPromptTooltip } from '../components/Tooltips';
import Footer from '../components/Footer';

function PromptStudio() {
    const [prompts, setPrompts] = useState([]);
    const [newPrompt, setNewPrompt] = useState({
        name: '',
        system_prompt: '',
        data_handling: '',
        default_user_prompt: '',
        prompt_type: 'autonomous',
        generate_list: false,
        is_loop_prompt: false,
        loop_variable: ''
    });
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [showTooltip, setShowTooltip] = useState(false);
    const [showSystemTooltip, setShowSystemTooltip] = useState(false);
    const [showUserTooltip, setShowUserTooltip] = useState(false);
    const [showDataTooltip, setShowDataTooltip] = useState(false);
    const [showListTooltip, setShowListTooltip] = useState(false);
    const [showHumanInputTooltip, setShowHumanInputTooltip] = useState(false);
    const [showLoopTooltip, setShowLoopTooltip] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [deleteConfirmation, setDeleteConfirmation] = useState({
        show: false,
        promptId: null,
        promptName: ''
    });

    useEffect(() => {
        fetchPrompts();
    }, []);

    const fetchPrompts = async () => {
        try {
            const apiUrl = `${process.env.REACT_APP_API_URL}prompts/`;
            console.log('Fetching prompts from:', apiUrl);
            console.log('Current origin:', window.location.origin);
            console.log('Full URL:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }

            const data = await response.json();
            console.log('Received prompts data:', data);
            setPrompts(data);
        } catch (error) {
            console.error('Error fetching prompts:', error);
            console.error('Error stack:', error.stack);
        }
    };

    const createPrompt = async (promptData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}prompts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(promptData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchPrompts();
            resetForm();
        } catch (error) {
            console.error('Error creating prompt:', error);
        }
    };

    const updatePrompt = async (promptData) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}prompts/${selectedPrompt.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(promptData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchPrompts();
            resetForm();
        } catch (error) {
            console.error('Error updating prompt:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleSavePrompt();
    };

    const handleSavePrompt = async () => {
        try {
            setSaveStatus('saving');
            const promptData = {
                ...newPrompt,
                prompt_type: newPrompt.is_loop_prompt ? 'loop' : newPrompt.prompt_type
            };

            if (isEditing) {
                await updatePrompt(promptData);
            } else {
                await createPrompt(promptData);
            }

            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);

        } catch (error) {
            console.error('Error saving prompt:', error);
            setSaveStatus('error');
            setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);
        }
    };

    const handleDeletePrompt = async (promptId) => {
        const prompt = prompts.find(p => p.id === promptId);
        setDeleteConfirmation({
            show: true,
            promptId,
            promptName: prompt?.name || 'this prompt'
        });
    };

    const confirmDelete = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}prompts/${deleteConfirmation.promptId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchPrompts();

            if (selectedPrompt?.id === deleteConfirmation.promptId) {
                resetForm();
            }

            setDeleteConfirmation({ show: false, promptId: null, promptName: '' });

        } catch (error) {
            console.error('Error deleting prompt:', error);
            alert('Error deleting prompt: ' + error.message);
        }
    };

    const handleEditPrompt = (prompt) => {
        // If clicking the same prompt that's already selected, clear the selection
        if (selectedPrompt?.id === prompt.id) {
            setSelectedPrompt(null);
            resetForm();
            setIsEditing(false);
            return;
        }

        // Otherwise, select the new prompt
        setSelectedPrompt(prompt);
        setNewPrompt({
            name: prompt.name,
            system_prompt: prompt.system_prompt,
            data_handling: prompt.data_handling || '',
            default_user_prompt: prompt.default_user_prompt || '',
            prompt_type: prompt.prompt_type || 'autonomous',
            generate_list: prompt.generate_list || false,
            is_loop_prompt: prompt.is_loop_prompt || false,
            loop_variable: prompt.loop_variable || ''
        });
        setIsEditing(true);
    };

    const resetForm = () => {
        setSelectedPrompt(null);
        setNewPrompt({
            name: '',
            system_prompt: '',
            data_handling: '',
            default_user_prompt: '',
            prompt_type: 'autonomous',
            generate_list: false,
            is_loop_prompt: false,
            loop_variable: ''
        });
        setIsEditing(false);
    };

    const SystemPromptTooltip = ({ onClose }) => (
        <>
            <div className="tooltip-modal-overlay" onClick={onClose} />
            <div className="tooltip-modal">
                <div className="tooltip-modal-header">
                    <div className="tooltip-modal-title">System Prompt Guide</div>
                    <button className="tooltip-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="tooltip-modal-content">
                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Purpose</div>
                        <p>Initial instructions that define how the AI should behave and process information.</p>
                    </div>

                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Format</div>
                        <ul className="tooltip-list">
                            <li>For regular prompts: Free text instructions</li>
                            <li>For list generation: Must output JSON array of strings</li>
                        </ul>
                    </div>

                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Examples</div>
                        <div className="tooltip-code">
                            Regular: You are a text analyzer. Analyze the following text and provide insights.
                        </div>
                        <div className="tooltip-code">
                            List: Generate a list based on the input. Format as: ["item1", "item2", "item3"]
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const UserPromptTooltip = () => (
        <div className="tooltip tooltip-user">
            <button className="tooltip-close" onClick={() => setShowUserTooltip(false)}>×</button>
            <div className="tooltip-content">
                <div className="tooltip-section">
                    <div className="tooltip-title">User Prompt Guide</div>
                    <p>The actual task or question for the AI.</p>
                </div>

                <div className="tooltip-section">
                    <div className="tooltip-title">Variable Usage</div>
                    <div className="tooltip-code">${'{variable_name}'}</div>
                    <p>Example: "Analyze this ${'{text}'} and provide insights."</p>
                </div>

                <div className="tooltip-section">
                    <div className="tooltip-title">Tips</div>
                    <ul className="tooltip-list">
                        <li>Be clear and specific</li>
                        <li>Use variables for dynamic content</li>
                        <li>Break complex tasks into steps</li>
                    </ul>
                </div>
            </div>
        </div>
    );

    const DataHandlingTooltip = ({ onClose }) => (
        <>
            <div className="tooltip-modal-overlay" onClick={onClose} />
            <div className="tooltip-modal">
                <div className="tooltip-modal-header">
                    <div className="tooltip-modal-title">Data Handling Guide</div>
                    <button className="tooltip-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="tooltip-modal-content">
                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Storage Commands</div>
                        <ul className="tooltip-list">
                            <li>Save response: <code>save output in $$variable_name</code></li>
                            <li>Append to list: <code>append output to $$list_name</code></li>
                            <li>List output: <code>save output in $$output_list</code></li>
                        </ul>
                    </div>

                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Important Notes</div>
                        <ul className="tooltip-list">
                            <li>Always use $$ prefix for variable names</li>
                            <li>For list prompts, use $$output_list</li>
                            <li>Variables can be used in subsequent prompts</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        console.log('Input changed:', name, value);
        setNewPrompt(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleListGenerationToggle = (e) => {
        const generateList = e.target.checked;
        setNewPrompt(prev => ({
            ...prev,
            generate_list: generateList,
            system_prompt: generateList ?
                `Generate a list based on the input.
Format your response as a valid JSON array of strings.
Example output: ["item1", "item2", "item3"]` : prev.system_prompt,
            data_handling: generateList ? 'save output in $$output_list' : prev.data_handling
        }));
    };

    const handleLoopPromptToggle = (e) => {
        const isLoop = e.target.checked;
        setNewPrompt(prev => ({
            ...prev,
            is_loop_prompt: isLoop,
            prompt_type: isLoop ? 'loop' : 'autonomous',
            loop_variable: isLoop ? prev.loop_variable : ''
        }));
    };

    useEffect(() => {
        console.log('Current form data:', newPrompt);
    }, [newPrompt]);

    const ListOutputTooltip = ({ onClose }) => (
        <>
            <div className="tooltip-modal-overlay" onClick={onClose} />
            <div className="tooltip-modal">
                <div className="tooltip-modal-header">
                    <div className="tooltip-modal-title">List Output Guide</div>
                    <button className="tooltip-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="tooltip-modal-content">
                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Purpose</div>
                        <p>Generate a list of items as output. The response will be automatically formatted as a JSON array.</p>
                    </div>

                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">When Enabled</div>
                        <ul className="tooltip-list">
                            <li>System prompt will be configured for list generation</li>
                            <li>Output will be saved in $$output_list</li>
                            <li>Response must be a JSON array of strings</li>
                        </ul>
                    </div>

                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Example Output</div>
                        <div className="tooltip-code">
                            ["item1", "item2", "item3"]
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const HumanInputTooltip = ({ onClose }) => (
        <>
            <div className="tooltip-modal-overlay" onClick={onClose} />
            <div className="tooltip-modal">
                <div className="tooltip-modal-header">
                    <div className="tooltip-modal-title">Human Input Guide</div>
                    <button className="tooltip-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="tooltip-modal-content">
                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Purpose</div>
                        <p>Pause execution to request input from the user before proceeding.</p>
                    </div>

                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">When to Use</div>
                        <ul className="tooltip-list">
                            <li>Interactive workflows requiring user decisions</li>
                            <li>Manual data input requirements</li>
                            <li>Review and approval steps</li>
                        </ul>
                    </div>

                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Behavior</div>
                        <p>The agent will pause and wait for user input before continuing to the next step.</p>
                    </div>
                </div>
            </div>
        </>
    );

    const LoopPromptTooltip = ({ onClose }) => (
        <>
            <div className="tooltip-modal-overlay" onClick={onClose} />
            <div className="tooltip-modal">
                <div className="tooltip-modal-header">
                    <div className="tooltip-modal-title">Loop Prompt Guide</div>
                    <button className="tooltip-modal-close" onClick={onClose}>×</button>
                </div>
                <div className="tooltip-modal-content">
                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Purpose</div>
                        <p>Execute this prompt for each item in a specified list variable.</p>
                    </div>

                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Configuration</div>
                        <ul className="tooltip-list">
                            <li>Specify the list variable to iterate over</li>
                            <li>Use ${'{item}'} to reference current item</li>
                            <li>Results can be collected into a new list</li>
                        </ul>
                    </div>

                    <div className="tooltip-modal-section">
                        <div className="tooltip-modal-section-title">Example</div>
                        <div className="tooltip-code">
                            Loop Variable: movies_list
                            User Prompt: Analyze this movie: ${'{item}'}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code).then(() => {
            // Find the button element and add the copied class
            const button = document.querySelector(`button[data-code="${code}"]`);
            if (button) {
                button.textContent = 'Copied!';
                button.classList.add('copied');
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 2000);
            }
        });
    };

    return (
        <div className="page-wrapper">
            <div className="prompt-studio">
                <div className="prompt-studio-sidebar">
                    <SavedItemsList
                        title="Saved Prompts"
                        items={prompts}
                        selectedItem={selectedPrompt}
                        onItemClick={handleEditPrompt}
                        onItemDelete={handleDeletePrompt}
                        type="prompt"
                    />
                </div>

                <div className="prompt-studio-main">
                    <div className="prompt-studio-form">
                        <h2>{isEditing ? 'Edit Prompt' : 'Create New Prompt'}</h2>

                        <div className="prompt-field">
                            <div className="prompt-field-header">
                                <label className="prompt-field-label">Prompt Name:</label>
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={newPrompt.name}
                                onChange={handleInputChange}
                                placeholder="Enter prompt name"
                            />
                        </div>

                        <div className="prompt-field">
                            <div className="prompt-field-header">
                                <label className="prompt-field-label">System Prompt:</label>
                                <i
                                    className="fas fa-question-circle info-icon"
                                    onClick={() => setShowSystemTooltip(true)}
                                ></i>
                                {showSystemTooltip && (
                                    <SystemPromptTooltip onClose={() => setShowSystemTooltip(false)} />
                                )}
                            </div>
                            <textarea
                                name="system_prompt"
                                value={newPrompt.system_prompt}
                                onChange={handleInputChange}
                                placeholder="Enter system prompt"
                            />
                        </div>

                        <div className="prompt-field">
                            <div className="prompt-field-header">
                                <label className="prompt-field-label">Data Handling:</label>
                                <i
                                    className="fas fa-question-circle info-icon"
                                    onClick={() => setShowDataTooltip(true)}
                                ></i>
                                {showDataTooltip && (
                                    <DataHandlingTooltip onClose={() => setShowDataTooltip(false)} />
                                )}
                            </div>
                            <textarea
                                name="data_handling"
                                value={newPrompt.data_handling}
                                onChange={handleInputChange}
                                placeholder="Enter data handling instructions"
                            />
                        </div>

                        <div className="quick-reference">
                            <div className="quick-reference-title">
                                <i className="fas fa-lightbulb"></i>
                                Quick Reference
                            </div>
                            <ul className="quick-reference-list">
                                <li className="quick-reference-item">
                                    <i className="fas fa-save"></i>
                                    <div className="quick-reference-code" onClick={() => handleCopyCode('save output in $$variable')}>
                                        save output in $$variable
                                        <button
                                            className="copy-button"
                                            data-code="save output in $$variable"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyCode('save output in $$variable');
                                            }}
                                        >
                                            Copy
                                        </button>
                                        <span className="tooltip">Click to copy</span>
                                    </div>
                                    <span className="quick-reference-description">Save entire response</span>
                                </li>
                                <li className="quick-reference-item">
                                    <i className="fas fa-list"></i>
                                    <div className="quick-reference-code" onClick={() => handleCopyCode('append output to $$list_name')}>
                                        append output to $$list_name
                                        <button
                                            className="copy-button"
                                            data-code="append output to $$list_name"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyCode('append output to $$list_name');
                                            }}
                                        >
                                            Copy
                                        </button>
                                        <span className="tooltip">Click to copy</span>
                                    </div>
                                    <span className="quick-reference-description">Add to list variable</span>
                                </li>
                                <li className="quick-reference-item">
                                    <i className="fas fa-code"></i>
                                    <div className="quick-reference-code" onClick={() => handleCopyCode('${variable}')}>
                                        ${'{variable}'}
                                        <button
                                            className="copy-button"
                                            data-code="${variable}"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyCode('${variable}');
                                            }}
                                        >
                                            Copy
                                        </button>
                                        <span className="tooltip">Click to copy</span>
                                    </div>
                                    <span className="quick-reference-description">Use variable in prompts</span>
                                </li>
                                <li className="quick-reference-item">
                                    <i className="fas fa-tags"></i>
                                    <div className="quick-reference-code" onClick={() => handleCopyCode('<var>namevalue</var>')}>
                                        {'<var>namevalue</var>'}
                                        <button
                                            className="copy-button"
                                            data-code="<var>namevalue</var>"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCopyCode('<var>namevalue</var>');
                                            }}
                                        >
                                            Copy
                                        </button>
                                        <span className="tooltip">Click to copy</span>
                                    </div>
                                    <span className="quick-reference-description">AI defines variable</span>
                                </li>
                            </ul>
                        </div>

                        <div className="prompt-field">
                            <div className="prompt-field-header">
                                <label className="prompt-field-label">Default User Prompt (Optional):</label>
                                <i
                                    className="fas fa-question-circle info-icon"
                                    onClick={() => setShowUserTooltip(true)}
                                ></i>
                                {showUserTooltip && (
                                    <DefaultUserPromptTooltip onClose={() => setShowUserTooltip(false)} />
                                )}
                            </div>
                            <textarea
                                name="default_user_prompt"
                                value={newPrompt.default_user_prompt}
                                onChange={handleInputChange}
                                placeholder="Enter default user prompt"
                            />
                        </div>

                        <div className="toggle-options">
                            <div className="toggle-row">
                                <span className="toggle-label">List Output</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={newPrompt.generate_list}
                                        onChange={handleListGenerationToggle}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-row">
                                <span className="toggle-label">Human Input Required</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={newPrompt.prompt_type === 'human'}
                                        onChange={(event) => handleInputChange({
                                            target: {
                                                name: 'prompt_type',
                                                value: event.target.checked ? 'human' : 'autonomous'
                                            }
                                        })}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            <div className="toggle-row">
                                <span className="toggle-label">Loop Prompt</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={newPrompt.is_loop_prompt}
                                        onChange={handleLoopPromptToggle}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>
                        </div>

                        {newPrompt.is_loop_prompt && (
                            <div className="loop-variable-input">
                                <input
                                    type="text"
                                    name="loop_variable"
                                    value={newPrompt.loop_variable}
                                    onChange={handleInputChange}
                                    placeholder="Enter list variable name (e.g., items_list)"
                                />
                            </div>
                        )}

                        <button
                            className={`save-prompt-button ${saveStatus !== 'idle' ? saveStatus : ''}`}
                            onClick={handleSavePrompt}
                            disabled={!newPrompt.name.trim() || !newPrompt.system_prompt.trim() || saveStatus !== 'idle'}
                        >
                            {saveStatus === 'saving' ? '' :
                                saveStatus === 'success' ? 'Saved Successfully!' :
                                    isEditing ? 'Update Prompt' : 'Save Prompt'}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
            {deleteConfirmation.show && (
                <div className="delete-confirmation-overlay">
                    <div className="delete-confirmation-modal">
                        <div className="delete-confirmation-header">
                            <i className="fas fa-exclamation-triangle"></i>
                            <h3>Delete Prompt</h3>
                        </div>
                        <div className="delete-confirmation-content">
                            Are you sure you want to delete "{deleteConfirmation.promptName}"?
                            This action cannot be undone.
                        </div>
                        <div className="delete-confirmation-buttons">
                            <button
                                className="delete-cancel-button"
                                onClick={() => setDeleteConfirmation({ show: false, promptId: null, promptName: '' })}
                            >
                                Cancel
                            </button>
                            <button
                                className="delete-confirm-button"
                                onClick={confirmDelete}
                            >
                                Delete Prompt
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className={`save-feedback ${saveStatus === 'success' ? 'show' : ''}`}>
                <i className="fas fa-check-circle"></i>
                {isEditing ? 'Prompt Updated Successfully!' : 'Prompt Saved Successfully!'}
            </div>
        </div>
    );
}

export default PromptStudio; 