"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSellerById } from "../../actions/useractions";
import { FaCamera } from "react-icons/fa";

export default function SellerChat() {
  const params = useParams();
  const router = useRouter();
  const { sellerId } = params;
  
  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`chat_${sellerId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chatWindowRef = useRef(null);
  const typingIntervalRef = useRef(null);
  
  // Save chat history
  useEffect(() => {
    if (typeof window !== "undefined" && sellerId) {
      localStorage.setItem(`chat_${sellerId}`, JSON.stringify(messages));
    }
  }, [messages, sellerId]);
  
  // Clean up typing interval
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);
  
  // Fetch seller information
  useEffect(() => {
    async function fetchSellerDetails() {
      if (!sellerId) return;
      
      try {
        setLoading(true);
        const { success, seller, error } = await getSellerById(sellerId);
        
        if (success && seller) {
          setSeller(seller);
          
          // Add a welcome message if this is a new chat
          if (messages.length === 0) {
            setMessages([{
              sender: "bot",
              text: `Hi ${seller.name} here, Wassup !`
            }]);
          }
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
  
  // Scroll handling
  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow) return;
    chatWindow.addEventListener("scroll", handleScroll);
    return () => chatWindow.removeEventListener("scroll", handleScroll);
  }, []);
  
  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow || messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.sender === "bot" && !userScrolled) {
      chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: "auto",
      });
    }
  }, [messages, userScrolled]);
  
  const handleScroll = () => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow) return;
    const isAtBottom =
      Math.abs(chatWindow.scrollHeight - chatWindow.clientHeight - chatWindow.scrollTop) < 10;
    setUserScrolled(!isAtBottom);
  };
  
  const clearHistory = () => {
    setMessages([{
      sender: "bot",
      text: `Hi ${seller.name} here, wassup`
    }]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(`chat_${sellerId}`);
    }
  };
  
  const stopGeneration = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
      setIsTyping(false);
    }
  };
  
  const sendMessage = async () => {
    if (!input.trim() || isTyping || !seller) return;
    
    const userMessage = { sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    setUserScrolled(false);
    
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      chatWindow.scrollTo({
        top: chatWindow.scrollHeight,
        behavior: "smooth",
      });
    }
    
    const conversation = updatedMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          messages: conversation, 
          sellerInfo: seller 
        }),
      });
      
      const data = await res.json();
      
      if (data.result) {
        simulateTyping(data.result);
      } else {
        setMessages((prev) => [...prev, { 
          sender: "bot", 
          text: "I apologize, but I'm having trouble connecting right now. Please try again later or contact me directly." 
        }]);
        setIsTyping(false);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { 
        sender: "bot", 
        text: "Sorry, there was an error. Please try again or contact me directly via phone." 
      }]);
      setIsTyping(false);
    }
  };
  
  const simulateTyping = (text) => {
    let index = 0;
    let typedText = "";
    setMessages((prev) => [...prev, { sender: "bot", text: "" }]);
    typingIntervalRef.current = setInterval(() => {
      if (index >= text.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
        setIsTyping(false);
        return;
      }
      typedText += text[index];
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].text = typedText;
        return newMessages;
      });
      index++;
    }, 20);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isTyping) sendMessage();
  };
  
  const scrollToBottom = () => {
    const chatWindow = chatWindowRef.current;
    if (!chatWindow) return;
    chatWindow.scrollTo({
      top: chatWindow.scrollHeight,
      behavior: "smooth",
    });
    setUserScrolled(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center  text-white p-4">
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
    
    <div className="flex flex-col min-h-[90%]">
          
      
      {/* Header */}
      <div className="flex items-center justify-between p-2 mb-0 m-4  rounded-b-none rounded-md bg-[#F5F5F5] text-gray-900">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <div>
              <h1 className="text-lg font-medium text-gray-900">Chat with {seller.name}</h1>
              <p className="text-xs text-gray-400">{seller.profession} • {seller.experience} yrs exp</p>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-5">
          <Link href={`/vision/${sellerId}`}><div className="cursor-pointer">

          <FaCamera/>
          </div></Link>
        <button
          onClick={clearHistory}
          className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-all duration-200 flex items-center space-x-1"
          >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
          <span>Clear Chat</span>
          </div>
        </button>
          </div>
      </div>
      
      {/* Chat Window */}
      <div
        ref={chatWindowRef}
        className="relative flex-1  no-scrollbar overflow-y-auto p-6 space-y-6 my-0 m-4 rounded-b-md bg-[#F5F5F5]"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-center font-medium">Start chatting with {seller.name}</p>
            <p className="text-sm text-center mt-1">Ask about their skills, experience, or services</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xl p-4 rounded-md shadow-md ${
                msg.sender === "user"
                  ? " bg-[#F5F5F5] text-black rounded-br-none"
                  : "bg-gray-800 text-white rounded-bl-none border border-gray-700"
              }`}
            >
              <p className="leading-relaxed">
                {msg.text}
              </p>
              <div className={`mt-2 text-xs flex items-center ${msg.sender === "user" ? "text-blue-200" : "text-gray-400"}`}>
                {msg.sender === "user" ? (
                  <>
                    <span>You</span>
                    <span className="ml-1 text-xs">•</span>
                    <span className="ml-1 text-xs">Just now</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-white text-xs mr-1.5">{seller.name.charAt(0)}</div>
                    <span>{seller.name}</span>
                    <span className="ml-1 text-xs">•</span>
                    <span className="ml-1 text-xs">Just now</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex items-center justify-between text-gray-400">
            <div className="w-full h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">{seller.name.charAt(0)}</div>
            <div className="flex space-x-1bg-[#F5F5F5] px-4 py-2 rounded-full shadow-md">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        
        {userScrolled && messages.length > 0 && (
          <button 
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4  text-white rounded-full p-2 shadow-lg transition-opacity duration-200 opacity-80 hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Input Area */}
      <div className=" m-4 rounded-md bg-[#F5F5F5]">
        <div className="flex items-center  gap-3 w-full mx-0">
          <div className="relative flex-1 ">
            <input
              type="text"
              placeholder={`Ask ${seller.name} a question...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              className="w-full p-4  bg-[#F5F5F5]   text-black placeholder-gray-400 focus:outline-none  focus:border-transparent transition-all duration-200 disabled:opacity-70"
            />
            {!isTyping && input.trim() && (
              <button
                onClick={sendMessage}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center focus:outline-none hover:shadow-md transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          
        
        </div>
      </div>
    </div>
  );
}