import { useState, useRef, useCallback } from 'react';
import { UserOutlined, CameraOutlined, CheckOutlined, LoadingOutlined } from '@ant-design/icons';
import { uploadAvatar } from '../../services/uploadService';

const AvatarUploader = ({ 
  onUpload, 
  onDelete,
  initialImage = null,
  size = 'medium',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const maxSize = 5;
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  const validateFile = (file) => {
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: JPG, PNG, GIF, WEBP`;
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
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 100);

      const result = await uploadAvatar(file);
      
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

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-16 h-16';
      case 'large': return 'w-44 h-44';
      default: return 'w-28 h-28';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 48;
      default: return 36;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          relative rounded-full cursor-pointer overflow-hidden transition-all duration-300 border-3
          ${getSizeClasses()}
          ${isDragging 
            ? 'border-indigo-500 bg-indigo-100 scale-105 shadow-lg ring-4 ring-indigo-200' 
            : 'border-slate-200 bg-slate-100 hover:border-indigo-400 hover:scale-[1.02] hover:shadow-md'
          }
          ${preview ? 'border-green-500' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {!preview && !isUploading && (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="text-slate-400">
              <UserOutlined style={{ fontSize: getIconSize() }} />
            </div>
            <div className="absolute bottom-1 right-1 w-7 h-7 flex items-center justify-center bg-indigo-500 rounded-full text-white opacity-0 hover:opacity-100 transition-opacity">
              <CameraOutlined style={{ fontSize: 14 }} />
            </div>
          </div>
        )}

        {isUploading && (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-500">
            {uploadProgress < 100 ? (
              <LoadingOutlined spin style={{ fontSize: size === 'small' ? 16 : 24, color: '#fff' }} />
            ) : (
              <CheckOutlined style={{ fontSize: size === 'small' ? 16 : 24, color: '#22c55e' }} />
            )}
          </div>
        )}

        {preview && !isUploading && (
          <>
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <CameraOutlined style={{ fontSize: 20, color: 'white' }} />
            </div>
          </>
        )}

        {error && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs whitespace-nowrap">
            {error}
          </div>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-500">
        {preview ? 'Click to change photo' : 'Upload profile photo'}
      </p>
    </div>
  );
};

export default AvatarUploader;
