// pages/analyze.js
"use client";

import { useState } from "react";

export default function AnalyzePage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImage(reader.result);
      };
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });
      
      const data = await response.json();
      setResult(data.text || "No analysis result.");
    } catch (error) {
      setResult("Error analyzing image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      <input type="file" accept="image/*" onChange={handleImageUpload} className="mb-4" />
      {image && <img src={image} alt="Uploaded" className="w-64 h-64 object-cover mb-4" />}
      <button
        onClick={analyzeImage}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? "Analyzing..." : "Analyze Image"}
      </button>
      {result && <p className="mt-4">{result}</p>}
    </div>
  );
}