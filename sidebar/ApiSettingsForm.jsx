import React, { useState, useEffect } from 'react';

const ApiSettingsForm = ({ host, handleHostChange }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shortcuts, setShortcuts] = useState([]);
    const [newShortcut, setNewShortcut] = useState({ name: '', character: '' });

    useEffect(() => {
        // Load shortcuts from Chrome storage when component mounts
        chrome.storage.sync.get(['shortcuts'], (result) => {
            if (result.shortcuts) {
                setShortcuts(result.shortcuts);
            }
        });
    }, []);

    const handleSaveShortcut = () => {
        if (!newShortcut.name || !newShortcut.character) return;

        const updatedShortcuts = [...shortcuts, newShortcut];
        setShortcuts(updatedShortcuts);

        // 保存到 Chrome storage 并触发菜单更新
        chrome.storage.sync.set({ shortcuts: updatedShortcuts });

        // 重置表单并关闭模态框
        setNewShortcut({ name: '', character: '' });
        setIsModalOpen(false);
    };

    const handleDeleteShortcut = (index) => {
        const updatedShortcuts = shortcuts.filter((_, i) => i !== index);
        setShortcuts(updatedShortcuts);
        chrome.storage.sync.set({ shortcuts: updatedShortcuts });
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
                        <table className="table table-compact w-full bg-base-200 rounded-lg">
                            <thead>
                                <tr>
                                    <th>名称</th>
                                    <th>字符</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shortcuts.map((shortcut, index) => (
                                    <tr key={index}>
                                        <td>{shortcut.name}</td>
                                        <td>{shortcut.character}</td>
                                        <td>
                                            <button 
                                                className="btn btn-error btn-xs"
                                                onClick={() => handleDeleteShortcut(index)}
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
