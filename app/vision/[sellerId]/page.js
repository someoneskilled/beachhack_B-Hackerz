"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSellerById } from "@/app/actions/useractions";
import { FaArrowLeft } from "react-icons/fa";

export default function SellerVision() {
  const params = useParams();
  const router = useRouter();
  const { sellerId } = params;
  
  const [image, setImage] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [seller, setSeller] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch seller information
  useEffect(() => {
    async function fetchSellerDetails() {
      if (!sellerId) return;
      
      try {
        setLoading(true);
        const { success, seller, error } = await getSellerById(sellerId);
        
        if (success && seller) {
          setSeller(seller);
        } else {
          setError(error || "Failed to load seller information");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSellerDetails();
  }, [sellerId]);

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
    if (!image || !seller) return;
    setAnalyzing(true);
    setResult("");

    try {
      // Send the request with image as base64 and seller info
      const response = await fetch("/api/vision", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: image,
          sellerId: sellerId,
          sellerInfo: seller
        }),
      });
      
      const data = await response.json();
      setResult(data.text || "No analysis result.");
    } catch (error) {
      console.error("Error analyzing image:", error);
      setResult("Error analyzing image. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white p-4">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button 
          onClick={() => router.back()}
          className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!seller) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-gray-400 text-xl mb-4">Seller not found</div>
        <Link href="/">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md">
            Return to Home
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-6">
        <Link href={`/chat/${sellerId}`}>
          <button className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
            <FaArrowLeft className="mr-2" />
            <span>Back to chat with {seller.name}</span>
          </button>
        </Link>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="px-6 py-8 sm:p-10">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Show the Art
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Share an image with {seller.name} for expert analysis
          </p>
          
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
                disabled={!image || analyzing}
                className={`px-8 py-3 rounded-full font-medium text-black shadow-md transition-all  $ {
                  !image || analyzing ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg"
                }`}
              >
                {analyzing ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </div>
                ) : (
                  `Ask  ${seller.name} to review this`
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
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm mr-2">
                    {seller.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-semibold text-indigo-800">{seller.name}'s Analysis</h3>
                </div>
                <p className="text-gray-700 whitespace-pre-line">{result}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
      
      <p className="text-center text-gray-500 text-sm mt-8">
        Upload an image to get expert analysis from {seller.name}
      </p>
    </div>
  );
}