"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadIcon, FileTextIcon, XIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/app/utils/cn";

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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Upload PDF Document
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Drag and Drop Area */}
          <motion.div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            animate={{
              borderColor: isDragging ? "#475569" : "#e2e8f0",
              backgroundColor: isDragging ? "#f1f5f9" : "#ffffff",
            }}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
              isDragging ? "border-slate-600 bg-slate-50" : "border-slate-200"
            )}
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
                <UploadIcon className="size-16 mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 font-medium mb-2">
                  Drag and drop your PDF here
                </p>
                <p className="text-slate-500 text-sm mb-4">or</p>
                <Button variant="default" size="sm">
                  Browse Files
                </Button>
                <p className="text-xs text-slate-400 mt-4">
                  Maximum file size: 10MB
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileTextIcon className="size-10 text-red-600" />
                  <div className="text-left">
                    <p className="font-medium text-slate-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="text-slate-400 hover:text-red-600"
                >
                  <XIcon className="size-4" />
                </Button>
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
              <Label
                htmlFor="title"
                className="text-sm font-medium text-slate-700"
              >
                Document Title (Optional)
              </Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for this document"
                className="mt-2"
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
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Loader2Icon className="size-5 animate-spin mr-2" />
                    <span>Uploading & Processing...</span>
                  </>
                ) : (
                  <>
                    <UploadIcon className="size-5 mr-2" />
                    <span>Upload PDF</span>
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
