'use client';

import React from 'react';
import { Upload, X, FileText, Loader2, CheckCircle2, Activity, BarChart3, Sparkles, Eye } from 'lucide-react';

type FileItem = {
  _id?: string;
  id?: number;
  filename?: string;
  name?: string;
  owner?: string;
  size?: number | string;
  date?: string;
  createdAt?: string | Date;
  deletedAt?: string | Date;
  type?: string;
  pages?: number;
  summary?: string;
  tags?: string[];
  extractedText?: string;
  text?: string;
  deleted?: boolean;
};

type Analytics = {
  documentCount: number;
  totalPages: number;
  embeddingsGenerated: number;
  avgResponseTime: number;
  topSearches: Array<{ query: string; count: number }>;
};

interface UploadSidebarProps {
  // Upload states
  showUploadPanel: boolean;
  setShowUploadPanel?: (show: boolean) => void; // Made optional
  chosenFile: File | null;
  setChosenFile: (file: File | null) => void;
  isUploading: boolean;
  uploadProgress: string;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  
  // Selected file state
  selectedFile: FileItem | null;
  setSelectedFile: (file: FileItem | null) => void;
  
  // Analytics data
  analytics: Analytics;
  
  // Handlers
  handleUpload: (file: File) => Promise<void>;
  getRealId: (file: FileItem) => string;
}

