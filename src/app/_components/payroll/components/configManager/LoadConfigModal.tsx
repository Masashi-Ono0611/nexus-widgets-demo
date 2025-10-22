import React from "react";
import { SavedConfig } from "./types";

interface LoadConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: SavedConfig[];
  isLoading: boolean;
  onLoad: (configId: bigint) => void;
  onDelete: (configId: bigint) => void;
  userAddress: string | null;
}

export function LoadConfigModal({
  isOpen,
  onClose,
  configs,
  isLoading,
  onLoad,
  onDelete,
  userAddress,
}: LoadConfigModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "2rem",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
        className="card"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>Load Configuration</h3>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {configs.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666" }}>
                No public configurations found
              </p>
            ) : (
              configs.map((config) => (
                <div
                  key={config.id.toString()}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.5rem 0" }}>
                        {config.name}
                        {config.isPublic && (
                          <span style={{ marginLeft: "0.5rem", fontSize: "0.8em", color: "#666" }}>
                            🌐 Public
                          </span>
                        )}
                      </h4>
                      {config.description && (
                        <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9em", color: "#666" }}>
                          {config.description}
                        </p>
                      )}
                      <p style={{ margin: 0, fontSize: "0.85em", color: "#999" }}>
                        {Number(config.walletGroupCount)} wallet group(s) • Owner: {config.owner.slice(0, 6)}...
                        {config.owner.slice(-4)}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem" }}>
                      <button
                        onClick={() => onLoad(config.id)}
                        className="btn"
                        style={{ background: "#4CAF50", padding: "0.5rem 1rem" }}
                      >
                        Load
                      </button>
                      {userAddress?.toLowerCase() === config.owner.toLowerCase() && (
                        <button
                          onClick={() => onDelete(config.id)}
                          className="btn"
                          style={{ background: "#f44336", padding: "0.5rem 1rem" }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="btn"
          style={{ width: "100%", marginTop: "1rem" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
