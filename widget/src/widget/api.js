export async function callAadhaarAgent(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", "dev123");

  const res = await fetch(
    "http://localhost:8000/api/agent/aadhar_card_validator_s5/validate",
    {
      method: "POST",
      body: formData
    }
  );

  if (!res.ok) {
    throw new Error("Aadhaar validation failed");
  }

  return res.json();
}

export async function fetchAadhaarStats() {
  const res = await fetch(
    "http://localhost:8000/api/agent/aadhar_card_validator_s5/stats"
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Aadhaar stats");
  }

  return res.json();
}
