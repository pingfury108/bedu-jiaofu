import { useState, useRef } from 'react'
import { llm_test } from '../lib.js'

export default function JiaoFu({ host, uname }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
  }

  const handleClear = () => {
    setSelectedFiles([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    const hasError = await llm_test(host, uname);
    if (!hasError) {
      alert('无权使用bedu-jiaofu插件，请联系管理员');
      return;
    }

    setIsUploading(true);
    try {
      // Create array of file objects with their content and names
      const fileDataArray = await Promise.all(selectedFiles.map(async file => {
        const reader = new FileReader();
        return new Promise((resolve) => {
          reader.onload = () => {
            resolve({
              content: reader.result,
              fileName: file.name
            });
          };
          reader.readAsDataURL(file);
        });
      }));

      // Send message to background script
      const response = await chrome.runtime.sendMessage({
        type: 'UPLOAD_IMAGES',
        files: fileDataArray
      });

    } catch (error) {
      console.error('Upload process failed:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container max-auto px-1">
      <div className="form-control w-full max-w-xs">
        <input
          ref={fileInputRef}
          type="file"
          className="file-input file-input-bordered w-full max-w-xs"
          onChange={handleFileChange}
          multiple
        />
        <div className="flex gap-2 mt-2">
          <button
            className="btn btn-error btn-sm"
            onClick={handleClear}
          >
            清除图片
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? '上传中...' : '上传图片'}
          </button>
        </div>
      </div>

      {/* 文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-medium">已选择的文件:</h3>
          <ul className="list-inside">
            {selectedFiles.map((file, index) => (
              <li key={index} className="text-sm text-gray-600">
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
