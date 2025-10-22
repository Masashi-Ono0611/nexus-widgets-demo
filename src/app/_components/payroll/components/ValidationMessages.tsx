import React from "react";

interface ValidationMessagesProps {
  messages: string[];
}

export function ValidationMessages({ messages }: ValidationMessagesProps) {
  if (messages.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "0.75rem",
        padding: "0.5rem",
        background: "#FFF3F3",
        color: "#B71C1C",
        borderRadius: 4,
        fontSize: "0.9rem",
      }}
    >
      <strong>Please resolve:</strong>
      <ul style={{ margin: "0.25rem 0 0 1rem" }}>
        {messages.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </div>
  );
}
