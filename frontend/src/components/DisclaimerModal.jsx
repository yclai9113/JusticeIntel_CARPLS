import { useState, useEffect } from "react";

function DisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("disclaimerShown");
    if (!shown) {
      setOpen(true);
    }
  }, []);

  const handleConfirm = () => {
    sessionStorage.setItem("disclaimerShown", "true");
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: 30,
          borderRadius: 12,
          maxWidth: 600,
          width: "90%",
          textAlign: "center",
          boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h2>Legal Disclaimer</h2>
        <p style={{ marginTop: 10 }}>
          This tool provides general information, not legal advice.
        </p>
        <p> 
          Please consult a qualified attorney for advice regarding your situation.
        </p>

        <button
          onClick={handleConfirm}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            fontSize: 16,
            borderRadius: 8,
            cursor: "pointer",
            background: "#c7c6c6af",
          }}
        >
          I Understand
        </button>
      </div>
    </div>
  );
}

export default DisclaimerModal;