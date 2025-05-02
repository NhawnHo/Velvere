import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';

const ChatWidget: React.FC = () => {
    const { 
        isChatOpen, 
        toggleChat, 
        messages, 
        sendMessage, 
        closeChat,
        unreadCount 
    } = useChat();
    
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        
        try {
            // Lưu tin nhắn vào biến tạm để trả về UI ngay lập tức
            const tempMessage = inputValue;
            // Xóa input trước khi gửi để tránh gửi lại nếu người dùng nhấn nút nhiều lần
            setInputValue('');
            
            await sendMessage(tempMessage);
            
            // Cuộn xuống sau khi gửi
            setTimeout(scrollToBottom, 100);
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
            alert('Không thể gửi tin nhắn. Vui lòng thử lại sau.');
        }
    };
    
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return (
        <div className="fixed bottom-5 right-5 z-50">
            {/* Chat Button */}
            <button
                onClick={toggleChat}
                className="bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition relative flex items-center justify-center"
            >
                {!isChatOpen ? (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </button>
            
            {/* Chat Window */}
            {isChatOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-black text-white p-3 flex justify-between items-center">
                        <h3 className="font-semibold">Hỗ trợ trực tuyến</h3>
                        <div className="flex">
                            <button 
                                onClick={closeChat}
                                className="text-gray-300 hover:text-white mx-1"
                                title="Kết thúc cuộc trò chuyện"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                </svg>
                            </button>
                            <button 
                                onClick={toggleChat}
                                className="text-gray-300 hover:text-white ml-1"
                                title="Đóng cửa sổ chat"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    {/* Messages */}
                    <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-4">
                                <p>Bắt đầu cuộc trò chuyện với chúng tôi</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`mb-3 max-w-3/4 ${
                                        msg.sender_type === 'user'
                                            ? 'ml-auto text-right'
                                            : ''
                                    }`}
                                >
                                    <div
                                        className={`inline-block rounded-lg px-3 py-2 ${
                                            msg.sender_type === 'user'
                                                ? 'bg-black text-white'
                                                : msg.sender_type === 'system'
                                                ? 'bg-gray-200 text-gray-800'
                                                : 'bg-gray-300 text-gray-800'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {msg.createdAt && formatTime(msg.createdAt)}
                                    </p>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    
                    {/* Input form */}
                    <form onSubmit={handleSubmit} className="p-3 border-t">
                        <div className="flex">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                            />
                            <button
                                type="submit"
                                className="bg-black text-white rounded-r-lg px-4 py-2 hover:bg-gray-800 transition"
                                disabled={!inputValue.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;