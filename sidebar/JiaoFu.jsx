import { useState, useRef, useEffect } from 'react'
import { llm_test } from '../lib.js'

export default function JiaoFu({ host, uname }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({})
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles(files)
    setUploadStatus({})
  }

  const handleClear = () => {
    setSelectedFiles([])
    setUploadStatus({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    /*
    const hasError = await llm_test(host, uname);
    if (!hasError) {
      alert('无权使用bedu-jiaofu插件，请联系管理员');
      return;
    }
     */

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const results = [];

      // 创建文件列表的副本并按文件名中的数字倒序排序
      const sortedFiles = [...selectedFiles].sort((a, b) => {
        const getNumber = (filename) => {
          const match = filename.match(/_(\d+)\./);
          return match ? parseInt(match[1]) : 0;
        };
        return getNumber(b.name) - getNumber(a.name);  // 倒序排序
      });

      // 串行处理每个文件
      for (let i = 0; i < sortedFiles.length; i++) {
        const file = sortedFiles[i];

        // 转换单个文件为 base64
        const fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              content: reader.result,
              fileName: file.name,
              index: i
            });
          };
          reader.readAsDataURL(file);
        });

        // 更新上传状态
        setUploadStatus(prev => ({
          ...prev,
          [file.name]: '上传中...'
        }));

        try {
          // 发送单个文件并等待处理完成
          const response = await chrome.runtime.sendMessage({
            type: 'UPLOAD_IMAGES',
            files: [fileData],
            currentIndex: i,
            total: sortedFiles.length
          });

          // Add 1 second delay after each upload
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Update upload status for this file
          setUploadStatus(prev => ({
            ...prev,
            [file.name]: true
          }));

          // 将处理成功的结果存入数组
          results.push({
            ...fileData,
            ...response
          });

          // Update progress
          setUploadProgress(((i + 1) / sortedFiles.length) * 100);

        } catch (error) {
          console.error(`处理文件 ${file.name} 时发生错误:`, error);
          throw new Error(`文件 ${file.name} 上传失败`);
        }
      }

      // 所有文件上传完成后，发送页面刷新信号到background.js
      if (results.length > 0) {
        // 发送消息到background.js
        chrome.runtime.sendMessage({
          type: 'SEND_REFRESH_SIGNAL'
        });
      }

    } catch (error) {
      console.error('Upload process failed:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const FileNameContainer = ({ name }) => {
    const containerRef = useRef(null);

    useEffect(() => {
      if (containerRef.current) {
        containerRef.current.scrollLeft = containerRef.current.scrollWidth;
      }
    }, [name]);

    return (
      <div
        ref={containerRef}
        className="overflow-x-auto whitespace-nowrap flex-1 pr-2 direction-rtl"
      >
        <div className="direction-ltr inline-block min-w-full">
          {name}
        </div>
      </div>
    );
  };

  return (
    <div className="container max-auto px-1 flex flex-col h-screen">
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
            disabled={selectedFiles.length === 0 || isUploading}
          >
            {isUploading ? '上传中...' : '上传图片'}
          </button>
        </div>

          <div className="alert alert-warning my-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span>上传过程中，请勿操作页面，上传完成后会自动刷新页面</span>
      </div>

        {isUploading && (
          <div className="w-full mt-4">
            <progress
              className="progress progress-primary w-full"
              value={uploadProgress}
              max="100"
            ></progress>
            <div className="text-center text-sm mt-1">
              {Math.round(uploadProgress)}%
            </div>
          </div>
        )}
      </div>

      {/* 文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 flex flex-col flex-1 min-h-0">
          <h3 className="text-lg font-medium mb-2">已选择的文件:</h3>
          <div className="flex-1 min-h-0 overflow-y-auto border rounded">
            <ul className="list-inside">
              {selectedFiles.map((file, index) => (
                <li key={index} className="text-sm text-gray-600 p-2 flex items-center border-b last:border-b-0">
                  <FileNameContainer name={file.name} />
                  {uploadStatus[file.name] && (
                    <span className="text-success flex-shrink-0">✓</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
