import { useEffect, useState } from "react";
import { widgetStore } from "./widget/store";

export default function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    widgetStore.subscribe(setTasks);
  }, []);

  const latest = tasks[0];

  return (
    <>
      {/* Bottom Left */}
      <div style={leftStyle}>
        {latest ? (
          <>
            <div>{latest.type}</div>
            <strong>{latest.status}</strong>
          </>
        ) : (
          <strong>IDLE</strong>
        )}
      </div>

      {/* Bottom Right */}
      <div style={rightStyle}>
        <strong>History</strong>
        {tasks.length === 0 && (
          <div style={{ fontSize: "12px" }}>No requests yet</div>
        )}
        {tasks.map(t => (
          <div key={t.id} style={taskStyle}>
            {t.type} — {t.status}
          </div>
        ))}
      </div>
    </>
  );
}

const leftStyle = {
  position: "fixed",
  bottom: "20px",
  left: "20px",
  width: "60px",
  height: "60px",
  background: "#111",
  color: "#fff",
  borderRadius: "50%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "10px"
};

const rightStyle = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  width: "200px",
  background: "#fff",
  border: "1px solid #ddd",
  padding: "10px",
  fontSize: "12px"
};

const taskStyle = {
  marginTop: "6px"
};
