"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = { id: number; type: ToastType; message: React.ReactNode; durationMs?: number };

type ToastContextValue = {
  showSuccess: (message: React.ReactNode, durationMs?: number) => void;
  showError: (message: React.ReactNode, durationMs?: number) => void;
  showInfo: (message: React.ReactNode, durationMs?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [counter, setCounter] = useState(1);

  const enqueue = useCallback((type: ToastType, message: React.ReactNode, durationMs?: number) => {
    const id = counter;
    setToasts((prev) => [...prev, { id, type, message, durationMs }]);
    setCounter((c) => c + 1);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs ?? 3500);
  }, [counter]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(() => ({
    showSuccess: (m, d) => enqueue("success", m, d),
    showError: (m, d) => enqueue("error", m, d),
    showInfo: (m, d) => enqueue("info", m, d),
  }), [enqueue]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: "fixed", right: 16, bottom: 16, display: "flex", flexDirection: "column", gap: 8, zIndex: 2000 }}>
        {toasts.map((t) => (
          <div key={t.id} className="card" style={{
            minWidth: 260,
            padding: "0.75rem 1rem",
            borderLeft: `4px solid ${t.type === "success" ? "#4CAF50" : t.type === "error" ? "#f44336" : "#2196F3"}`,
            position: "relative"
          }}>
            <button
              onClick={() => dismissToast(t.id)}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "none",
                border: "none",
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "#666",
                padding: "2px 6px",
                borderRadius: "3px",
                lineHeight: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              ×
            </button>
            <div style={{ fontWeight: 600, marginBottom: 4, paddingRight: "24px" }}>
              {t.type === "success" ? "Success" : t.type === "error" ? "Error" : "Info"}
            </div>
            <div style={{ paddingRight: "24px" }}>{t.message}</div>
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
