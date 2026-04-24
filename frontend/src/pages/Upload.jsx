import PageContainer from "../components/PageContainer";

import { useState, useMemo } from "react";
import { uploadFile } from "../services/api";

function UploadPage() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(null);
  // const fields = extracted
  // ? [
  //     { label: "Date", value: extracted.date },
  //     { label: "Courthouse", value: extracted.courthouse },
  //     { label: "Courtroom", value: extracted.courtroom },
  //     { label: "Judge", value: extracted.judge },
  //     { label: "Judge info",
  //       value: extracted.link ? (
  //         <a
  //           href={extracted.link}
  //           target="_blank"
  //           rel="noopener noreferrer"
  //         >
  //           Link
  //         </a>
  //       ) : null,
  //     },
  //   ]
  // : [];
  // const hasAnyInfo = extracted &&
  // (extracted.courthouse ||
  //   extracted.courtroom ||
  //   extracted.judge ||
  //   extracted.date);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setStatus("");
    setExtracted(null); // reset
    setText(null);
  };

  const handleUpload = async () => {
  if (!file) {
    setStatus("Please select a file first.");
    return;
  }

  setLoading(true);
  setStatus("Uploading and extracting...");

  try {
    const data = await uploadFile(file);

    if (data.success) {
      setExtracted(data.info);
      setStatus("Information extracted");
    } else {
      setStatus("Extraction failed.");
    }
  } catch (err) {
    console.error(err);
    setStatus("Upload failed.");
  }

  setLoading(false);
};

  const renderPreview = () => {
    if (!file) return null;

    const type = file.type;

    // 🖼️ image preview
    if (type.startsWith("image/")) {
      return (
        <img
          src={previewUrl}
          alt="preview"
          style={{
            maxWidth: 300,
            maxHeight: 300,
            marginTop: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
      );
    }

    // 📄 pdf preview
    if (type === "application/pdf") {
      return (
        <iframe
          src={previewUrl}
          title="pdf-preview"
          style={{
            width: "100%",
            maxWidth: "70%",
            height: 600,
            marginTop: 12,
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
        />
      );
    }

    return (
      <p style={{ marginTop: 12 }}>
        Preview not available for this file type.
      </p>
    );
  };

  return (
    <PageContainer>
    <div>
      <h1>Upload File</h1>
      <h2>Upload your files to start and see what we can do to help!</h2>
      <label
        style={{
          display: "inline-block",
          padding: "12px 20px",
          fontSize: 18,
          background: "#e5effd",
          borderRadius: 8,
          cursor: "pointer",
          border: "1px solid #ccc",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        }}
      >
        Choose File
        <input
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.txt"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </label>

      {file && (
        <p style={{ marginTop: 10 }}>
          Selected: <b>{file.name}</b>
        </p>
      )}

      {/* Preview */}
      {renderPreview()}

      {file && (
        <div style={{ marginTop: 16 }}>
        <button onClick={handleUpload} disabled={loading}>
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>
      )}

      {status && <p style={{ marginTop: 10 }}>{status}</p>}

    </div>
    </PageContainer>
  );
}

export default UploadPage;