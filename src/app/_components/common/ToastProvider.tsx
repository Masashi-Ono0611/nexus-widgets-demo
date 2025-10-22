"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = { id: number; type: ToastType; message: string };

type ToastContextValue = {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [counter, setCounter] = useState(1);

  const enqueue = useCallback((type: ToastType, message: string) => {
    setToasts((prev) => [...prev, { id: counter, type, message }]);
    setCounter((c) => c + 1);
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3500);
  }, [counter]);

  const value = useMemo<ToastContextValue>(() => ({
    showSuccess: (m) => enqueue("success", m),
    showError: (m) => enqueue("error", m),
    showInfo: (m) => enqueue("info", m),
  }), [enqueue]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: "fixed", right: 16, bottom: 16, display: "flex", flexDirection: "column", gap: 8, zIndex: 2000 }}>
        {toasts.map((t) => (
          <div key={t.id} className="card" style={{ minWidth: 260, padding: "0.75rem 1rem", borderLeft: `4px solid ${t.type === "success" ? "#4CAF50" : t.type === "error" ? "#f44336" : "#2196F3"}` }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{t.type === "success" ? "Success" : t.type === "error" ? "Error" : "Info"}</div>
            <div>{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