const UploadSidebar: React.FC<UploadSidebarProps> = ({
  showUploadPanel,
  setShowUploadPanel,
  chosenFile,
  setChosenFile,
  isUploading,
  uploadProgress,
  isDragging,
  setIsDragging,
  fileInputRef,
  selectedFile,
  setSelectedFile,
  analytics,
  handleUpload,
  getRealId,
}) => {
  
  // Helper Functions
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setChosenFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const supportedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (supportedTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|txt|jpg|jpeg|png|webp)$/i)) {
        setChosenFile(file);
      } else {
        alert("Unsupported file type. Please upload: PDF, DOCX, TXT, JPG, PNG, or WEBP");
      }
    }
  };

  const handleConfirmUpload = () => {
    if (chosenFile) {
      handleUpload(chosenFile);
    }
  };

  const handleCancelUpload = () => {
    setChosenFile(null);
    if (setShowUploadPanel) setShowUploadPanel(false);
    setIsDragging(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Search Insights Data
  const searchInsights = [
    { 
      label: 'Indexed Documents', 
      value: (analytics.documentCount || 0).toLocaleString(), 
      icon: FileText, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50' 
    },
    { 
      label: 'Total Pages', 
      value: (analytics.totalPages || 0).toLocaleString(), 
      icon: FileText, 
      color: 'text-purple-600', 
      bgColor: 'bg-purple-50' 
    },
    { 
      label: 'Embeddings Generated', 
      value: (analytics.embeddingsGenerated || 0).toLocaleString(), 
      icon: Sparkles, 
      color: 'text-indigo-600', 
      bgColor: 'bg-indigo-50' 
    },
    { 
      label: 'Avg Response Time', 
      value: analytics.avgResponseTime > 0 ? `${analytics.avgResponseTime.toFixed(2)}s` : '0s', 
      icon: Activity, 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-50' 
    },
  ];

  return (
    <>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 90%; }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>

      <div className="hidden lg:block w-80 bg-white border-l border-gray-200 flex-shrink-0 overflow-y-auto overflow-x-hidden">
        <div className="p-6">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
          />

          {/* Initial State - Show Upload Button + Insights */}
          {!showUploadPanel && !isUploading && !selectedFile && (
            <>
              {setShowUploadPanel && (
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setShowUploadPanel(true)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Upload
                  </button>
                </div>
              )}

              {/* AI Search Insights */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-1">AI Search Insights</h3>
                <p className="text-xs text-gray-500">Real-time system analytics</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {searchInsights.map((stat, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4">
                    <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center mb-3`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-black">Indexing Status</h4>
                    <p className="text-xs text-gray-600">All systems operational</p>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {analytics.topSearches.length > 0 && (
                <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900">Top Searches</h4>
                <BarChart3 className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                {analytics.topSearches.map((search, idx) => (
                <div key={idx} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-900 mb-1 truncate" title={search.query}>{search.query}</div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-blue-600 h-1.5 rounded-full" 
                              style={{ width: `${Math.min((search.count / (analytics.topSearches[0]?.count || 1)) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-500">{search.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-black mb-2">Pro Search Tips</h4>
                    <ul className="text-xs text-gray-600 space-y-1.5">
                      <li>• Use natural language for best results</li>
                      <li>• Try "Find documents about..."</li>
                      <li>• Search by content, not just filenames</li>
                      <li>• AI understands context & semantics</li>
                      <li>• Works with images via OCR extraction</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Upload Panel - Initial */}
          {showUploadPanel && !chosenFile && !isUploading && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Upload Document</h3>
                <button
                  onClick={handleCancelUpload}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 cursor-pointer" />
                </button>
              </div>

              {/* Drag & Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
                  ${isDragging 
                    ? 'border-purple-500 bg-purple-50 scale-[1.02] shadow-lg' 
                    : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-50/50'
                  }
                `}
              >
                {isDragging && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl opacity-50 animate-pulse" />
                )}

                <div className="relative z-10">
                  <div className={`
                    w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full 
                    flex items-center justify-center transition-transform duration-300
                    ${isDragging ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
                  `}>
                    <Upload className="w-8 h-8 text-white" />
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragging ? 'Drop file here' : 'Drag & drop your file'}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    or click Choose File below
                  </p>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs text-gray-500">
                    <FileText className="w-3 h-3" />
                    <span>PDF, DOCX, TXT, JPG, PNG, WEBP</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelUpload}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={openFilePicker}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all cursor-pointer"
                >
                  Choose File
                </button>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Upload className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Tips</h4>
                    <ul className="text-xs text-gray-600 space-y-1.5">
                      <li>• Max file size: 50MB</li>
                      <li>• Images will be processed with OCR</li>
                      <li>• AI will extract and index your content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Upload Panel */}
          {chosenFile && !isUploading && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Confirm Upload</h3>
                <button
                  onClick={handleCancelUpload}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* File Preview Card */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border-2 border-purple-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate mb-1">
                      {chosenFile.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(chosenFile.size)}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-xs text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Ready to upload
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCancelUpload}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Upload
                </button>
              </div>

              {/* File Info */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>File type:</span>
                  <span className="font-medium">{chosenFile.type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last modified:</span>
                  <span className="font-medium">
                    {new Date(chosenFile.lastModified).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Upload Progress - REMOVED: Using main dashboard modal only */}
          {/* The main dashboard upload modal handles the upload progress display */}

          {/* Selected File Details */}
          {selectedFile && !showUploadPanel && !isUploading && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Document Details</h3>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
                  {['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(selectedFile.type || '') ? (
                    <FileText className="w-6 h-6 text-purple-600" />
                  ) : (
                    <FileText className="w-6 h-6 text-purple-600" />
                  )}
                </div>
                <h4 className="font-medium text-gray-900 mb-2 truncate">{selectedFile.filename || selectedFile.name}</h4>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>
                    {typeof selectedFile.size === 'number' 
                      ? `${Math.round((selectedFile.size / 1024 / 1024) * 100) / 100} MB`
                      : selectedFile.size || "0 MB"}
                  </span>
                  <span>•</span>
                  <span>
                    {selectedFile.createdAt 
                      ? new Date(selectedFile.createdAt).toLocaleDateString()
                      : selectedFile.date || "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Type</label>
                  <p className="text-sm text-gray-900">{selectedFile.type?.toUpperCase() || "Unknown"}</p>
                </div>
                
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Owner</label>
                  <p className="text-sm text-gray-900">{selectedFile.owner || "Unknown"}</p>
                </div>

                {selectedFile.pages && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Pages</label>
                    <p className="text-sm text-gray-900">{selectedFile.pages} pages</p>
                  </div>
                )}

                {selectedFile.summary && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Summary</label>
                    <p className="text-sm text-gray-600 leading-relaxed">{selectedFile.summary}</p>
                  </div>
                )}

                {selectedFile.tags && selectedFile.tags.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedFile.tags.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => {
                  const fileId = getRealId(selectedFile);
                  if (fileId) {
                    window.open(`/api/documents/${fileId}/view`, '_blank');
                  } else {
                    alert('Document ID not found');
                  }
                }}
                className="w-full py-2.5 bg-gray-900 text-white rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Open Document
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadSidebar;
