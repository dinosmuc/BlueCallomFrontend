import React from 'react';
import './SavedItemsList.css';

const SavedItemsList = ({
    title,
    items,
    selectedItem,
    onItemClick,
    onItemDelete,
    type = 'agent', // 'agent' or 'prompt'
    showDelete = true
}) => {
    return (
        <div className="saved-items-list">
            <h3>{title}</h3>
            <div className="saved-items-container">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`saved-item ${selectedItem?.id === item.id ? 'selected' : ''} ${type === 'prompt' && item.is_loop_prompt ? 'loop-prompt' : ''
                            }`}
                        onClick={() => onItemClick(item)}
                    >
                        <span>
                            <i className={`fas ${type === 'agent' ? 'fa-robot' : 'fa-file-code'} item-icon`}></i>
                            {item.name}
                            {type === 'prompt' && item.is_loop_prompt && (
                                <i className="fas fa-sync-alt loop-icon"></i>
                            )}
                        </span>
                        {showDelete && (
                            <button
                                className="delete-button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onItemDelete(item.id);
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                ))}
                {items.length === 0 && (
                    <div className="empty-state">
                        No {type}s available
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedItemsList; 