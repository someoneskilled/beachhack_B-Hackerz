"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { getPrompt } from "../actions/useractions";

export default function Chatbot() {
  const [messages, setMessages] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chatHistory");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userScrolled, setUserScrolled] = useState(false);
  const chatWindowRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const { user, isLoaded } = useUser();
  const userId = user?.id;
  const [initialPrompt, setInitialPrompt] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatHistory", JSON.stringify(messages));
    }
  }, [messages]);

  const clearHistory = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("chatHistory");
    }
  };

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchInitialPrompt = async () => {
      if (userId) {
        const { success, prompt, error } = await getPrompt(userId);
        if (success) {
          setInitialPrompt(prompt);
        } else {
          console.error("Error fetching initial prompt:", error);
        }
      }
    };
    fetchInitialPrompt();
  }, [userId]);

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

  const stopGeneration = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
      setIsTyping(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
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
      const res = await fetch("/api/groq/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation, initialPrompt }),
      });
      const data = await res.json();
      if (data.result) {
        simulateTyping(data.result);
      } else {
        setMessages((prev) => [...prev, { sender: "bot", text: "No response" }]);
        setIsTyping(false);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error" }]);
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

  return (
    <div className="flex flex-col h-screen  text-gray-900 font-sans">
            <nav className="flex items-center p-4 justify-between ">
              <div className="font-bold text-xl">Arthouse</div>
              <div className="flex space-x-8">
                <div className="font-medium">Marketplace</div>
                <div className="font-medium">Auctions</div>
                <div className="font-medium">Feed</div>
              </div>
              <div className="flex space-x-3">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-md font-medium">Log in</button>
                <Link href="/signup">
                  <button className="border  px-4 py-2 rounded-md font-medium">Sign up</button>
                </Link>
              </div>
            </nav>
      <div className="flex items-center justify-between rounded-md p-2 m-4 bg-gray-300">
        <Link href="/home">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gray-900 bg-clip-text text-transparent">ChatAI</h1>
          </div>
        </Link>
        <button
          onClick={clearHistory}
          className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 transition-all duration-200 flex items-center space-x-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Clear Chat</span>
        </button>
      </div>
      <div
        ref={chatWindowRef}
        className="relative flex-1 overflow-y-auto p-2 m-4 rounded-md space-y-6 bg-gray-300"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-center font-medium">Start chatting with ChatAI</p>
            <p className="text-sm text-center mt-1">Ask anything or get information</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xl p-4 rounded-2xl shadow-md ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-br-none"
                  : "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700"
              }`}
            >
              <p className={`leading-relaxed ${msg.sender === "user" ? "text-white" : "text-gray-200"}`}
                 style={{ lineHeight: "1.6", letterSpacing: "0.01em" }}>
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
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs mr-1.5">AI</div>
                    <span>ChatAI</span>
                    <span className="ml-1 text-xs">•</span>
                    <span className="ml-1 text-xs">Just now</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-400">
            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs">AI</div>
            <div className="flex space-x-1 bg-gray-800 px-4 py-2 rounded-full shadow-md">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        
        {userScrolled && messages.length > 0 && (
          <button 
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-opacity duration-200 opacity-80 hover:opacity-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              className="w-full p-4 pr-12 rounded-full bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-70"
              style={{ fontFamily: "'Open Sans', 'Arial', sans-serif", letterSpacing: "0.01em" }}
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
          {isTyping ? (
            <button
              onClick={stopGeneration}
              className="px-6 py-4 font-medium rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-sm hover:shadow flex items-center space-x-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className={`px-6 py-4 font-medium rounded-full flex items-center space-x-1 shadow-sm transition-all duration-200 ${
                input.trim() 
                  ? "bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:shadow" 
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>Send</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}