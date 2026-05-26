"use client";

import { ValidFileType } from "@/lib/validTypeFiles";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Plus, UploadCloud, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

interface DropzoneProps {
  files: File[];
  onFilesAdded: (newFiles: File[]) => void;
  onFileRemoved: (index: number) => void;
  onDraggingChange?: (isDragging: boolean) => void;
  compact?: boolean;
  children?: React.ReactNode;
}

export default function Dropzone({
  files,
  onFilesAdded,
  onFileRemoved,
  onDraggingChange,
  compact,
  children,
}: DropzoneProps) {
  const [isDragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setDraggingState = (val: boolean) => {
    setDragging(val);
    onDraggingChange?.(val);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDraggingState(true); };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDraggingState(false);
  };
  const handleDragDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingState(false);
    if (e.dataTransfer.files?.length > 0) validateAndAdd(Array.from(e.dataTransfer.files));
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) { validateAndAdd(Array.from(e.target.files)); e.target.value = ""; }
  };

  const validateAndAdd = (incoming: File[]) => {
    const valid: File[] = [];
    const existingNames = new Set(files.map((f) => f.name));
    for (const file of incoming) {
      if (!ValidFileType.includes(file.type)) {
        toast.error(`Format tidak didukung: ${file.name}`, { description: "Gunakan PDF, DOCX, JPG, atau PNG." });
        continue;
      }
      if (existingNames.has(file.name)) { toast.info(`File sudah ada: ${file.name}`); continue; }
      valid.push(file);
    }
    if (valid.length > 0) onFilesAdded(valid);
  };

  const hasFiles = files.length > 0;

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } }}
      className={`relative w-full min-h-screen flex flex-col items-center gap-4 p-6 transition-colors duration-300 ${
        compact ? "justify-start pt-8" : "justify-center pb-32"
      } ${isDragging
          ? "bg-amber-50/60 dark:bg-amber-950/20"
          : "bg-slate-50 dark:bg-slate-950"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDragDrop}
    >
      {/* Drag border overlay */}
      <motion.div
        animate={{ opacity: isDragging ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 border-4 border-dashed border-amber-400 pointer-events-none rounded-sm"
      />

      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/jpg,image/png,.pdf,.doc,.docx"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />

      <AnimatePresence mode="wait">
        {!hasFiles ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className={`relative border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer w-full max-w-lg transition-all duration-300 ${
              isDragging
                ? "border-amber-400 bg-amber-50 dark:bg-amber-950/30 shadow-inner shadow-amber-100 dark:shadow-amber-900/30"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-md hover:shadow-amber-50 dark:hover:shadow-amber-950/30"
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Background glow when dragging */}
            <AnimatePresence>
              {isDragging && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-400/10 to-amber-500/5 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <div className="flex flex-col items-center justify-center space-y-5">
              <motion.div
                animate={{ scale: isDragging ? 1.2 : 1, rotate: isDragging ? 5 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18 }}
                className={`p-5 rounded-2xl transition-colors ${
                  isDragging
                    ? "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/50"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                }`}
              >
                <UploadCloud className="size-10" />
              </motion.div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <span className="text-amber-600 dark:text-amber-400">Klik untuk mengunggah</span>{" "}
                  atau seret file ke sini
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  PDF, DOCX, JPG, PNG — bisa lebih dari 1 file
                </p>
              </div>

              <motion.div
                animate={{ opacity: isDragging ? 1 : 0, y: isDragging ? 0 : 8 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-semibold text-amber-600 dark:text-amber-400"
              >
                Lepaskan sekarang ✓
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="files"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-lg space-y-2"
          >
            <AnimatePresence initial={false}>
              {files.map((file, i) => (
                <motion.div
                  key={`${file.name}-${i}`}
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md dark:hover:shadow-black/20 transition-shadow">
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
                        <FileText className="size-4" />
                      </div>
                      <div className="truncate text-left">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onFileRemoved(i)}
                      className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors shrink-0 ml-2"
                    >
                      <X className="size-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 w-full p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-all text-sm"
            >
              <Plus className="size-4" />
              Tambah file lain (screenshot chat, lampiran, dll.)
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </motion.div>
  );
}
