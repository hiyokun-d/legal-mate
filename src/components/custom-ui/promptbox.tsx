"use client";

import { SadaAvatar } from "@/components/custom-ui/sada-avatar";
import { motion } from "framer-motion";
import { SendHorizontal } from "lucide-react";
import React, { useRef, useState } from "react";

interface promptBoxProps {
  isDragging: boolean;
  onSubmit: (text: string) => void;
}

export default function PromptBox({ isDragging, onSubmit }: promptBoxProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <motion.div
      animate={{
        scale: isDragging ? 1.02 : 1,
        y: isDragging ? -4 : 0,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`flex items-end gap-3 p-3 rounded-2xl transition-colors duration-300 ${
        isDragging
          ? "bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-600 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30"
          : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-black/30"
      }`}
    >
      <SadaAvatar size="sm" />

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={isDragging ? "Lepaskan file di atas..." : "Tanya Sada tentang kontrak ini..."}
        rows={1}
        className="flex-1 resize-none text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none bg-transparent max-h-36 overflow-y-auto leading-relaxed"
      />

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSubmit}
        disabled={!value.trim()}
        className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-400 hover:to-teal-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm shadow-emerald-500/30"
      >
        <SendHorizontal className="size-4" />
      </motion.button>
    </motion.div>
  );
}
