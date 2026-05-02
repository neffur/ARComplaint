"use client";

import { useState, useCallback, useRef } from "react";
import { X, FileText, Upload, CheckCircle } from "lucide-react";

interface UploadDropzoneProps {
  onFilesChange?: (files: File[]) => void;
}

export function UploadDropzone({ onFilesChange }: UploadDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerUploadAnimation = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setJustUploaded(true);
      setTimeout(() => setJustUploaded(false), 2000);
    }, 1200);
  };

  const addFiles = (incoming: File[]) => {
    const filtered = incoming.filter(
      (file) =>
        !files.some(
          (f) => f.name === file.name && f.size === file.size
        )
    );

    const newFiles = [...files, ...filtered];

    setFiles(newFiles);
    onFilesChange?.(newFiles);

    triggerUploadAnimation();
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const dropped = Array.from(e.dataTransfer.files);
      addFiles(dropped);
    },
    [files]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;

      const selected = Array.from(e.target.files);
      addFiles(selected);

      // reset input so same file can be uploaded again
      e.target.value = "";
    },
    [files]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  return (
    <div className="space-y-3">

      {/* DROPZONE */}
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center w-full h-36 border border-dashed rounded-xl cursor-pointer overflow-hidden ${
          isDragging
            ? "border-red-500 bg-red-500/10"
            : "border-red-500/40 bg-[#1a1a1a]"
        }`}
      >

        <div className="relative flex flex-col items-center gap-2 z-10">

          {!isUploading && !justUploaded && (
            <Upload className="w-7 h-7 text-red-500" />
          )}

          {isUploading && (
            <Upload className="w-7 h-7 text-red-500 animate-bounce" />
          )}

          {justUploaded && (
            <CheckCircle className="w-7 h-7 text-green-500" />
          )}

          <p className="text-lg tracking-widest text-red-400 uppercase">
            Upload
          </p>

          <p className="text-xs text-red-400/70">
            Click or drag & drop — add as many as you want
          </p>

        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx"
        />

      </label>

      {/* FILE LIST */}
      {files.length > 0 && (
        <div className="space-y-2">

          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-[#121212] rounded-lg border border-red-500/20"
            >

              <div className="flex items-center gap-3">

                <div className="p-1.5 rounded-md bg-red-500/10 border border-red-500/20">
                  <FileText className="w-4 h-4 text-red-500" />
                </div>

                <div className="flex flex-col">

                  <span className="text-sm text-white truncate max-w-[200px]">
                    {file.name}
                  </span>

                  <span className="text-xs text-gray-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>

                </div>

              </div>

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1.5 rounded-md hover:bg-red-500/20"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}