import React from 'react';

export const SystemPromptTooltip = ({ onClose }) => (
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

export const DataHandlingTooltip = ({ onClose }) => (
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

export const DefaultUserPromptTooltip = ({ onClose }) => (
    <>
        <div className="tooltip-modal-overlay" onClick={onClose} />
        <div className="tooltip-modal">
            <div className="tooltip-modal-header">
                <div className="tooltip-modal-title">Default User Prompt Guide</div>
                <button className="tooltip-modal-close" onClick={onClose}>×</button>
            </div>
            <div className="tooltip-modal-content">
                <div className="tooltip-modal-section">
                    <div className="tooltip-modal-section-title">Usage</div>
                    <p>Optional default text that will be used as the user input for this prompt.</p>
                </div>

                <div className="tooltip-modal-section">
                    <div className="tooltip-modal-section-title">Variable Reference</div>
                    <ul className="tooltip-list">
                        <li>Use <code>${'{variable_name}'}</code> to insert variables</li>
                        <li>For loop prompts: <code>${'{item}'}</code> refers to current item</li>
                        <li>Can reference previously saved variables</li>
                    </ul>
                </div>

                <div className="tooltip-modal-section">
                    <div className="tooltip-modal-section-title">Example</div>
                    <div className="tooltip-code">
                        Analyze this text: ${'{input_text}'}
                    </div>
                </div>
            </div>
        </div>
    </>
); 