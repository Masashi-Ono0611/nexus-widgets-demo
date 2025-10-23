"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ToastProvider, useToast } from "../../../../_components/common/ToastProvider";

function QrInner() {
  const params = useParams();
  const { showSuccess } = useToast();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id?.[0] : undefined;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const receivePath = id ? `/gifting/${id}/receive` : "";
  const receiveUrl = useMemo(() => {
    if (!mounted || !id) return "";
    return `${window.location.origin}${receivePath}`;
  }, [mounted, id, receivePath]);
  const qrSrc = useMemo(() => {
    if (!mounted || !receiveUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(receiveUrl)}`;
  }, [mounted, receiveUrl]);

  return (
    <main className="container" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <h1 className="header" style={{ marginBottom: 8 }}>Receive Link QR</h1>
      {!id ? (
        <div style={{ color: "#c62828" }}>Invalid configuration ID</div>
      ) : !mounted ? (
        <div style={{ color: "#666" }}>Preparing QR...</div>
      ) : (
        <>
          <img alt="QR" src={qrSrc} width={320} height={320} style={{ borderRadius: 12, border: "1px solid #eee" }} />
          <div style={{ fontSize: 12, color: "#666", wordBreak: "break-all", textAlign: "center", maxWidth: 640 }}>{receiveUrl}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <a className="btn" style={{ background: "#4CAF50" }} href={receiveUrl} target="_blank" rel="noreferrer">Open receive page</a>
          </div>
        </>
      )}
    </main>
  );
}

export default function GiftingReceiveQrPage() {
  return (
    <ToastProvider>
      <QrInner />
    </ToastProvider>
  );
}
