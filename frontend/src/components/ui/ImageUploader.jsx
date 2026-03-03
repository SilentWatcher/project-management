import { useState, useRef, useCallback } from 'react';
import { UploadOutlined, CloseOutlined, CheckCircleOutlined, LoadingOutlined, ImageOutlined } from '@ant-design/icons';
import { uploadImage } from '../../services/uploadService';

const ImageUploader = ({ 
  onUpload, 
  onDelete,
  initialImage = null,
  maxSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  aspectRatio = 'square',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${acceptedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSize}MB`;
    }
    return null;
  };

  const createPreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const result = await uploadImage(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsUploading(false);
        setPreview(result.url);
        if (onUpload) onUpload(result);
      }, 500);
    } catch (err) {
      setIsUploading(false);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      createPreview(file);
      handleUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      createPreview(file);
      handleUpload(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onDelete) onDelete();
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'rectangle': return 'aspect-video';
      default: return 'aspect-auto';
    }
  };

  return (
    <div className="w-full max-w-md">
      <div
        className={`
          relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
          ${aspectRatio === 'square' ? 'aspect-square min-h-[200px]' : aspectRatio === 'rectangle' ? 'aspect-video' : 'min-h-[200px]'}
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02] shadow-lg' 
            : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50 hover:-translate-y-0.5 hover:shadow-md'
          }
          ${preview ? 'border-green-500 bg-white' : ''}
          ${error ? 'border-red-400 bg-red-50' : ''}
          overflow-hidden flex items-center justify-center
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !preview && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {!preview && !isUploading && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl text-white shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                <UploadOutlined style={{ fontSize: 28 }} />
              </div>
            </div>
            <p className="text-base font-semibold text-slate-700 mb-1">
              {isDragging ? 'Drop image here' : 'Drag & drop image'}
            </p>
            <p className="text-sm text-slate-500 mb-3">
              or <span className="text-indigo-500 font-semibold underline underline-offset-2 hover:text-indigo-600">browse</span> from files
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>JPG, PNG, GIF, WEBP</span>
              <span className="opacity-50">•</span>
              <span>Max {maxSize}MB</span>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-20 h-20 mb-4">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-slate-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="text-indigo-500 transition-all duration-300"
                  strokeWidth="8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="45"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${uploadProgress * 2.83} 283`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <LoadingOutlined spin style={{ fontSize: 24, color: '#6366f1' }} />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">Uploading... {uploadProgress}%</p>
          </div>
        )}

        {preview && !isUploading && (
          <div className="absolute inset-0">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
              <button
                type="button"
                className="w-9 h-9 flex items-center justify-center bg-white/95 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 shadow-lg hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <CloseOutlined style={{ fontSize: 18 }} />
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/95 rounded-full text-green-500 text-sm font-semibold shadow-lg">
                <CheckCircleOutlined />
                <span>Uploaded</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
            <CloseOutlined style={{ fontSize: 14 }} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {preview && (
        <div className="flex items-center gap-3 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-9 h-9 flex items-center justify-center bg-indigo-100 rounded-lg text-indigo-500">
            <ImageOutlined style={{ fontSize: 16 }} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-700">Image uploaded successfully</span>
            <span className="text-xs text-slate-500">Click to replace</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
