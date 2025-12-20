import { useEffect, useState } from "react";

export default function InlineWidget({ store }) {
    const [task, setTask] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const updateTask = (tasks) => {
            if (!tasks || tasks.length === 0) {
                setTask(null);
                return;
            }
            setTask({ ...tasks[0] });
        };

        const unsubscribe = store.subscribe(updateTask);
        return () => unsubscribe();
    }, [store]);

    const isRunning = task?.status === "RUNNING";
    const isPassed = task?.status === "PASS";
    const isFailed = task?.status === "FAIL";
    const isError = task?.status === "ERROR";

    // Get reason data from response (similar to WidgetApp.jsx)
    const reason = task?.response?.reason;

    const icons = {
        idle: "🤖",
        loading: "⏳",
        pass: "✅",
        fail: "❌",
        error: "⚠️"
    };

    const icon = !task
        ? icons.idle
        : isRunning
        ? icons.loading
        : isPassed
        ? icons.pass
        : isFailed
        ? icons.fail
        : isError
        ? icons.error
        : icons.idle;

    const bgColor = isPassed
        ? "#d1fae5"
        : isFailed
        ? "#fee2e2"
        : isError
        ? "#fef3c7"
        : "#e5e7eb";

    const borderColor = isPassed
        ? "#10b981"
        : isFailed
        ? "#ef4444"
        : isError
        ? "#f59e0b"
        : "#9ca3af";

    const handleClick = (e) => {
        if (reason && (isPassed || isFailed)) {
            e.stopPropagation();
            setShowModal(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };

    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && showModal) {
                setShowModal(false);
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [showModal]);

    return (
        <>
            <div
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: `2px solid ${borderColor}`,
                    background: bgColor,
                    fontFamily: "monospace",
                    fontSize: "13px",
                    cursor: reason && (isPassed || isFailed) ? "pointer" : "default",
                    userSelect: "none",
                    boxShadow: "0 1px 0 #00000040",
                    minWidth: "140px",
                    position: "relative",
                    transition: "transform 0.2s, box-shadow 0.2s"
                }}
                onClick={handleClick}
                onMouseEnter={(e) => {
                    if (reason && (isPassed || isFailed)) {
                        e.currentTarget.style.transform = "scale(1.02)";
                        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 1px 0 #00000040";
                }}
            >
                <span style={{ fontSize: "14px" }}>{icon}</span>

                <span>
                    {!task
                        ? "Idle"
                        : isRunning
                        ? "Validating..."
                        : isPassed
                        ? "Passed"
                        : isFailed
                        ? "Failed"
                        : isError
                        ? "Error"
                        : "Idle"}
                </span>
                
                {task?.fileName && (
                    <span style={{ 
                        fontSize: "11px", 
                        color: "#666",
                        marginLeft: "auto",
                        maxWidth: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                    }}>
                        {task.fileName}
                    </span>
                )}
            </div>

            {/* Modal Popup */}
            {showModal && reason && (isPassed || isFailed) && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10000,
                        padding: "20px",
                        animation: "fadeIn 0.2s ease-out"
                    }}
                    onClick={handleBackdropClick}
                >
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: "16px",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                            width: "100%",
                            maxWidth: "500px",
                            maxHeight: "80vh",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            animation: "slideUp 0.3s ease-out",
                            border: "1px solid #e5e7eb"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div
                            style={{
                                padding: "20px",
                                background: isPassed 
                                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                    : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                color: "#fff",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontSize: "20px" }}>
                                    {isPassed ? "✅" : "❌"}
                                </span>
                                <div>
                                    <strong style={{ fontSize: "18px", display: "block" }}>
                                        Validation {isPassed ? "Passed" : "Failed"}
                                    </strong>
                                    {task?.score !== null && (
                                        <span style={{ fontSize: "13px", opacity: 0.9 }}>
                                            Score: {task.score}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                style={{
                                    background: "rgba(255,255,255,0.2)",
                                    border: "none",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: "24px",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    width: "32px",
                                    height: "32px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "background 0.2s"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.3)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: "auto",
                                padding: "20px",
                                fontSize: "13px"
                            }}
                        >
                            {/* Score Explanation */}
                            {reason.score_explanation && (
                                <div
                                    style={{
                                        background: "#eff6ff",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        marginBottom: "16px",
                                        fontSize: "12px",
                                        color: "#1e40af",
                                        lineHeight: "1.5"
                                    }}
                                >
                                    {reason.score_explanation}
                                </div>
                            )}

                            {/* Pass Conditions */}
                            {reason.pass_conditions && reason.pass_conditions.length > 0 && (
                                <div style={{ marginBottom: "16px" }}>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#16a34a",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        ✓ Passed Conditions
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {reason.pass_conditions.map((cond, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#166534",
                                                    background: "#dcfce7",
                                                    padding: "8px 12px",
                                                    borderRadius: "6px",
                                                }}
                                            >
                                                {cond}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fail Conditions */}
                            {reason.fail_conditions && reason.fail_conditions.length > 0 && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            color: "#dc2626",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        ✗ Failed Conditions
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                        {reason.fail_conditions.map((cond, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#991b1b",
                                                    background: "#fee2e2",
                                                    padding: "8px 12px",
                                                    borderRadius: "6px",
                                                }}
                                            >
                                                {cond}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    @keyframes slideUp {
                        from {
                            transform: translateY(20px);
                            opacity: 0;
                        }
                        to {
                            transform: translateY(0);
                            opacity: 1;
                        }
                    }
                `}
            </style>
        </>
    );
}