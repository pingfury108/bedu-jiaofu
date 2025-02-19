export function math2img(expr) {
  console.log("math2img_expr: ", expr)
  let url = `/edushop/tiku/submit/genexprpic?expr=${encodeURIComponent(expr)}`;

  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const img = document.createElement('img');
      img.src = data.data.url;
      img.style = `width: ${data.data.width}px;height: ${data.data.height}px;`;
      img.setAttribute("data-math", data.data.exprEncode);
      img.setAttribute("data-width", data.data.width);
      img.setAttribute("data-height", data.data.height);
      return img;
    })
    .catch(error => {
      console.error(error);
      return null;
    });
}

export async function img_upload(imageBlob) {
  const url = "/edushop/tiku/submit/uploadpic";

  const formData = new FormData();
  formData.append('file', imageBlob, 'math.png');

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function doc_img_upload(imageBlob, filename) {
  const url = "/edushop/tiku/submit/uploadpic";

  const formData = new FormData();
  formData.append('file', imageBlob, filename);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}


export async function doc_save_page(btextbookID, img_url, pageType) {
  const url = "/edushop/textbook/myproducecommit/savepage";

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        textbookID: Number(btextbookID),
        picUrl: img_url,
        pageType: pageType
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving page:', error);
    throw error;
  }
}


export async function baidu_user_info() {
  const url = "/edushop/user/common/info";

  try {
    const response = await fetch(url, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
}

export async function textbook_info(id) {
  const url = `/edushop/textbook/detail/basicinfo?textbookID=${id}`;

  try {
    const response = await fetch(url, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error textbook info:', error);
    throw error;
  }
}

export async function save_book_info(body_data) {
  const url = "/edushop/textbook/myproducecommit/saveinfo";

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body_data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving book info:', error);
    throw error;
  }
}

export function replacePunctuation(text) {
  const punctuationMap = {
    '\\.$': '。',
    ',': '，',
    '\\?': '？',
    '!': '！',
    ':$': '：',
    //'：': ':',
    ';': '；',
    //'\\(': '（',
    //'\\（': '(',
    //'\\）': ')',
    //'\\)': '）',
    //'\\[': '【',
    //'\\]': '】',
    //'\\{': '｛',
    //'\\}': '｝',
    //'-': '—', // 使用中文长破折号
    '"': '"', // 使用中文双引号
    // "'": ''', // 使用中文单引号
  };

  // 匹配数学表达式的正则
  const mathRegex = /\$([^$]+)\$/g;

  // 将文本中的数学表达式提取出来
  const mathExpressions = [];
  text = text.replace(mathRegex, (match) => {
    mathExpressions.push(match);
    return `{{math${mathExpressions.length - 1}}}`; // 用占位符替换
  });

  // 去除行内字符之间的多余空格，但保留每行前后的空格
  text = text.replace(/ +/g, ''); // 将多个空格替换为一个空格

  let result = text;
  for (const [englishPunctuation, chinesePunctuation] of Object.entries(punctuationMap)) {
    result = result.replace(new RegExp(englishPunctuation, 'g'), chinesePunctuation);
  }


  result = result.replace(/\(\)/g, '（ ）');
  result = result.replace(/（）/g, '（ ）');
  result = result.replace(/\((\d)\)(?![\d+\-*/])/g, '（$1）');
  result = result.replace(/(?<=[\u4e00-\u9fa5])\:(?=[\u4e00-\u9fa5])/g, '：');
  result = result.replace(/(?<=[)）])\:/g, '：');


  // 将占位符替换回原来的数学表达式
  mathExpressions.forEach((expr, index) => {
    result = result.replace(`{{math${index}}}`, expr);
  });

  return result;
}


export async function ocr_text(image_data, host, uname) {
  try {
    const response = await fetch(`${host}/llm/ocr`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': encodeURIComponent(uname)
      },
      body: JSON.stringify(image_data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error ocr:', error);
    return null;
  }
}


export async function llm_test(host, uname) {
  try {
    const response = await fetch(`${host}/llm/test`, {
      method: 'GET',  // Changed to GET method
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': encodeURIComponent(uname)
      }
      // Removed body since GET requests don't have a body
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Return false if text exists, true if error exists
    if (data.text) return false;
    if (data.error) return true;

    return false; // Default return if neither exists
  } catch (error) {
    console.error('Error in llm_text:', error);
    return false; // Return true for any error case
   }
}

export async function replaceLatexWithImages(text) {
  // Convert \( and \) to $
  text = text.replace(/\\\(/g, '$').replace(/\\\)/g, '$');

  const regex = /\$([^$]+)\$/g;
  let result = text;
  const matches = [...text.matchAll(regex)];

  for (const match of matches) {
    const fullMatch = match[0];
    let expression = match[1];
    // 替换 HTML 符号为文本符号
    expression = expression
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&copy;/g, '©')
      .replace(/&reg;/g, '®')
      .replace(/&euro;/g, '€')
      .replace(/&yen;/g, '¥');
    const imgElement = await math2img(expression);
    result = result.replace(fullMatch, imgElement.outerHTML);
  }

  return result;
}
