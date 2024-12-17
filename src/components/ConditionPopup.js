// frontend/src/components/ConditionPopup.js
import React, { useState } from 'react';
import './ConditionPopup.css';

const ConditionPopup = ({ variables, onConfirm, onClose }) => {
    const [selectedVariable, setSelectedVariable] = useState('');
    const [conditionValue, setConditionValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedVariable && conditionValue) {
            onConfirm({
                type: 'condition',
                variable_name: selectedVariable,
                value: conditionValue,
                true_branch: [],
                false_branch: []
            });
            onClose();
        }
    };

    return (
        <div className="condition-popup-overlay">
            <div className="condition-popup">
                <h3>Add Condition</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Variable:</label>
                        <select
                            value={selectedVariable}
                            onChange={(e) => setSelectedVariable(e.target.value)}
                            required
                        >
                            <option value="">Select a variable</option>
                            {variables.map((variable) => (
                                <option key={variable.name} value={variable.name}>
                                    {variable.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Value:</label>
                        <input
                            type="text"
                            value={conditionValue}
                            onChange={(e) => setConditionValue(e.target.value)}
                            required
                        />
                    </div>
                    <div className="popup-buttons">
                        <button type="submit">Confirm</button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConditionPopup;