"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Toaster } from "sonner";

function QrInner() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id?.[0] : undefined;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const receivePath = id ? `/gifting_figmaUI/${id}/receive` : "";
  const receiveUrl = useMemo(() => {
    if (!mounted || !id) return "";
    return `${window.location.origin}${receivePath}`;
  }, [mounted, id, receivePath]);
  const qrSrc = useMemo(() => {
    if (!mounted || !receiveUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(receiveUrl)}`;
  }, [mounted, receiveUrl]);

  return (
    <main className="container mx-auto px-4 py-8" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <h1 className="text-3xl font-bold mb-4">Receive Link QR</h1>
      {!id ? (
        <div style={{ color: "#c62828" }}>Invalid configuration ID</div>
      ) : !mounted ? (
        <div style={{ color: "#666" }}>Preparing QR...</div>
      ) : (
        <>
          <img alt="QR" src={qrSrc} width={320} height={320} style={{ borderRadius: 12, border: "1px solid #eee" }} />
          <div style={{ fontSize: 12, color: "#666", wordBreak: "break-all", textAlign: "center", maxWidth: 640 }}>{receiveUrl}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <a 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
              href={receiveUrl} 
              target="_blank" 
              rel="noreferrer"
            >
              Open receive page
            </a>
          </div>
        </>
      )}
    </main>
  );
}

export default function GiftingReceiveQrPage() {
  return (
    <>
      <Toaster position="top-right" />
      <QrInner />
    </>
  );
}
