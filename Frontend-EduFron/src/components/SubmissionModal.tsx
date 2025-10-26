import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: number;
  assignmentTitle: string;
  onSubmit: (file: File, comments: string) => void;
  isSubmitting: boolean;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({
  isOpen,
  onClose,
  assignmentId,
  assignmentTitle,
  onSubmit,
  isSubmitting
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [comments, setComments] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];

    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, Word, Excel, PowerPoint, text, or image files.');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB.');
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }
    onSubmit(file, comments);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetForm = () => {
    setFile(null);
    setComments('');
    setDragActive(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Submit Assignment</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Assignment Info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">{assignmentTitle}</h3>
            <p className="text-sm text-blue-700">Assignment ID: #{assignmentId}</p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload File *
            </label>
            
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                disabled={isSubmitting}
              />
              
              {!file ? (
                <div>
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your file here, or{' '}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                      disabled={isSubmitting}
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported: PDF, Word, Excel, PowerPoint, Text, Images (Max: 10MB)
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <p className="font-medium text-gray-900 mb-1">{file.name}</p>
                  <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-orange-600 hover:text-orange-700 text-sm mt-2"
                    disabled={isSubmitting}
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Additional Comments (Optional)
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Add any comments about your submission..."
              disabled={isSubmitting}
            />
          </div>

          {/* Requirements */}
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-medium mb-1">Before submitting:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Ensure your file is the correct assignment</li>
                  <li>Check that all required content is included</li>
                  <li>Verify file is not corrupted</li>
                  <li>You cannot resubmit after submission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!file || isSubmitting}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Submit Assignment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionModal;