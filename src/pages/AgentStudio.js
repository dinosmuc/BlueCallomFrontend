import React, { useState, useEffect } from 'react';
import './AgentStudio.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import SavedItemsList from '../components/SavedItemsList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faDollarSign, faList } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import Footer from '../components/Footer';
import WorkflowBuilder from '../components/WorkflowBuilder';
import ConditionPopup from '../components/ConditionPopup';

library.add(faTimes, faDollarSign, faList);

function AgentStudio() {
    const [agents, setAgents] = useState([]);
    const [availablePrompts, setAvailablePrompts] = useState([]);
    const [selectedPrompts, setSelectedPrompts] = useState([]);
    const [agentName, setAgentName] = useState('');
    const [variables, setVariables] = useState([]);
    const [newVariable, setNewVariable] = useState({
        name: '',
        defaultValue: '',
        variableType: 'text',
        isEmptyList: false
    });
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [workflowItems, setWorkflowItems] = useState([]);
    const [selectedPromptIndex, setSelectedPromptIndex] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
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
    const [selectingPromptFor, setSelectingPromptFor] = useState(null);
    const [showConditionPopup, setShowConditionPopup] = useState(false);

    useEffect(() => {
        fetchPrompts();
        fetchAgents();
    }, []);

    useEffect(() => {
        if (!selectedAgent) {
            setWorkflowItems([]);
        }
    }, [selectedAgent]);

    const fetchPrompts = async () => {
        try {
            const apiUrl = `${process.env.REACT_APP_API_URL}prompts/`;
            const response = await fetch(apiUrl, {
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
            setAvailablePrompts(data);
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

    const handleAddVariable = () => {
        if (newVariable.name) {
            setVariables([...variables, {
                name: newVariable.name,
                defaultValue: newVariable.isEmptyList ? '[]' : newVariable.defaultValue,
                variableType: newVariable.variableType
            }]);
            setNewVariable({
                name: '',
                defaultValue: '',
                variableType: 'text',
                isEmptyList: false
            });
        }
    };

    const handleRemoveVariable = (index) => {
        const newVars = [...variables];
        newVars.splice(index, 1);
        setVariables(newVars);
    };

    const handlePromptClick = (prompt) => {
        if (selectingPromptFor) {
            // Adding to a branch
            const { conditionIndex, branchType } = selectingPromptFor;
            setWorkflowItems(items => {
                const newItems = [...items];
                const condition = { ...newItems[conditionIndex] };

                if (branchType === 'true') {
                    condition.true_branch = [...(condition.true_branch || []), {
                        name: prompt.name,
                        prompt_id: prompt.id
                    }];
                } else {
                    condition.false_branch = [...(condition.false_branch || []), {
                        name: prompt.name,
                        prompt_id: prompt.id
                    }];
                }

                newItems[conditionIndex] = condition;
                return newItems;
            });
            setSelectingPromptFor(null); // Reset selection mode
        } else {
            // Regular workflow add
            setSelectedPrompts(prevPrompts => [...prevPrompts, {
                id: prompt.id,
                name: prompt.name,
                system_prompt: prompt.system_prompt
            }]);
            setWorkflowItems(prevItems => [...prevItems, {
                type: 'prompt',
                id: prompt.id,
                name: prompt.name,
                system_prompt: prompt.system_prompt
            }]);
        }
    };

    const handleMovePrompt = (index, direction) => {
        const newWorkflowItems = [...workflowItems];
        if (direction === 'up' && index > 0) {
            [newWorkflowItems[index], newWorkflowItems[index - 1]] =
                [newWorkflowItems[index - 1], newWorkflowItems[index]];
        } else if (direction === 'down' && index < newWorkflowItems.length - 1) {
            [newWorkflowItems[index], newWorkflowItems[index + 1]] =
                [newWorkflowItems[index + 1], newWorkflowItems[index]];
        }
        setWorkflowItems(newWorkflowItems);
    };

    const handleRemovePrompt = (index) => {
        const newWorkflowItems = [...workflowItems];
        newWorkflowItems.splice(index, 1);
        setWorkflowItems(newWorkflowItems);
    };

    const handleSaveAgent = async () => {
        try {
            console.log('Current workflowItems:', workflowItems);

            const agentData = {
                name: agentName,
                variables: variables,
                prompts: [],
                conditions: []
            };

            // Build prompts and conditions with correct order
            workflowItems.forEach((item, index) => {
                if (item.type === 'prompt') {
                    agentData.prompts.push({
                        prompt_id: item.id,
                        order: index
                    });
                } else if (item.type === 'condition') {
                    agentData.conditions.push({
                        variable_name: item.variable_name,
                        value: item.value,
                        order: index,
                        true_branch: (item.true_branch || []).map((branch, branchIndex) => ({
                            prompt_id: branch.prompt_id,
                            order: branchIndex,
                            name: branch.name,
                            branch_type: 'true'
                        })),
                        false_branch: (item.false_branch || []).map((branch, branchIndex) => ({
                            prompt_id: branch.prompt_id,
                            order: branchIndex,
                            name: branch.name,
                            branch_type: 'false'
                        }))
                    });
                }
            });

            const url = selectedAgent
                ? `${process.env.REACT_APP_API_URL}agents/${selectedAgent.id}/`
                : `${process.env.REACT_APP_API_URL}agents/`;

            const method = selectedAgent ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(agentData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Create updated workflow items from the response
            const updatedWorkflowItems = [];

            // Add prompts
            data.prompts?.forEach(prompt => {
                updatedWorkflowItems.push({
                    type: 'prompt',
                    id: prompt.prompt_id,
                    name: prompt.name,
                    order: prompt.order
                });
            });

            // Add conditions
            data.conditions?.forEach(condition => {
                updatedWorkflowItems.push({
                    type: 'condition',
                    variable_name: condition.variable_name,
                    value: condition.value,
                    order: condition.order,
                    true_branch: condition.true_branch || [],
                    false_branch: condition.false_branch || []
                });
            });

            setWorkflowItems(updatedWorkflowItems);
            await fetchAgents();

            if (!selectedAgent) {
                resetForm();
            }

        } catch (error) {
            console.error('Error saving agent:', error);
            console.error('Error details:', error.message);
        }
    };

    const handleSelectAgent = (agent) => {
        setSelectedAgent(agent);
        setAgentName(agent.name);

        setVariables(agent.variables.map(v => ({
            name: v.name,
            defaultValue: v.default_value,
            variableType: v.variable_type || 'text'
        })));

        // Create workflow items array that includes both prompts and conditions
        const workflowItems = [];

        // Add prompts
        agent.prompts.forEach(prompt => {
            workflowItems.push({
                type: 'prompt',
                id: prompt.prompt_id,
                name: prompt.name,
            });
        });

        // Add conditions
        agent.conditions.forEach(condition => {
            workflowItems.push({
                type: 'condition',
                id: condition.id,
                variable_name: condition.variable_name,
                value: condition.value,
                true_branch: condition.true_branch.map(branch => ({
                    prompt_id: branch.prompt_id,
                    name: branch.name // Name should be included in the serializer response
                })),
                false_branch: condition.false_branch.map(branch => ({
                    prompt_id: branch.prompt_id,
                    name: branch.name // Name should be included in the serializer response
                }))
            });
        });

        setWorkflowItems(workflowItems);
        setSelectedPrompts(agent.prompts);
        setNewVariable({
            name: '',
            defaultValue: '',
            variableType: 'text',
            isEmptyList: false
        });
    };

    const handleDeleteAgent = async (agentId) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}agents/${agentId}/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            await fetchAgents();

            if (selectedAgent?.id === agentId) {
                resetForm();
            }
        } catch (error) {
            console.error('Error deleting agent:', error);
        }
    };

    const resetForm = () => {
        setAgentName('');
        setSelectedPrompts([]);
        setVariables([]);
        setSelectedAgent(null);
        setWorkflowItems([]);
    };

    const handlePromptDrop = (e) => {
        e.preventDefault();
        try {
            const promptData = JSON.parse(e.dataTransfer.getData('prompt'));
            setWorkflowItems(items => [...items, {
                type: 'prompt',
                id: promptData.id,
                name: promptData.name,
                system_prompt: promptData.system_prompt
            }]);
        } catch (error) {
            console.error('Error handling prompt drop:', error);
        }
    };

    const renderWorkflowItem = (item, index) => {
        return (
            <div className="workflow-item" key={item.id}>
                <div className="workflow-line-connector"></div>
                <div className="workflow-item-content">
                    <div className="workflow-item-info">
                        <i className="fas fa-file-code prompt-icon"></i>
                        <span className="prompt-name">{item.name}</span>
                    </div>
                    <div className="workflow-item-controls">
                        <button
                            className="workflow-button up-button"
                            onClick={() => handleMovePrompt(index, 'up')}
                            disabled={index === 0}
                            title="Move up"
                        >
                            <i className="fas fa-arrow-up"></i>
                        </button>
                        <button
                            className="workflow-button down-button"
                            onClick={() => handleMovePrompt(index, 'down')}
                            disabled={index === workflowItems.length - 1}
                            title="Move down"
                        >
                            <i className="fas fa-arrow-down"></i>
                        </button>
                        <button
                            className="workflow-button remove-button"
                            onClick={() => handleRemovePrompt(index)}
                            title="Remove"
                        >
                            <i className="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const isFormValid = () => {
        return (
            agentName.trim() !== '' &&
            (selectedPrompts.length > 0 || selectedAgent)
        );
    };

    const handleVariableTypeChange = (e) => {
        const newType = e.target.value;
        setNewVariable({
            ...newVariable,
            variableType: newType,
            isEmptyList: false,
            defaultValue: newType === 'list' ? '[]' : ''
        });
    };

    const handleEditAgent = (agent) => {
        if (selectedAgent?.id === agent.id) {
            setSelectedAgent(null);
            setAgentName('');
            setSelectedPrompts([]);
            setVariables([]);
            setIsEditing(false);
            setWorkflowItems([]);
            return;
        }

        setSelectedAgent(agent);
        setAgentName(agent.name);
        setSelectedPrompts(agent.prompts || []);
        setVariables(agent.variables || []);
        setIsEditing(true);
        setWorkflowItems(agent.prompts || []);
    };

    const renderVariables = () => {
        return (
            <div className="variables-display">
                {variables && variables.length > 0 ? (
                    variables.map((variable, index) => (
                        <div key={index} className="variable-item">
                            <div className="variable-name">
                                <FontAwesomeIcon icon={faDollarSign} />
                                {variable.name}
                                {(variable.variableType === 'list' || variable.variable_type === 'list') && (
                                    <span className="variable-type-badge">
                                        <FontAwesomeIcon icon={faList} />
                                        List
                                    </span>
                                )}
                            </div>
                            <div className="variable-actions">
                                <FontAwesomeIcon
                                    icon={faTimes}
                                    className="variable-remove"
                                    onClick={() => handleRemoveVariable(index)}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-variables">
                        No variables defined
                    </div>
                )}
            </div>
        );
    };

    const handleRemoveVariableFromWorkflow = (variable) => {
        const updatedVariables = variables.filter(v => v.name !== variable.name);
        setVariables(updatedVariables);
    };

    const handleLoopPromptToggle = (e) => {
        const isLoop = e.target.checked;
        setNewPrompt(prev => ({
            ...prev,
            is_loop_prompt: isLoop,
            prompt_type: isLoop ? 'loop' : 'autonomous',
            loop_variable: isLoop ? prev.loop_variable : '',
            default_user_prompt: isLoop ?
                prev.default_user_prompt.replace('${item}', '${current_item}') :
                prev.default_user_prompt
        }));
    };

    const handleAddCondition = (conditionData) => {
        console.log('Adding condition:', conditionData);
        setWorkflowItems(items => [...items, conditionData]);
        setShowConditionPopup(false);
    };

    const handleAddToBranch = (conditionIndex, branchType) => {
        setSelectingPromptFor({ conditionIndex, branchType });
    };

    const handleRemovePromptFromBranch = (conditionIndex, branchType, promptIndex) => {
        setWorkflowItems(items => {
            const newItems = [...items];
            const condition = { ...newItems[conditionIndex] };

            if (branchType === 'true') {
                condition.true_branch = condition.true_branch.filter((_, i) => i !== promptIndex);
            } else {
                condition.false_branch = condition.false_branch.filter((_, i) => i !== promptIndex);
            }

            newItems[conditionIndex] = condition;
            return newItems;
        });
    };

    return (
        <div className="page-wrapper">
            <div className="agent-studio">
                <div className="left-panel">
                    <SavedItemsList
                        title="Saved Agents"
                        items={agents}
                        selectedItem={selectedAgent}
                        onItemClick={handleEditAgent}
                        onItemDelete={handleDeleteAgent}
                        type="agent"
                    />

                    <SavedItemsList
                        title="Available Prompts"
                        items={availablePrompts}
                        selectedItem={null}
                        onItemClick={handlePromptClick}
                        type="prompt"
                        showDelete={false}
                        selectionMode={selectingPromptFor ? `Select prompt for ${selectingPromptFor.branchType} branch` : null}
                    />
                </div>

                <div className="agent-config">
                    <div className="agent-header">
                        <h2>Create New Agent</h2>
                        <input
                            type="text"
                            placeholder="Agent Name"
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            className="agent-name-input"
                        />
                    </div>

                    <div className="variables-section">
                        <h3>Variables</h3>
                        {renderVariables()}
                        <div className="variable-form">
                            <div className="variable-input-group">
                                <input
                                    type="text"
                                    className="variable-name-input"
                                    placeholder="Variable name"
                                    value={newVariable.name}
                                    onChange={(e) => setNewVariable({
                                        ...newVariable,
                                        name: e.target.value
                                    })}
                                />
                                <select
                                    className="variable-type-select"
                                    value={newVariable.variableType}
                                    onChange={handleVariableTypeChange}
                                >
                                    <option value="text">Text</option>
                                    <option value="list">List</option>
                                </select>
                            </div>

                            {(!newVariable.isEmptyList || newVariable.variableType !== 'list') && (
                                <div className="variable-default-value">
                                    <input
                                        type="text"
                                        className="variable-default-input"
                                        placeholder={`Default value${newVariable.variableType === 'list' ? ' (JSON array)' : ''}`}
                                        value={newVariable.defaultValue}
                                        onChange={(e) => setNewVariable({
                                            ...newVariable,
                                            defaultValue: e.target.value
                                        })}
                                    />
                                </div>
                            )}

                            {newVariable.variableType === 'list' && (
                                <div className="empty-list-container">
                                    <input
                                        type="checkbox"
                                        id="emptyList"
                                        className="empty-list-checkbox"
                                        checked={newVariable.isEmptyList}
                                        onChange={(e) => setNewVariable({
                                            ...newVariable,
                                            isEmptyList: e.target.checked,
                                            defaultValue: e.target.checked ? '[]' : newVariable.defaultValue
                                        })}
                                    />
                                    <label htmlFor="emptyList" className="empty-list-label">
                                        Empty List
                                    </label>
                                </div>
                            )}

                            <button
                                className="add-variable-button"
                                onClick={handleAddVariable}
                                disabled={!newVariable.name.trim()}
                            >
                                Add Variable
                            </button>
                        </div>
                    </div>

                    <div className="workflow-section">
                        <h3>Workflow</h3>
                        <WorkflowBuilder
                            workflowItems={workflowItems}
                            onRemovePrompt={handleRemovePrompt}
                            onMovePrompt={handleMovePrompt}
                            onAddToBranch={handleAddToBranch}
                        />
                        <div className="workflow-controls">
                            <button
                                className="add-condition-button"
                                onClick={() => setShowConditionPopup(true)}
                            >
                                Add Condition
                            </button>
                        </div>
                    </div>

                    <button
                        className="save-agent-button"
                        onClick={handleSaveAgent}
                        disabled={!isFormValid()}
                    >
                        {selectedAgent ? 'Update Agent' : 'Save Agent'}
                    </button>
                </div>
            </div>
            <Footer />
            {showConditionPopup && (
                <ConditionPopup
                    variables={variables}
                    onConfirm={handleAddCondition}
                    onClose={() => setShowConditionPopup(false)}
                />
            )}
        </div>
    );
}

const styles = `
.save-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.save-button {
    background-color: #2196f3;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: all 0.3s ease;
}

.save-button:hover:not(:disabled) {
    background-color: #1976d2;
}
`;

export default AgentStudio; 