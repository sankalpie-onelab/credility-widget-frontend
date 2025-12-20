import { useEffect, useState } from "react";
import { fetchAgentStats } from "./widget/api";

export default function WidgetApp({ store }) {
  const [tasks, setTasks] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [detailView, setDetailView] = useState(false);
  const [globalLogs, setGlobalLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableAgents, setAvailableAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    store.subscribe(setTasks);
  }, []);

  // Discover available agents from the page
  useEffect(() => {
    const inputs = document.querySelectorAll('[data-agent-id]');
    const agents = new Set();
    inputs.forEach(input => {
      const agentId = input.getAttribute('data-agent-id');
      if (agentId) agents.add(agentId);
    });
    
    const agentList = Array.from(agents);
    setAvailableAgents(agentList);
    
    // Set default selected agent
    if (agentList.length > 0 && !selectedAgent) {
      setSelectedAgent(agentList[0]);
    }
  }, []);

  // Fetch global stats when expanded or agent changes
  useEffect(() => {
    if (isExpanded && selectedAgent) {
      fetchGlobalStats();
    }
  }, [isExpanded, selectedAgent]);

  const fetchGlobalStats = async () => {
    if (!selectedAgent) return;
    
    setLoading(true);
    try {
      const data = await fetchAgentStats(selectedAgent);

      if (data.success) {
        setStats(data.stats);
        setGlobalLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentChange = (agentId) => {
    setSelectedAgent(agentId);
    setDetailView(false);
    setSelectedLog(null);
  };

  const getFileType = (url = "") => {
    const cleanUrl = url.split("?")[0].toLowerCase();

    if (cleanUrl.endsWith(".pdf")) return "pdf";
    if (cleanUrl.match(/\.(png|jpg|jpeg|webp)$/)) return "image";
    return "unknown";
  };

  const latest = tasks[0];

  const handleLogClick = (log) => {
    setSelectedLog(log);
    setDetailView(true);
  };

  const handleBackToList = () => {
    setDetailView(false);
    setSelectedLog(null);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pass":
        return "#16a34a";
      case "fail":
        return "#dc2626";
      case "error":
        return "#f59e0b";
      case "running":
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatAgentName = (agentId) => {
    // Convert agent_id to readable name
    return agentId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\s+S\d+$/, ''); // Remove version suffix like "S5"
  };

  return (
    <>
      {/* Bottom Right - Chat Bubble / Expanded Panel */}
      {!isExpanded ? (
        // Collapsed: Chat Bubble
        <div
          onClick={() => setIsExpanded(true)}
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
            zIndex: 9999,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(102, 126, 234, 0.4)";
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <path d="M12 2v4" />
            <circle cx="9" cy="14" r="1" />
            <circle cx="15" cy="14" r="1" />
          </svg>
          {/* Notification Badge */}
          {stats && stats.total_hits > 0 && (
            <div
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: "#ef4444",
                color: "#fff",
                fontSize: "11px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
              }}
            >
              {stats.total_hits}
            </div>
          )}
        </div>
      ) : (
        // Expanded: Full Panel
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "420px",
            height: "600px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9999,
            border: "1px solid #e5e7eb",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "16px", display: "block" }}>
                  History & Logs
                </strong>
                {availableAgents.length > 1 && (
                  <span style={{ fontSize: "11px", opacity: 0.9 }}>
                    {availableAgents.length} agents available
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setIsExpanded(false);
                setDetailView(false);
                setSelectedLog(null);
              }}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: "20px",
                padding: "4px 8px",
                borderRadius: "6px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          {/* Agent Selector */}
          {availableAgents.length > 1 && (
            <div
              style={{
                padding: "12px 20px",
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px", fontWeight: "600" }}>
                SELECT AGENT
              </div>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {availableAgents.map((agentId) => (
                  <button
                    key={agentId}
                    onClick={() => handleAgentChange(agentId)}
                    style={{
                      padding: "8px 14px",
                      background: selectedAgent === agentId ? "#667eea" : "#fff",
                      color: selectedAgent === agentId ? "#fff" : "#374151",
                      border: selectedAgent === agentId ? "none" : "1px solid #d1d5db",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      transition: "all 0.2s",
                      flex: "1 1 auto",
                      minWidth: "0",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedAgent !== agentId) {
                        e.currentTarget.style.background = "#f3f4f6";
                        e.currentTarget.style.borderColor = "#9ca3af";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedAgent !== agentId) {
                        e.currentTarget.style.background = "#fff";
                        e.currentTarget.style.borderColor = "#d1d5db";
                      }
                    }}
                  >
                    {formatAgentName(agentId)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Single Agent Display (when only one agent) */}
          {availableAgents.length === 1 && selectedAgent && (
            <div
              style={{
                padding: "10px 20px",
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              <span style={{ fontWeight: "600" }}>Agent:</span>{" "}
              <span style={{ color: "#667eea", fontWeight: "600" }}>
                {formatAgentName(selectedAgent)}
              </span>
            </div>
          )}

          {/* Stats Bar */}
          {stats && (
            <div
              style={{
                padding: "12px 20px",
                background: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "12px",
                fontSize: "11px",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#6b7280", marginBottom: "2px" }}>Total</div>
                <div style={{ fontWeight: "bold", fontSize: "16px", color: "#111827" }}>
                  {stats.total_hits}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#6b7280", marginBottom: "2px" }}>Pass</div>
                <div style={{ fontWeight: "bold", fontSize: "16px", color: "#16a34a" }}>
                  {stats.pass_count}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#6b7280", marginBottom: "2px" }}>Fail</div>
                <div style={{ fontWeight: "bold", fontSize: "16px", color: "#dc2626" }}>
                  {stats.fail_count}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: "#6b7280", marginBottom: "2px" }}>Rate</div>
                <div style={{ fontWeight: "bold", fontSize: "16px", color: "#667eea" }}>
                  {stats.success_rate.toFixed(0)}%
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          {!detailView ? (
            // List View
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
              }}
            >
              {!selectedAgent ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#9ca3af",
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ margin: "0 auto 12px" }}
                  >
                    <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p style={{ fontSize: "14px", margin: 0 }}>Select an agent to view logs</p>
                </div>
              ) : loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#9ca3af",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      border: "4px solid #f3f4f6",
                      borderTop: "4px solid #667eea",
                      borderRadius: "50%",
                      margin: "0 auto 12px",
                      animation: "spin 1s linear infinite",
                    }}
                  />
                  <p style={{ fontSize: "14px", margin: 0 }}>Loading history...</p>
                </div>
              ) : globalLogs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#9ca3af",
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    style={{ margin: "0 auto 12px" }}
                  >
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p style={{ fontSize: "14px", margin: 0 }}>
                    No validation history yet for {formatAgentName(selectedAgent)}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {globalLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => handleLogClick(log)}
                      style={{
                        padding: "14px",
                        background: "#f9fafb",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        border: "1px solid #e5e7eb",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f3f4f6";
                        e.currentTarget.style.transform = "translateX(-4px)";
                        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f9fafb";
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-block",
                            padding: "4px 12px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "600",
                            background: getStatusColor(log.status),
                            color: "#fff",
                          }}
                        >
                          {log.status.toUpperCase()}
                        </div>
                        <span
                          style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}
                        >
                          {formatDateTime(log.created_at)}
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "#111827",
                          marginBottom: "6px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {log.file_name || "Document"}
                      </div>

                      <div
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>
                          Score: <strong style={{ color: "#111827" }}>{log.score}</strong>
                        </span>
                        <span style={{ fontSize: "11px" }}>
                          {log.processing_time_ms}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Detail View
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
              }}
            >
              <button
                onClick={handleBackToList}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#667eea",
                  cursor: "pointer",
                  fontSize: "13px",
                  padding: "8px 0",
                  marginBottom: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontWeight: "600",
                }}
              >
                <span>←</span> Back to list
              </button>

              {selectedLog && (
                <div style={{ fontSize: "13px" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      borderRadius: "16px",
                      fontSize: "12px",
                      fontWeight: "600",
                      background: getStatusColor(selectedLog.status),
                      color: "#fff",
                      marginBottom: "16px",
                    }}
                  >
                    {selectedLog.status.toUpperCase()} - Score: {selectedLog.score}
                  </div>

                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "12px",
                    }}
                  >
                    <div
                      style={{ fontSize: "11px", color: "#6b7280", marginBottom: "4px" }}
                    >
                      File Name
                    </div>
                    <div
                      style={{ fontWeight: "600", fontSize: "12px", marginBottom: "8px" }}
                    >
                      {selectedLog.file_name || "N/A"}
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                        fontSize: "11px",
                      }}
                    >
                      <div>
                        <span style={{ color: "#6b7280" }}>Document Type:</span>
                        <div style={{ fontWeight: "600", marginTop: "2px" }}>
                          {selectedLog.document_type || "N/A"}
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>Processing Time:</span>
                        <div style={{ fontWeight: "600", marginTop: "2px" }}>
                          {selectedLog.processing_time_ms}ms
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>OCR Confidence:</span>
                        <div style={{ fontWeight: "600", marginTop: "2px" }}>
                          {selectedLog.ocr_extraction_confidence?.toFixed(1) || "0"}%
                        </div>
                      </div>
                      <div>
                        <span style={{ color: "#6b7280" }}>User ID:</span>
                        <div
                          style={{
                            fontWeight: "600",
                            marginTop: "2px",
                            fontFamily: "monospace",
                            fontSize: "10px",
                          }}
                        >
                          {selectedLog.user_id || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedLog.doc_extracted_json && (
                    <div style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "8px",
                          color: "#111827",
                        }}
                      >
                        Extracted Data
                      </div>
                      <div
                        style={{
                          background: "#1f2937",
                          color: "#10b981",
                          padding: "10px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          fontFamily: "monospace",
                          overflowX: "auto",
                        }}
                      >
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                          {JSON.stringify(selectedLog.doc_extracted_json, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedLog.reason && (
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "8px",
                          color: "#111827",
                        }}
                      >
                        Validation Results
                      </div>

                      <div
                        style={{
                          background: "#eff6ff",
                          padding: "10px",
                          borderRadius: "6px",
                          marginBottom: "8px",
                          fontSize: "11px",
                          color: "#1e40af",
                        }}
                      >
                        {selectedLog.reason.score_explanation}
                      </div>

                      {selectedLog.reason.pass_conditions?.length > 0 && (
                        <div style={{ marginBottom: "8px" }}>
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#16a34a",
                              marginBottom: "6px",
                            }}
                          >
                            ✓ Passed Conditions
                          </div>
                          {selectedLog.reason.pass_conditions.map((cond, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: "11px",
                                color: "#166534",
                                background: "#dcfce7",
                                padding: "6px 8px",
                                borderRadius: "4px",
                                marginBottom: "4px",
                              }}
                            >
                              {cond}
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedLog.reason.fail_conditions?.length > 0 && (
                        <div>
                          <div
                            style={{
                              fontSize: "11px",
                              fontWeight: "600",
                              color: "#dc2626",
                              marginBottom: "6px",
                            }}
                          >
                            ✗ Failed Conditions
                          </div>
                          {selectedLog.reason.fail_conditions.map((cond, i) => (
                            <div
                              key={i}
                              style={{
                                fontSize: "11px",
                                color: "#991b1b",
                                background: "#fee2e2",
                                padding: "6px 8px",
                                borderRadius: "4px",
                                marginBottom: "4px",
                              }}
                            >
                              {cond}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedLog.file_input && (
                    <div style={{ marginTop: "16px" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          marginBottom: "8px",
                          color: "#111827",
                        }}
                      >
                        Document
                      </div>

                      {(() => {
                        const fileUrl = selectedLog.file_input.split("?")[0];
                        const fileType = getFileType(fileUrl);

                        if (fileType === "image") {
                          return (
                            <img
                              src={fileUrl}
                              alt="Document"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "320px",
                                objectFit: "contain",
                                borderRadius: "8px",
                                border: "1px solid #e5e7eb",
                              }}
                            />
                          );
                        }

                        if (fileType === "pdf") {
                          return (
                            <div
                              style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: "8px",
                                overflow: "hidden",
                                height: "360px",
                              }}
                            >
                              <iframe
                                src={fileUrl}
                                title="PDF Document"
                                width="100%"
                                height="100%"
                                style={{ border: "none" }}
                              />
                            </div>
                          );
                        }

                        return (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-block",
                              marginTop: "8px",
                              color: "#667eea",
                              fontWeight: "600",
                              fontSize: "12px",
                            }}
                          >
                            Open Document →
                          </a>
                        );
                      })()}

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#6b7280",
                          marginTop: "6px",
                        }}
                      >
                        {selectedLog.file_name || "Document"}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
}