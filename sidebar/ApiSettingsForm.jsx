import React, { useState, useEffect } from 'react';

const ApiSettingsForm = ({ host, handleHostChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shortcuts, setShortcuts] = useState([]);
    const [newShortcut, setNewShortcut] = useState({ name: '', character: '', keyboardShortcut: '' });
    const [editingIndex, setEditingIndex] = useState(-1);
    const [editedCharacter, setEditedCharacter] = useState('');
    const [editedKeyboardShortcut, setEditedKeyboardShortcut] = useState('');

    useEffect(() => {
        // Load shortcuts from Chrome storage when component mounts
        chrome.storage.sync.get(['shortcuts'], (result) => {
            if (result.shortcuts) {
                setShortcuts(result.shortcuts);
            }
        });
    }, []);

    const handleKeyDown = (e, isEditing = false, index = -1) => {
        e.preventDefault();
        const keys = [];
        if (e.ctrlKey) keys.push('Ctrl');
        if (e.shiftKey) keys.push('Shift');
        if (e.altKey) keys.push('Alt');
        if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt') {
            keys.push(e.key.toUpperCase());
        }
        const shortcutStr = keys.join('+');
        
        if (isEditing) {
            setEditedKeyboardShortcut(shortcutStr);
        } else {
            setNewShortcut(prev => ({ ...prev, keyboardShortcut: shortcutStr }));
        }
    };

    const handleSaveShortcut = () => {
        if (!newShortcut.name || !newShortcut.character) return;

        const updatedShortcuts = [...shortcuts, newShortcut];
        setShortcuts(updatedShortcuts);

        // 保存到 Chrome storage 并触发菜单更新
        chrome.storage.sync.set({ shortcuts: updatedShortcuts });

        // 重置表单并关闭模态框
        setNewShortcut({ name: '', character: '', keyboardShortcut: '' });
        setIsModalOpen(false);
    };

    const handleDeleteShortcut = (index) => {
        const updatedShortcuts = shortcuts.filter((_, i) => i !== index);
        setShortcuts(updatedShortcuts);
        chrome.storage.sync.set({ shortcuts: updatedShortcuts });
    };

    const handleEditShortcut = (index) => {
        setEditingIndex(index);
        setEditedCharacter(shortcuts[index].character);
        setEditedKeyboardShortcut(shortcuts[index].keyboardShortcut || '');
    };

    const saveEdit = (index) => {
        const updatedShortcuts = shortcuts.map((shortcut, i) => {
            if (i === index) {
                return { 
                    ...shortcut, 
                    character: editedCharacter,
                    keyboardShortcut: editedKeyboardShortcut 
                };
            }
            return shortcut;
        });
        setShortcuts(updatedShortcuts);
        chrome.storage.sync.set({ shortcuts: updatedShortcuts });
        setEditingIndex(-1);
    };

    return (
        <div className="flex flex-col items-center">
            <div className="form-control w-full max-w-xs mt-2">
                <label className="label">
                    <span className="label-text">API 地址</span>
                </label>
                <input
                    type="text"
                    value={host}
                    onChange={handleHostChange}
                    placeholder="输入 API 地址"
                    className="input input-bordered input-sm"
                />
            </div>

            {/* Character Quick Insert Section */}
            <div className="collapse collapse-arrow w-full mt-2">
                <input type="checkbox" /> 
                <div className="collapse-title label-text">
                    字符快速插入
                </div>
                <div className="collapse-content">
                    <button 
                        className="btn btn-primary btn-sm mb-4"
                        onClick={() => setIsModalOpen(true)}
                    >
                        添加新字符
                    </button>

                    {/* Shortcuts Table */}
                    {shortcuts.length > 0 && (
                        <div className="relative rounded-lg border border-base-300">
                            <div className="overflow-x-auto overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-base-300">
                                <table className="table table-zebra w-full">
                                    <thead className="sticky top-0 bg-base-200 shadow-sm z-10">
                                        <tr>
                                            <th className="bg-base-200 font-semibold">名称</th>
                                            <th className="bg-base-200 font-semibold">字符</th>
                                            <th className="bg-base-200 font-semibold">快捷键</th>
                                            <th className="bg-base-200 w-24"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shortcuts.map((shortcut, index) => (
                                            <tr key={index} className="hover:bg-base-200/50 transition-colors">
                                                <td className="max-w-[120px] truncate">{shortcut.name}</td>
                                                <td>
                                                    {editingIndex === index ? (
                                                        <input
                                                            type="text"
                                                            value={editedCharacter}
                                                            onChange={(e) => setEditedCharacter(e.target.value)}
                                                            className="input input-bordered input-sm w-20 focus:outline-primary"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="font-mono">{shortcut.character}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {editingIndex === index ? (
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={editedKeyboardShortcut}
                                                                onKeyDown={(e) => handleKeyDown(e, true, index)}
                                                                placeholder="点击此处按下快捷键组合"
                                                                readOnly
                                                                className="input input-bordered input-sm w-40 focus:outline-primary font-mono"
                                                            />
                                                            <div className="absolute -top-2 -right-2">
                                                                <div className="badge badge-xs badge-primary"></div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="font-mono">{shortcut.keyboardShortcut || '无'}</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="flex justify-end gap-1">
                                                        {editingIndex === index ? (
                                                            <>
                                                                <button 
                                                                    className="btn btn-success btn-xs btn-square"
                                                                    onClick={() => saveEdit(index)}
                                                                    title="保存"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                                <button 
                                                                    className="btn btn-error btn-xs btn-square"
                                                                    onClick={() => setEditingIndex(-1)}
                                                                    title="取消"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button 
                                                                    className="btn btn-ghost btn-xs btn-square hover:btn-info"
                                                                    onClick={() => handleEditShortcut(index)}
                                                                    title="编辑"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                    </svg>
                                                                </button>
                                                                <button 
                                                                    className="btn btn-ghost btn-xs btn-square hover:btn-error"
                                                                    onClick={() => handleDeleteShortcut(index)}
                                                                    title="删除"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Character Modal */}
            <dialog className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
                <div className="modal-box">
                    <h3 className="font-bold text-lg">添加快速插入的字符</h3>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">名称</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered input-sm w-full max-w-xs"
                            value={newShortcut.name}
                            onChange={(e) => setNewShortcut({...newShortcut, name: e.target.value})}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">字符</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered input-sm w-full max-w-xs"
                            value={newShortcut.character}
                            onChange={(e) => setNewShortcut({...newShortcut, character: e.target.value})}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">快捷键</span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered input-sm w-full max-w-xs"
                            value={newShortcut.keyboardShortcut}
                            onKeyDown={(e) => handleKeyDown(e)}
                            placeholder="点击此处按下快捷键组合"
                            readOnly
                        />
                    </div>
                    <div className="modal-action">
                        <button className="btn btn-primary" onClick={handleSaveShortcut}>确定</button>
                        <button className="btn" onClick={() => setIsModalOpen(false)}>取消</button>
                    </div>
                </div>
            </dialog>
        </div>
    );
};

export default ApiSettingsForm;
