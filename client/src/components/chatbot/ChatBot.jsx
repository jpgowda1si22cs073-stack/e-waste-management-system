import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { sendMessage } from './GeminiChatService';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{
        text: "Welcome! I'm here to help you manage and recycle your E-waste with cutting-edge technology and robotics for a cleaner, greener future! How can I help you today?",
        sender: 'ai'
    }]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        const trimmedMessage = inputMessage.trim();
        if (!trimmedMessage) return;

        const userMessage = { text: trimmedMessage, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await sendMessage(trimmedMessage);
            setMessages(prev => [...prev, {
                text: response || "I apologize, but I received an empty response. Please try again.",
                sender: 'ai'
            }]);
        } catch (error) {
            console.error('Message send error:', error);
            setMessages(prev => [...prev, {
                text: "I apologize, but I'm experiencing some difficulties. Please try again.",
                sender: 'ai'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className="w-96 h-[400px] bg-white rounded-2xl shadow-2xl border-2 border-green-100 flex flex-col overflow-hidden">
                    <div className="bg-green-500 text-white p-2 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-lg">EcoCollect</h3>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-green-700 p-1.5 rounded-full transition-colors duration-300"
                            aria-label="Close chat"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, index) => (
                            <div
                                key={`message-${index}`}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl shadow-md ${msg.sender === 'user'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-white text-gray-800 border border-green-100'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white text-gray-500 italic p-3 rounded-2xl border border-green-100">
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center space-x-2">
                        <input
                            type="text"
                            placeholder="Type your question..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="flex-grow p-3 border border-green-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-300"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputMessage.trim()}
                            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}

            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 rounded-full hover:scale-105 transition-all duration-300 group"
                    aria-label="Open chat"
                >
                    <MessageCircle className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                </button>
            )}
        </div>
    );
};

export default ChatBot;