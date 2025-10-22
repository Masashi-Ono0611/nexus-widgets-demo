import React from "react";
import { createPortal } from "react-dom";

interface SaveConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  configName: string;
  setConfigName: (name: string) => void;
  configDescription: string;
  setConfigDescription: (description: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  isSaving: boolean;
  title: string;
  saveButtonText: string;
  showPublicToggle?: boolean;
}

export function SaveConfigModal({
  isOpen,
  onClose,
  onSave,
  configName,
  setConfigName,
  configDescription,
  setConfigDescription,
  isPublic,
  setIsPublic,
  isSaving,
  title,
  saveButtonText,
  showPublicToggle = true,
}: SaveConfigModalProps) {
  if (!isOpen) return null;

  const modal = (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "500px",
          width: "90%",
        }}
        className="card"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Name *
          </label>
          <input
            type="text"
            value={configName}
            onChange={(e) => setConfigName(e.target.value)}
            placeholder="e.g., Family Gift Split"
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Description
          </label>
          <textarea
            value={configDescription}
            onChange={(e) => setConfigDescription(e.target.value)}
            placeholder="Optional description"
            rows={3}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
          />
        </div>
        {showPublicToggle && (
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
              <span>Make this configuration public (others can view and copy)</span>
            </label>
          </div>
        )}
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            {isSaving ? "Saving..." : saveButtonText}
          </button>
          <button onClick={onClose} className="btn" style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
