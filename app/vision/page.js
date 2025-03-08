"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";


export default function AnalyzePage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImage(reader.result);
        setResult(""); // Clear previous results
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-8 sm:p-10">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Image Analysis
          </h1>
          
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="flex flex-col items-center">
              <div 
                onClick={() => fileInputRef.current.click()}
                className={`w-full max-w-md h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300  $ {
                  image ? "border-indigo-300 bg-indigo-50" : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                }`}
              >
                {image ? (
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={image} 
                    alt="Uploaded" 
                    className="h-full w-full object-contain rounded-lg p-2" 
                  />
                ) : (
                  <div className="text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">Click to upload an image</p>
                    <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {image && (
                <button
                  onClick={() => {
                    setImage(null);
                    setResult("");
                  }}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Remove image
                </button>
              )}
            </div>
            
            {/* Action Button */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={analyzeImage}
                disabled={!image || loading}
                className={`px-8 py-3 rounded-full font-medium text-black shadow-md transition-all  $ {
                  !image || loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg"
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </div>
                ) : (
                  "Analyze Image"
                )}
              </motion.button>
            </div>
            
            {/* Results Section */}
            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-indigo-50 p-6 rounded-xl border border-indigo-100"
              >
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Analysis Results</h3>
                <p className="text-gray-700 whitespace-pre-line">{result}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      
      <p className="text-center text-gray-500 text-sm mt-8">
        Upload an image to analyze its content using AI
      </p>
    </div>
  );
}