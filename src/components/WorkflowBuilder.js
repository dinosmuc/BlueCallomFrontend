// frontend/src/components/WorkflowBuilder.js
import React from 'react';
import './WorkflowBuilder.css';

const WorkflowBuilder = ({
    workflowItems,
    onRemovePrompt,
    onMovePrompt,
    onAddToBranch
}) => {
    const renderBranch = (items, parentIndex, branchType) => {
        return (
            <div className={`branch ${branchType}-branch`}>
                <div className="branch-label">{branchType === 'true' ? 'True' : 'False'}</div>
                {items.map((item, idx) => (
                    <div key={idx} className="branch-node">
                        <div className="node-content">
                            <div className="node-title">{item.name}</div>
                            <button
                                onClick={() => onRemovePrompt(parentIndex, branchType, idx)}
                                className="remove-button"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    className="add-to-branch-button"
                    onClick={() => onAddToBranch(parentIndex, branchType)}
                >
                    + Add Prompt
                </button>
            </div>
        );
    };

    return (
        <div className="workflow-builder">
            {workflowItems.map((item, index) => (
                <div key={index} className="workflow-node-container">
                    <div className={`workflow-node ${item.type}`}>
                        <div className="node-content">
                            <div className="node-title">
                                {item.type === 'condition'
                                    ? `If ${item.variable_name} = ${item.value}`
                                    : item.name
                                }
                            </div>
                            <div className="node-controls">
                                <button
                                    onClick={() => onMovePrompt(index, 'up')}
                                    disabled={index === 0}
                                >
                                    ↑
                                </button>
                                <button
                                    onClick={() => onMovePrompt(index, 'down')}
                                    disabled={index === workflowItems.length - 1}
                                >
                                    ↓
                                </button>
                                <button
                                    onClick={() => onRemovePrompt(index)}
                                    className="remove-button"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        {item.type === 'condition' && (
                            <div className="branches-container">
                                {renderBranch(item.true_branch, index, 'true')}
                                {renderBranch(item.false_branch, index, 'false')}
                            </div>
                        )}
                    </div>
                    {index < workflowItems.length - 1 && (
                        <div className="connector-line"></div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default WorkflowBuilder;