"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

export type PDFUploadProps = {
  onUpload: (file: File, title?: string) => Promise<void>;
  isUploading: boolean;
};

export const PDFUpload = ({ onUpload, isUploading }: PDFUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(".pdf", ""));
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(".pdf", ""));
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await onUpload(selectedFile, title);
      setSelectedFile(null);
      setTitle("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Upload PDF Document
        </h2>

        {/* Drag and Drop Area */}
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          animate={{
            borderColor: isDragging ? "#475569" : "#e2e8f0",
            backgroundColor: isDragging ? "#f1f5f9" : "#ffffff",
          }}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            isDragging ? "border-slate-600 bg-slate-50" : "border-slate-200"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile ? (
            <>
              <svg
                className="w-16 h-16 mx-auto mb-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-slate-600 font-medium mb-2">
                Drag and drop your PDF here
              </p>
              <p className="text-slate-500 text-sm mb-4">or</p>
              <button
                type="button"
                className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                Browse Files
              </button>
              <p className="text-xs text-slate-400 mt-4">
                Maximum file size: 10MB
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-slate-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="text-slate-400 hover:text-red-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </motion.div>

        {/* Title Input */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Document Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this document"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-transparent"
            />
          </motion.div>
        )}

        {/* Upload Button */}
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Uploading & Processing...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                    />
                  </svg>
                  <span>Upload PDF</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
