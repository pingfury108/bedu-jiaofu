import React, { useState, useEffect } from "react";
import ApiSettingsForm from './ApiSettingsForm';
import OcrComponent from './OcrComponent';
import JiaoFu from './JiaoFu';

export default function Main() {
  const [host, setHost] = React.useState('');
  const [name, setName] = useState('');
  const [activeTab, setActiveTab] = useState('settings');

  React.useEffect(() => {
    // 从 Chrome 存储中加载 host
    chrome.storage.sync.get(['host'], (result) => {
      if (result.host) {
        setHost(result.host);
      } else {
        setHost('http://123.56.230.207:8099');
      }
    });
  }, []);

  const handleHostChange = (e) => {
    const newHost = e.target.value;
    setHost(newHost);
    // 更新 Chrome 存储
    chrome.storage.sync.set({ host: newHost }, () => {
    });
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    chrome.storage.sync.set({ baidu_user_name: e.target.value });
  };

  useEffect(() => {
    // 从 storage 加载初始用户名
    chrome.storage.sync.get(['baidu_user_name'], (result) => {
      if (result.baidu_user_name) {
        setName(result.baidu_user_name);
      }
    });

    // 监听来自 background.js 的用户名更新消息
    const messageListener = (message) => {
      if (message.type === 'SIDEBAR_USERNAME_UPDATE') {
        setName(message.userName);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    // 清理监听器
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  useEffect(() => {
    // 从 Chrome 存储中加载上次选择的 tab
    chrome.storage.sync.get(['activeTab'], (result) => {
      if (result.activeTab) {
        setActiveTab(result.activeTab);
      }
    });
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // 更新 Chrome 存储
    chrome.storage.sync.set({ activeTab: tab });
  };

  return (<div className="container max-auto px-1 mt-1">
            <div className="tabs tabs-boxed">
              <a className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`} onClick={() => handleTabChange('settings')}>设置</a>
              <a className={`tab ${activeTab === 'ocr' ? 'tab-active' : ''}`} onClick={() => handleTabChange('ocr')}>文字识别</a>
              <a className={`tab ${activeTab === 'upload' ? 'tab-active' : ''}`} onClick={() => handleTabChange('upload')}>批量上传</a>
            </div>
            {activeTab === 'settings' && (
              <div className="w-full mt-2">
                <ApiSettingsForm
                  host={host}
                  handleHostChange={handleHostChange}
                  name={name}
                  handleNameChange={handleNameChange}
                />
              </div>
            )}
            {activeTab === 'ocr' && (
                <div className="w-full mt-2">
                  <OcrComponent host={host} uname={name} />
                </div>
            )}
            {activeTab === 'upload' && (
                <div className="w-full mt-2">
                  <JiaoFu host={host} uname={name}/>
                </div>
            )}
          </div>)
}
