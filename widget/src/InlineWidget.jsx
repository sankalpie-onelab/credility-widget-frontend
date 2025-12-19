import { useEffect, useState } from "react";

export default function InlineWidget({ store }) {
    const [task, setTask] = useState(null);

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

    // ICONS
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

    return (
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
                cursor: "default",
                userSelect: "none",
                boxShadow: "0 1px 0 #00000040",
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
        </div>
    );
}
