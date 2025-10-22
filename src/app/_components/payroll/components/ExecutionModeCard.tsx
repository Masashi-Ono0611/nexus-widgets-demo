import React from "react";

interface ExecutionModeCardProps {
  scheduleEnabled: boolean;
  setScheduleEnabled: (enabled: boolean) => void;
  intervalMinutes: string;
  setIntervalMinutes: (value: string) => void;
  maxExecutions: string;
  setMaxExecutions: (value: string) => void;
}

export function ExecutionModeCard({
  scheduleEnabled,
  setScheduleEnabled,
  intervalMinutes,
  setIntervalMinutes,
  maxExecutions,
  setMaxExecutions,
}: ExecutionModeCardProps) {
  return (
    <div
      style={{
        margin: "1.25rem 0",
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "0.75rem"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <strong>Execution Mode</strong>
        <span
          style={{
            fontSize: "0.85rem",
            fontWeight: 600,
            padding: "0.2rem 0.6rem",
            borderRadius: "999px",
            background: "#f5f5f5",
            color: "#333",
          }}
        >
          {scheduleEnabled ? "Recurring Schedule" : "Immediate Transfer"}
        </span>
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: scheduleEnabled ? "0.75rem" : 0 }}>
        <button
          type="button"
          onClick={() => setScheduleEnabled(false)}
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #ddd",
            background: scheduleEnabled ? "#f5f5f5" : "#333",
            color: scheduleEnabled ? "#333" : "#ffffff",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Immediate
        </button>
        <button
          type="button"
          onClick={() => setScheduleEnabled(true)}
          style={{
            flex: 1,
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #ddd",
            background: scheduleEnabled ? "#333" : "#f5f5f5",
            color: scheduleEnabled ? "#ffffff" : "#333",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          Recurring
        </button>
      </div>
      {scheduleEnabled && (
        <div
          style={{
            display: "grid",
            gap: "0.75rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          }}
        >
          <label className="field" style={{ margin: 0 }}>
            <span>Interval (minutes)</span>
            <input
              type="number"
              min="1"
              max="525600"
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(e.target.value)}
              className="input"
              placeholder="60 = 1 hour, 1440 = 1 day"
            />
          </label>
          <label className="field" style={{ margin: 0 }}>
            <span>Max Executions (0 = unlimited)</span>
            <input
              type="number"
              min="0"
              max="1000"
              value={maxExecutions}
              onChange={(e) => setMaxExecutions(e.target.value)}
              className="input"
            />
          </label>
        </div>
      )}
    </div>
  );
}
