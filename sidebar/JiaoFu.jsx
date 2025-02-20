import { useState, useRef, useEffect } from 'react'
import { llm_test } from '../lib.js'

export default function JiaoFu({ host, uname }) {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState({})
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

    const hasError = await llm_test(host, uname);
    if (!hasError) {
      alert('无权使用bedu-jiaofu插件，请联系管理员');
      return;
    }

    setIsUploading(true);
    try {
      const results = [];
      
      // 串行处理每个文件
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
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

        try {
          // 发送单个文件并等待处理完成
          const response = await chrome.runtime.sendMessage({
            type: 'UPLOAD_IMAGES',
            files: [fileData],
            currentIndex: i,
            total: selectedFiles.length
          });
          
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
          
          // 可以在这里添加进度更新的逻辑
          console.log(`处理进度: ${i + 1}/${selectedFiles.length}`);
          
        } catch (error) {
          console.error(`处理文件 ${file.name} 时发生错误:`, error);
          throw new Error(`文件 ${file.name} 上传失败`);
        }
      }
    } catch (error) {
      console.error('Upload process failed:', error);
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
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
            disabled={isUploading || selectedFiles.length === 0}
          >
            {isUploading ? '上传中...' : '上传图片'}
          </button>
        </div>
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
