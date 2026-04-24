import PageContainer from "../components/PageContainer";

import { useState, useEffect } from "react";

function UpdatePage() {
  const caseTypes = [
    "Allocation of Parental Responsibilities",
    "Child Support",
    "Civil Orders of Protection",
    "Dissolution of Marriage",
    "Division of Financial and Property Assets in Dissolution Proceedings",
    "Invalidity of Marriage or Civil Union",
    "Legal Separation",
    "Parentage",
    "Parenting Time",
    "Third-Party Visitation",
  ];

  const [selectedCase, setSelectedCase] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedCase || !text.trim()) return;

    const newUpdate = {
      id: Date.now(),
      caseType: selectedCase,
      content: text,
      date: new Date().toLocaleString(),
    };

    // Get existing updates
    const existing =
      JSON.parse(localStorage.getItem("updates")) || [];

    // Save new one
    localStorage.setItem(
      "updates",
      JSON.stringify([...existing, newUpdate])
    );

    // Reset form
    setSelectedCase("");
    setText("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  return (
    <PageContainer>
    <div>
    <h1 style={{ marginBottom: 0 }}>Updates</h1>
    <h2>
        Help us keep our system updated by submitting a ticket below.
      </h2>
    

    <div style={{ display: "flex", justifyContent: "center"}}>
      <div
        style={{
          width: "100%",
          maxWidth: "75%",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          background: "#ffffff",
        }}
      >

        {/* Case Type Selection */}
        <div style={{ marginTop: 0 }}>
          <h4 style={{ marginTop: 0 }}>Select Case Type</h4>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 10,
            }}
          >
            {caseTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedCase(type)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border:
                    selectedCase === type
                      ? "2px solid #318aa0"
                      : "1px solid #ccc",
                  background:
                    selectedCase === type
                      ? "#e6f4f7"
                      : "#f9f9f9",
                  cursor: "pointer",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        

        {/* Text Input */}
        <div style={{ marginTop: 30 }}>
          <h4>Describe the update</h4>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            style={{
              width: "95%",
              padding: 12,
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              resize: "vertical",
            }}
            placeholder="Enter update details here..."
          />
        </div>

        {/* Submit */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            onClick={handleSubmit}
            disabled={!selectedCase || !text.trim()}
            style={{
              padding: "10px 24px",
              fontSize: 16,
              borderRadius: 8,
              border: "none",
              background:
                !selectedCase || !text.trim()
                  ? "#ccc"
                  : "#318aa0",
              color: "white",
              cursor:
                !selectedCase || !text.trim()
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Submit
          </button>
        </div>

        {submitted && (
          <p style={{ color: "green", marginTop: 15 }}>
            Update saved!
          </p>
        )}
      </div>
    </div>
    </div>
    </PageContainer>
  );
}

export default UpdatePage;