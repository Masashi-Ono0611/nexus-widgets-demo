"use client";
import React from "react";
import { ReceiveUrlForm } from "./_components/ReceiveUrlForm";
import { QRCodeDisplay } from "./_components/QRCodeDisplay";

export default function UserPage() {
  const [generatedUrl, setGeneratedUrl] = React.useState<string | null>(null);

  const handleGenerate = (params: { to: string; chainId: string; token: string }) => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${baseUrl}/receive?to=${params.to}&chainId=${params.chainId}&token=${params.token}`;
    setGeneratedUrl(url);
  };

  return (
    <main className="container">
      <h1 className="header">Generate Receive URL</h1>

      <div className="userpage-layout">
        <div className="form-section">
          <ReceiveUrlForm onGenerate={handleGenerate} />
        </div>

        {generatedUrl && (
          <div className="qr-section">
            <QRCodeDisplay url={generatedUrl} />
          </div>
        )}
      </div>
    </main>
  );
}
