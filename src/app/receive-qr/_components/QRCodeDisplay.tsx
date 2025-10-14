"use client";
import React from "react";
import QRCodeSVG from "react-qr-code";

interface QRCodeDisplayProps {
  url: string;
}

export function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="qr-container">
      <h3 className="qr-title">Receive URL Generated</h3>

      <div className="qr-code-wrapper">
        <QRCodeSVG value={url} size={256} level="M" />
      </div>

      <div className="url-display">
        <code className="url-text">{url}</code>
      </div>

      <div className="button-group">
        <button onClick={handleCopy} className="btn btn-primary">
          {copied ? "Copied!" : "Copy URL"}
        </button>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
          Open Page
        </a>
      </div>
    </div>
  );
}
