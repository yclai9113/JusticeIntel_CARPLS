// Handles API calls to backend

// const SSH_SERVER = "http://localhost:8000";

export async function sendMessage(message) {
  const session_id = localStorage.getItem("session_id");
  // const response = await fetch(`${SSH_SERVER}/chat`, {
  const response = await fetch(`/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ 
      message,
      session_id,
    }),
  });

  if (!response.ok) {
    throw new Error("Backend not reachable");
  }

  return response.json();
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();

  if (data.session_id) {
    localStorage.setItem("session_id", data.session_id);
  }

  return data;
}