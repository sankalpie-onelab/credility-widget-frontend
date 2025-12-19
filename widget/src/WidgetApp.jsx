import { useEffect, useState } from "react";

export default function WidgetApp({ store }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    store.subscribe(setTasks);
  }, []);

  const latest = tasks[0];

  return (
    <>
      {/* Bottom Left - Current */}
      {latest && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          left: "20px",
          width: "70px",
          height: "70px",
          borderRadius: "50%",
          background:
            latest.status === "PASS" ? "#16a34a" :
            latest.status === "FAIL" ? "#dc2626" :
            "#111",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px"
        }}>
          <strong>{latest.status}</strong>
          {latest.score !== null && <span>{latest.score}</span>}
        </div>
      )}

      {/* Bottom Right - History */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        background: "#fff",
        border: "1px solid #ddd",
        padding: "10px",
        width: "260px",
        maxHeight: "300px",
        overflow: "auto",
        fontSize: "12px"
      }}>
        <strong>Aadhaar History</strong>

        {tasks.length === 0 && <div>No requests yet</div>}

        {tasks.map(t => (
          <div key={t.id} style={{ marginTop: "8px" }}>
            <div><strong>{t.status}</strong> — Score {t.score}</div>
            <div style={{ color: "#666" }}>
              {t.response?.file_name}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
