import {baidu_user_info, replaceLatexWithImages, replacePunctuation, doc_img_upload, doc_save_page, llm_test } from "../lib.js";

console.log('hello from content_scripts');

let host; // 声明 host 变量

let uname;

// 从 Chrome 存储中同步读取 host 参数
chrome.storage.sync.get(['host'], (result) => {
  host = result.host; // 获取 host 值
});

// 立即执行函数，不依赖 DOMContentLoaded
(async () => {
  try {
    console.log('Starting to fetch baidu user info...'); // 添加调试日志
    const response = await baidu_user_info();
    console.log('Baidu user info response:', response);
    if (response && response.data && response.data.userName) {
      // 将用户名存储到 Chrome storage
      chrome.storage.sync.set({ baidu_user_name: response.data.userName });
      uname = response.data.userName
    }
  } catch (error) {
    console.error('Error getting baidu user info:', error);
  }
})();

async function cleanPTags(html) {
  const temp = document.createElement('div');
  temp.innerHTML = html;

  // 移除所有style属性
  function removeStyles(element) {
    // 如果是 img 标签则跳过
    if (element.tagName.toLowerCase() !== 'img') {
      element.removeAttribute('style');
      Array.from(element.children).forEach(child => removeStyles(child));
    }
  }
  // 修改文本处理函数，添加标点符号替换
  async function processTextContent(textNode) {
    let text = textNode.textContent
      .replace(/[\x20\t\n]/g, function(match) {
        switch (match) {
          case ' ': return ' ';
          case '\t': return '\t';
          case '\n': return '\n';
          default: return match;
        }
      });

    return replacePunctuation(text);

    /*
    try {
      const response = await chrome.runtime.sendMessage(
        { type: 'TEXT_FORMAT', data: text, host: host }
      );
      if (response && response.formatted) {
        return response.formatted;
      }
      console.log(response)
      return text
    } finally {
      console.log("processTextContent end")
    }
     */
  }

  // 第一步：将所有非p标签的内容块转换为p标签
  function convertToParagraphs(element) {
    const children = Array.from(element.children);

    children.forEach(child => {
      if (child.tagName.toLowerCase() !== 'p') {
        // 如果是块级元素，将其转换为p
        if (getComputedStyle(child).display === 'block' ||
          ['div', 'ul', 'ol', 'li', 'section', 'article', 'pre', 'code'].includes(child.tagName.toLowerCase())) {
            const newP = doc.createElement('p');
            // 复制原始元素的内容到新p标签
            newP.innerHTML = child.innerHTML;
            child.parentNode.replaceChild(newP, child);
          }
        // 递归处理嵌套元素
        convertToParagraphs(child); // 确保在转换后检查子元素
      }
    });
  }

  // 第二步：处理p标签内容，保留文本、图片和换行
  async function cleanParagraph(p) {
    // 将所有节点转换为数组并记录其类型
    const nodes = await Promise.all(Array.from(p.childNodes).map(async node => { // 使用 Promise.all
      if (node.nodeType === Node.TEXT_NODE) {
        return {
          type: 'text',
          content: await processTextContent(node) // 确保使用 await
        };
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === 'img') {
          return {
            type: 'img',
            node: node.cloneNode(true)
          };
        } else if (node.tagName.toLowerCase() === 'br') {
          return {
            type: 'br'
          };
        }
      }
      return {
        type: 'text',
        content: await processTextContent(node) // 确保使用 await
      };
    }));

    while (p.firstChild) {
      p.removeChild(p.firstChild);
    }

    // 按原始顺序重建内容
    nodes.forEach(item => {
      if (item.type === 'text') {
        p.appendChild(document.createTextNode(item.content));
      } else if (item.type === 'img') {
        p.appendChild(item.node);
      } else if (item.type === 'br') {
        p.appendChild(document.createElement('br'));
      }
    });
  }

  // 移除所有样式
  removeStyles(temp);
  convertToParagraphs(temp);

  const pElements = temp.getElementsByTagName('p');
  for (const p of pElements) { // 使用 for...of 循环
    await cleanParagraph(p);
  }

  return temp.innerHTML;
}


function createEvent(eventName) {
  const event = new Event(eventName, { bubbles: true, cancelable: true });
  return event;
}

function sendFixEvent(element) {
  element.dispatchEvent(new Event('change', { bubbles: true, cancelable: true}));
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // Add LLM test check at the beginning
  const llmAvailable = await llm_test(host, uname);
  if (!llmAvailable) {
    alert('无权使用bedu-jiaofu插件，请联系管理员');
    return true; // 保持消息通道开启，但不发送响应
  }

  if (request.action === "font_format") {
    const selectedElement = document.activeElement;
    if (selectedElement) {
      // 保存滚动位置
      const scrollTop = selectedElement.scrollTop;
      const scrollLeft = selectedElement.scrollLeft;

      // 保存选区位置
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;

      // 创建一个临时容器来解析清理后的HTML
      const temp = document.createElement('div');
      temp.innerHTML = await cleanPTags(selectedElement.innerHTML);
      const cleanedElement = temp.firstElementChild;

      // 复制原始元素的属性到清理后的元素
      //Array.from(selectedElement.attributes).forEach(attr => {
      //cleanedElement.setAttribute(attr.name, attr.value);
      //});

      // 使用 replaceWith 替换元素（保持引用）
      selectedElement.innerHTML=temp.innerHTML;
      sendFixEvent(selectedElement);

      // 恢复滚动位置
      cleanedElement.scrollTop = scrollTop;
      cleanedElement.scrollLeft = scrollLeft;

      // 重新聚焦到元素
      cleanedElement.focus();
    }
    return true;
 };

  if (request.action === "format_math") {
    (async () => {
      try {
        const activeElement = document.activeElement;
        if (!activeElement) {
          sendResponse({ success: false, error: 'No active element found' });
          return;
        }
        const temp = document.createElement('div');
        temp.innerHTML = activeElement.innerHTML;
        const result = await replaceLatexWithImages(temp.innerHTML);
        activeElement.innerHTML = result;
        sendFixEvent(activeElement);
      } catch (error) {
        console.error({ success: false, error: error.message });
      }
    })();

    return true; // 保持消息通道开启
  }

  if (request.type === 'CONTENT_UPLOAD_IMAGES') {
    const { files } = request;

    // Sort files by filename in descending order
    const sortedFiles = [...files].sort((a, b) => b.fileName.localeCompare(a.fileName));

    // Extract textbookId from URL using string parsing
    const href = window.location.href;
    const textbookId = href.split('textbookID=')[1]?.split('&')[0];
    const textbookType = href.split('textbookType=')[1]?.split('&')[0];

    if (!textbookId) {
      sendResponse({ error: 'No textbookID found in URL' });
      return;
    }

    try {
      for (const fileData of sortedFiles) {
        // Convert base64 to Blob
        const base64Response = await fetch(fileData.content);
        const fileBlob = await base64Response.blob();

        // Upload image with blob and original filename
        const uploadResult = await doc_img_upload(fileBlob, fileData.fileName);

        if (!uploadResult.data?.cdnUrl) {
          throw new Error(`Upload failed for ${fileData.fileName} - no CDN URL received`);
        }

        // Save page with the image URL
        await doc_save_page(textbookId, uploadResult.data.cdnUrl, textbookType);
      }
      sendResponse({ success: true });
      // Refresh the page after all files are processed
      window.location.reload();
    } catch (error) {
      sendResponse({ error: error.message });
    }

    return true; // Keep message channel open for async operation
  }
});
