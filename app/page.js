"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts } from "./actions/useractions";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";


export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { success, products, error } = await getProducts();
        if (success) {
          setProducts(products);
        } else {
          setError(error || "Failed to load products");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      }
    }
    fetchProducts();
  }, []);

  // Add this effect to load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 ">
      {/* Navigation */}


      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-16">
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-3">Discover, and Collect <br/> Original Art</h1>
          <p className="text-gray-600 mb-6">A platform where art meets opportunity, heritage meets innovation, and talent meets the world.</p>
          <button onClick={() => {
            document.getElementById('exploreNow').scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }} className="cursor-pointer bg-purple-600 text-white px-6 py-3 rounded-md font-medium">Explore Now</button>
          <div className="flex space-x-10 mt-10">
            <div>
              <div className="text-2xl font-bold">50k+</div>
              <div className="text-gray-600">Artwork</div>
            </div>
            <div>
              <div className="text-2xl font-bold">12k+</div>
              <div className="text-gray-600">Auction</div>
            </div>
            <div>
              <div className="text-2xl font-bold">15k+</div>
              <div className="text-gray-600">Artists</div>
            </div>
          </div>
        </div>
        <div className="md:w-1/2 relative">
          <img
            src="landing1.png"
            alt="creator"
            className="ml-28 w-96 h-80 rounded-lg mb-2"
          />
        </div>
      </div>

      {/* Features */}
      <div className="flex justify-center mb-16">
          <img
            src="landingtext.png"
            
          />
      </div>

      {/* Explore Creators */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Explore Creators</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
          {/* Creator 1 */}
          <div className="flex flex-col items-center">
            <img
              src="creator1.png"
              alt="creator"
              className="w-72 h-60 object-cover rounded-lg mb-2"
            />
            <p className="font-medium text-sm">Traditional Artwork</p>
            <p className="text-gray-500 text-xs">19 items</p>
          </div>
          {/* Creator 2 */}
          <div className="flex flex-col items-center">
            <img
              src="creator2.png"
              alt="creator"
              className="w-72 h-60 object-cover rounded-lg mb-2"
            />
            <p className="font-medium text-sm">Handicrafts</p>
            <p className="text-gray-500 text-xs">25 items</p>
          </div>
          {/* Creator 3 */}
          <div className="flex flex-col items-center">
            <img
              src="creator3.png"
              alt="creator"
              className="w-72 h-60 object-cover rounded-lg mb-2"
            />
            <p className="font-medium text-sm">Pottery</p>
            <p className="text-gray-500 text-xs">8 items</p>
          </div>
        </div>
      </div>

      {/* Explore Art Section */}
      <div className="mb-16" id="exploreNow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Explore Art</h2>
          <div className="flex items-center">
            <button className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm">All Filters</button>
            <div className="hidden md:flex space-x-4 ml-4">
              <button className="text-sm px-3 py-1 rounded-full bg-gray-100">Trending</button>
              <button className="text-sm px-3 py-1 rounded-full">Recent</button>
              <button className="text-sm px-3 py-1 rounded-full">Handmade</button>
              <button className="text-sm px-3 py-1 rounded-full">Anime</button>
              <button className="text-sm px-3 py-1 rounded-full">Vector</button>
              <button className="text-sm px-3 py-1 rounded-full">3D</button>
            </div>
          </div>
        </div>

        {/* NFT Cards */}
        <div className="space-y-6">
          {products.map((product, index) => (
            <ProductCard key={index} product={product} router={router} />
          ))}
        </div>

        {/* Show More Button */}
        <div className="flex justify-center mt-8">
          <button className="border border-purple-600 text-purple-600 px-6 py-2 rounded-full text-sm font-medium">
            Show More
          </button>
        </div>
      </div>
      {/* Footer can be added here */}
    </div>
  );
}

// Separated ProductCard component with its own state
function ProductCard({ product, router }) {
  const [quantity, setQuantity] = useState(1);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleBuyNow = async () => {
    try {
      setIsPaymentLoading(true);

      // Calculate the total amount
      const amount = product.price * quantity;

      // Create an order on the server
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          productId: product._id,
          productName: product.name,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Your Shop Name",
        description: `Purchase of ${product.name} (Qty: ${quantity})`,
        order_id: data.id,
        handler: function (response) {
          // Handle successful payment
          router.push(`/payment/success?orderId=${data.id}&paymentId=${response.razorpay_payment_id}`);
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        notes: {
          productId: product._id,
          quantity: quantity
        },
        theme: {
          color: "#3399cc"
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

      // Handle payment failures
      paymentObject.on('payment.failed', function (response) {
        alert(`Payment failed: ${response.error.description}`);
      });

    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      <div className="relative">
        {/* Main image container with slider */}
        <div className="w-full h-64 relative">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            className="h-full w-full"
          >
            {product.images && product.images.length > 0 ? (
              product.images.map((img, imgIndex) => (
                <SwiperSlide key={imgIndex}>
                  <div className="w-full h-64">
                    <img
                      src={img}
                      alt={`${product.name} - image ${imgIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </SwiperSlide>
              ))
            ) : (
              <SwiperSlide>
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              </SwiperSlide>
            )}
          </Swiper>

          {/* Thumbnail overlay in the bottom left */}
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-md border-2 border-white overflow-hidden shadow-md">
            <img
              src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
              alt={`${product.name} thumbnail`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Price and quantity selector */}
        <div className="absolute bottom-[-45] right-4 bg-white rounded-lg shadow-md p-2 flex items-center space-x-3">
          <div className="text-lg font-bold text-purple-600">
            ₹{product.price?.toLocaleString()}
          </div>

          <div className="flex items-center border border-gray-200 rounded-md">
            <button
              onClick={decreaseQuantity}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
            >
              -
            </button>
            <span className="px-3 py-1 text-gray-800">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
            >
              +
            </button>
          </div>
        </div>

        {/* Title and location bar */}
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
          </div>
          <span className="text-purple-600 text-sm">
            {product.user?.location?.state || "Location not available"}
          </span>
        </div>
      </div>

      {/* Action buttons below the card */}
      <div className="flex mt-2 mb-4 px-4 gap-4">
        <Link href={`/chat/${product.user?._id}`}>
          <button className="text-purple-600 font-medium text-sm bg-purple-50 px-6 py-2 rounded-md hover:bg-purple-100 transition">
            Learn More
          </button>
        </Link>
        <button
          onClick={handleBuyNow}
          disabled={isPaymentLoading}
          className={`text-white font-medium text-sm bg-purple-600 px-6 py-2 rounded-md hover:bg-purple-700 transition ${isPaymentLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
        >
          {isPaymentLoading ? "Processing..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}