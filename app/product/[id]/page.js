"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/app/actions/useractions";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchProductDetails() {
      try {
        setLoading(true);
        const { success, product, error } = await getProductById(id);
        
        if (success && product) {
          setProduct(product);
        } else {
          setError(error || "Failed to load product details");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchProductDetails();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-xl mb-4">Error: {error}</div>
        <button 
          onClick={() => router.back()}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-gray-500 text-xl mb-4">Product not found</div>
        <Link href="/">
          <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md">
            Return to Home
          </button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Product images gallery */}
          <div className="md:w-1/2">
            {product.images && product.images.length > 0 ? (
              <div className="relative h-80 md:h-full">
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                
                {/* If there are more images, show thumbnails */}
                {product.images.length > 1 && (
                  <div className="flex overflow-x-auto p-2 bg-gray-100">
                    {product.images.map((image, index) => (
                      <div key={index} className="flex-shrink-0 mr-2 w-16 h-16">
                        <img 
                          src={image} 
                          alt={`${product.name} thumbnail ${index+1}`} 
                          className="w-full h-full object-cover rounded border-2 border-transparent hover:border-blue-500 cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-80 bg-gray-200 flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>
          
          {/* Product details */}
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <p className="text-2xl font-bold text-blue-900">₹{product.price.toLocaleString()}</p>
            </div>
            
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-700">
                {product.user?.location?.state 
                  ? `${product.user.location.village}, ${product.user.location.district}, ${product.user.location.state}, ${product.user.location.pincode}`
                  : "Location not available"}
              </span>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <div className="text-gray-700 whitespace-pre-line">
                {product.description}
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Contact Seller</h2>
              {product.user?.contactDetails?.phone ? (
                <div className="flex items-center text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  {product.user.contactDetails.phone}
                </div>
              ) : (
                <p className="text-gray-500">Contact information not available</p>
              )}
            </div>
            
            <div className="mt-8">
              <button
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-md cursor-not-allowed opacity-70"
                disabled
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}