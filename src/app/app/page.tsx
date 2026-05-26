"use client";
import { securePost } from "@/lib/secureRequest";

import AnalyzeConfirm from "@/components/custom-ui/analyze-confirm";
import AnalyzeLoading from "@/components/custom-ui/analyze-loading";
import AnalyzeResult from "@/components/custom-ui/analyze-result";
import Dropzone from "@/components/custom-ui/dropzone";
import PromptBox from "@/components/custom-ui/promptbox";
import { extractFileContent, type FileContent } from "@/lib/extractFileContent";
import type { ChatMessage, GeminiContractResult, GeminiLetterResult } from "@/lib/types";
import { ThemeToggle } from "@/components/custom-ui/theme-toggle";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

type AppState = "idle" | "ready" | "analyzing" | "done";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);

  const [files, setFiles] = useState<File[]>([]);
  const [fileContents, setFileContents] = useState<FileContent[]>([]);

  const [analysisResult, setAnalysisResult] = useState<GeminiContractResult | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setChatLoading] = useState(false);

  const apiPromiseRef = useRef<Promise<GeminiContractResult> | null>(null);

  const addTokens = (n: number) => setTotalTokens((prev) => prev + n);

  const callAnalyzeAPI = (contents: FileContent[]): Promise<GeminiContractResult> =>
    securePost("/api/analyze", { mode: "contract", fileContent: contents }).then(async (r) => {
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Gagal menganalisis dokumen.");
      return data;
    }).then((data) => {
      const { _tokenUsage, ...result } = data;
      addTokens(_tokenUsage ?? 0);
      return result as GeminiContractResult;
    });

  const handleFilesAdded = async (newFiles: File[]) => {
    const extracted = await Promise.all(
      newFiles.map(async (f) => {
        try { return await extractFileContent(f); }
        catch { toast.error(`Gagal membaca ${f.name}`); return null; }
      })
    );

    const validPairs = newFiles
      .map((f, i) => ({ file: f, content: extracted[i] }))
      .filter((p): p is { file: File; content: FileContent } => p.content !== null);

    if (validPairs.length === 0) return;

    setFiles((prev) => [...prev, ...validPairs.map((p) => p.file)]);
    setFileContents((prev) => {
      const next = [...prev, ...validPairs.map((p) => p.content)];
      if (next.length > 0) setAppState("ready");
      return next;
    });
  };

  const handleFileRemoved = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileContents((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setAppState("idle");
      return next;
    });
  };

  const handleConfirm = () => {
    setAppState("analyzing");
    apiPromiseRef.current = callAnalyzeAPI(fileContents);
  };

  const handleAnalyzeDone = useCallback(async () => {
    try {
      const result = await apiPromiseRef.current;
      if (!result) throw new Error("No result");
      setAnalysisResult(result);
      setAppState("done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menganalisis. Coba lagi.");
      setAppState("ready");
    }
  }, []);

  const handlePromptSubmit = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatLoading(true);
    try {
      const res = await securePost("/api/analyze", { mode: "chat", message: text, history: chatHistory });
      const data: { reply: string; _tokenUsage?: number; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengirim pesan.");
      addTokens(data._tokenUsage ?? 0);
      setChatHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengirim pesan. Coba lagi.");
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateLetter = async (): Promise<GeminiLetterResult> => {
    const res = await securePost("/api/analyze", { mode: "letter", analysisResult });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Gagal membuat surat.");
    const { _tokenUsage, ...result } = data;
    addTokens(_tokenUsage ?? 0);
    return result as GeminiLetterResult;
  };

  const handleReset = () => {
    setFiles([]);
    setFileContents([]);
    setAnalysisResult(null);
    setChatHistory([]);
    apiPromiseRef.current = null;
    setAppState("idle");
  };

  return (
    <>
      {/* ── HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0A0805]/90 backdrop-blur-xl border-b border-amber-500/10 dark:border-amber-500/15">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center transition-transform group-hover:scale-110">
              <ShieldCheck className="size-3.5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight">Legal Mate</span>
              <span className="hidden sm:inline ml-2 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                by Sada AI
              </span>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Token count */}
            <AnimatePresence>
              {totalTokens > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                >
                  <Zap className="size-3 text-amber-500" />
                  <span className="text-xs tabular-nums font-medium text-slate-600 dark:text-slate-300">
                    {totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens} tokens
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <ThemeToggle />

            {/* Reset button */}
            <AnimatePresence>
              {(appState === "ready" || appState === "done") && (
                <motion.button
                  key="reset"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                  onClick={handleReset}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Mulai Ulang
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="relative pt-14">
        <Dropzone
          files={files}
          onFilesAdded={handleFilesAdded}
          onFileRemoved={handleFileRemoved}
          onDraggingChange={setIsDragging}
          compact={appState !== "idle"}
        >
          <AnimatePresence mode="wait">
            {appState === "ready" && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-lg"
              >
                <AnalyzeConfirm onConfirm={handleConfirm} />
              </motion.div>
            )}
            {appState === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-lg"
              >
                <AnalyzeLoading onComplete={handleAnalyzeDone} />
              </motion.div>
            )}
            {appState === "done" && analysisResult && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-lg"
              >
                <AnalyzeResult
                  data={analysisResult}
                  chatHistory={chatHistory}
                  isChatLoading={isChatLoading}
                  fileName={files[0]?.name ?? "dokumen"}
                  onGenerateLetter={handleGenerateLetter}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Dropzone>

        <AnimatePresence>
          {appState === "done" && (
            <motion.div
              key="promptbox"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50"
            >
              <PromptBox isDragging={isDragging} onSubmit={handlePromptSubmit} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
