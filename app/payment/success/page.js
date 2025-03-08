"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const paymentId = searchParams.get("paymentId");
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // Countdown timer to redirect to home
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push("/");
    }
  }, [countdown, router]);
  
  // Verify the payment on the server (in a real app)
  useEffect(() => {
    async function verifyPayment() {
      if (orderId && paymentId) {
        // Make an API call to verify the payment
        // This is a simplified example - in a real app, you'd need to implement
        // proper verification with Razorpay's signature verification
        try {
          await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, paymentId }),
          });
        } catch (error) {
          console.error('Payment verification error:', error);
        }
      }
    }
    
    verifyPayment();
  }, [orderId, paymentId]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully. Thank you for your purchase!
        </p>
        
        <div className="bg-gray-50 rounded-md p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Order ID:</span>
            <span className="text-gray-800 font-medium">{orderId || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment ID:</span>
            <span className="text-gray-800 font-medium">{paymentId || "N/A"}</span>
          </div>
        </div>
        
        <div className="mb-6 text-sm text-gray-500">
          Redirecting to home in {countdown} seconds...
        </div>
        
        <div className="flex space-x-3 justify-center">
          <Link href="/">
            <button className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Go to Home
            </button>
          </Link>
          
          <Link href="/user/orders">
            <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
              View Orders
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}