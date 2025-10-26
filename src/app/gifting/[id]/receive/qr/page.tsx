"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

function QrInner() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params?.id?.[0] : undefined;
  const receivePath = id ? `/gifting/${id}/receive` : "";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
      <h1 className={`${FONT_SIZES.pageTitle} ${FONT_WEIGHTS.pageTitle} mb-4`}>Receive Link QR</h1>
      {!id ? (
        <div className={COLORS.status.error.text}>Invalid configuration ID</div>
      ) : !mounted ? (
        <div className={COLORS.textSecondary}>Preparing QR...</div>
      ) : (
        <>
          <img alt="QR" src={qrSrc} width={320} height={320} className="rounded-lg border" />
          <div className={`${FONT_SIZES.bodySmall} ${COLORS.textSecondary}`} style={{ wordBreak: "break-all", textAlign: "center", maxWidth: 640 }}>{receiveUrl}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <a 
              className={`inline-flex items-center justify-center rounded-md ${FONT_SIZES.buttonMedium} ${FONT_WEIGHTS.button} ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${COLORS.brand.recipientPrimary.text} ${COLORS.brand.recipientPrimary.background} ${COLORS.brand.recipientPrimary.hover} h-10 px-4 py-2`}
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
      <Toaster
        position="top-right"
        closeButton={true}
        richColors={true}
        duration={10000}
      />
      <QrInner />
    </>
  );
}
