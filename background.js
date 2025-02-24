import {ocr_text, llm_test} from "./lib.js";

console.log('Hello from the background script!')

const isFirefoxLike =
  process.env.EXTENSION_PUBLIC_BROWSER === 'firefox' ||
    process.env.EXTENSION_PUBLIC_BROWSER === 'gecko-based'

if (isFirefoxLike) {
  browser.browserAction.onClicked.addListener(() => {
    browser.sidebarAction.open()
  })
} else {
  chrome.action.onClicked.addListener(() => {
    chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true})
  })
}

// 创建字符插入菜单
function createCharacterMenus() {
  // 先移除已存在的菜单
  chrome.contextMenus.remove("character-insert", () => {
    // 创建主菜单
    chrome.contextMenus.create({
      id: "character-insert",
      title: "字符插入",
      parentId: "baidu-jiaofu",
      contexts: ["editable"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.log('Menu creation error:', chrome.runtime.lastError);
        return;
      }
      // 从存储中获取快捷字符并创建子菜单
      chrome.storage.sync.get(['shortcuts'], (result) => {
        if (result.shortcuts) {
          result.shortcuts.forEach(shortcut => {
            chrome.contextMenus.create({
              id: `insert-char-${shortcut.name}`,
              title: shortcut.name,
              parentId: "character-insert",
              contexts: ["editable"]
            });
          });
        }
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createCharacterMenus();
  chrome.contextMenus.create({
    id: "baidu-jiaofu",
    title: "百度教辅",
    contexts: ["all"] // 可选：all, page, selection, image, link, editable, video, audio
  }, function() {
    chrome.contextMenus.create({
      id: "font-format",
      title: "字体格式化",
      parentId: "baidu-jiaofu",
       contexts: ["all"]
    });
    chrome.contextMenus.create({
      id: "format-math",
      title: "渲染数学公式",
      parentId: "baidu-jiaofu",
      contexts: ["all"]
    });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "font-format") {
    chrome.tabs.sendMessage(tab.id, { action: "font_format" });
  }
  if (info.menuItemId === "format-math") {
    chrome.tabs.sendMessage(tab.id, { action: "format_math" });
  }
  if (info.menuItemId.startsWith('insert-char-')) {
    const shortcutName = info.menuItemId.replace('insert-char-', '');
    chrome.storage.sync.get(['shortcuts'], (result) => {
      if (result.shortcuts) {
        const shortcut = result.shortcuts.find(s => s.name === shortcutName);
        if (shortcut) {
          chrome.tabs.sendMessage(tab.id, { 
            action: "insert_character", 
            character: shortcut.character 
          });
        }
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const formatMessage = async (type, data, host, uname) => {
    try {
      let formatted;
      if (type === 'OCR') {
        formatted = await ocr_text(data, host, uname);
      }
      sendResponse({ formatted });
    } catch (error) {
      sendResponse({ error: error.message });
    }
  };

  if (['OCR'].includes(message.type)) {
    formatMessage(message.type, message.data, message.host, message.uname);
    return true; // 保持消息通道开放以等待异步响应
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPLOAD_IMAGES') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab) {
        sendResponse({ error: '未找到活动标签页' });
        return;
      }

      // Forward the message to content script
      chrome.tabs.sendMessage(
        activeTab.id,
        {
          type: 'CONTENT_UPLOAD_IMAGES',
          files: message.files
        },
        (response) => {
          // Forward the content script's response back to the sidebar
          sendResponse(response);
        }
      );
    });

    // Return true to indicate we will send response asynchronously
    return true;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 处理刷新信号
  if (message.type === 'SEND_REFRESH_SIGNAL') {
    // 获取当前活动标签页并发送刷新消息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'REFRESH_PAGE' });
      }
    });
    return true;
  }

  if (message.type === 'CHECK_LLM_AVAILABILITY') {
    llm_test(message.host, message.uname)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        console.error('LLM test failed:', error);
        sendResponse(false);
      });
    return true; // 保持消息通道开启
  }
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.shortcuts) {
    // shortcuts 发生变化时重建菜单
    createCharacterMenus();
  }
});

// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {

  switch(command) {
  case 'format-math':
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "format_math"
      });
    });
    break;
  }
});