export async function callValidationAgent(file, agentId) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", "dev123");

  const res = await fetch(
    `http://localhost:8000/api/agent/${agentId}/validate`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!res.ok) {
    throw new Error("Validation failed");
  }

  return res.json();
}

export async function fetchAgentStats(agentId) {
  const res = await fetch(
    `http://localhost:8000/api/agent/${agentId}/stats`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }

  return res.json();
}