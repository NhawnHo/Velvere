import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface ChatMessage {
    _id: string;
    session_id: string;
    user_id?: string;
    sender_type: 'user' | 'admin' | 'system';
    message: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ChatSession {
    _id: string;
    user_id?: string;
    user_name: string;
    user_email?: string;
    status: 'active' | 'closed';
    last_message: string;
    assigned_admin?: string;
    createdAt: string;
    updatedAt: string;
}

const AdminChat: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [replyText, setReplyText] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'active' | 'closed' | 'all'>('active');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Tải danh sách phiên chat
    useEffect(() => {
        fetchSessions();
        // Tải lại danh sách phiên chat mỗi 30 giây
        const intervalId = setInterval(fetchSessions, 30000);
        return () => clearInterval(intervalId);
    }, [statusFilter]);

    // Tự động cuộn xuống tin nhắn mới nhất
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Tải tin nhắn khi chọn phiên chat
    useEffect(() => {
        if (selectedSession) {
            fetchMessages(selectedSession._id);
            // Tải lại tin nhắn mỗi 5 giây
            const intervalId = setInterval(() => fetchMessages(selectedSession._id), 5000);
            return () => clearInterval(intervalId);
        }
    }, [selectedSession]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const url = statusFilter === 'all' 
                ? 'http://localhost:3000/api/chat/sessions' 
                : `http://localhost:3000/api/chat/sessions?status=${statusFilter}`;
            
            const response = await axios.get(url);
            setSessions(response.data);
        } catch (error) {
            console.error('Lỗi khi tải danh sách phiên chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (sessionId: string) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/chat/sessions/${sessionId}/messages`);
            setMessages(response.data);
            
            // Đánh dấu tin nhắn là đã đọc
            await axios.patch(`http://localhost:3000/api/chat/sessions/${sessionId}/read`, {
                sender_type: 'admin'
            });
        } catch (error) {
            console.error('Lỗi khi tải tin nhắn:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSelectSession = (session: ChatSession) => {
        setSelectedSession(session);
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim() || !selectedSession) return;

        try {
            const response = await axios.post('http://localhost:3000/api/chat/messages', {
                session_id: selectedSession._id,
                sender_type: 'admin',
                message: replyText
            });

            // Thêm tin nhắn mới vào danh sách
            setMessages(prev => [...prev, response.data.chatMessage]);
            setReplyText('');
        } catch (error) {
            console.error('Lỗi khi gửi tin nhắn:', error);
        }
    };

    const handleCloseSession = async () => {
        if (!selectedSession) return;

        try {
            await axios.patch(`http://localhost:3000/api/chat/sessions/${selectedSession._id}/close`);
            // Cập nhật trạng thái phiên chat trong danh sách
            setSessions(prev => 
                prev.map(session => 
                    session._id === selectedSession._id 
                        ? { ...session, status: 'closed' } 
                        : session
                )
            );
            // Cập nhật phiên chat hiện tại
            setSelectedSession(prev => prev ? { ...prev, status: 'closed' } : null);
            // Tải lại tin nhắn để hiển thị thông báo kết thúc
            fetchMessages(selectedSession._id);
        } catch (error) {
            console.error('Lỗi khi kết thúc phiên chat:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getUnreadCount = (sessionId: string) => {
        if (!sessions) return 0;
        const unreadMessages = messages.filter(
            msg => msg.session_id === sessionId && msg.sender_type === 'user' && !msg.read
        );
        return unreadMessages.length;
    };

    return (
        <div className="container mx-auto my-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Quản lý hỗ trợ trực tuyến</h1>
            
            <div className="mb-4">
                <div className="flex space-x-2">
                    <button 
                        className={`px-4 py-2 rounded ${statusFilter === 'active' ? 'bg-black text-white' : 'bg-gray-200'}`}
                        onClick={() => setStatusFilter('active')}
                    >
                        Đang hoạt động
                    </button>
                    <button 
                        className={`px-4 py-2 rounded ${statusFilter === 'closed' ? 'bg-black text-white' : 'bg-gray-200'}`}
                        onClick={() => setStatusFilter('closed')}
                    >
                        Đã kết thúc
                    </button>
                    <button 
                        className={`px-4 py-2 rounded ${statusFilter === 'all' ? 'bg-black text-white' : 'bg-gray-200'}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        Tất cả
                    </button>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                {/* Danh sách phiên chat */}
                <div className="w-full md:w-1/3 border rounded">
                    <h2 className="p-3 border-b font-semibold">Danh sách phiên chat</h2>
                    {loading ? (
                        <div className="p-4 text-center">Đang tải...</div>
                    ) : sessions.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Không có phiên chat nào</div>
                    ) : (
                        <div className="overflow-y-auto max-h-[500px]">
                            {sessions.map((session) => (
                                <div 
                                    key={session._id} 
                                    className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                                        selectedSession?._id === session._id ? 'bg-gray-100' : ''
                                    }`}
                                    onClick={() => handleSelectSession(session)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">{session.user_name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            {session.status === 'active' ? (
                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                                    Hoạt động
                                                </span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                                                    Đã kết thúc
                                                </span>
                                            )}
                                            {getUnreadCount(session._id) > 0 && (
                                                <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                                    {getUnreadCount(session._id)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {/* Khu vực chat */}
                <div className="w-full md:w-2/3 border rounded flex flex-col h-[600px]">
                    {selectedSession ? (
                        <>
                            <div className="p-3 border-b flex justify-between items-center">
                                <div>
                                    <h2 className="font-semibold">{selectedSession.user_name}</h2>
                                    <p className="text-sm text-gray-500">
                                        Bắt đầu: {formatTime(selectedSession.createdAt)}
                                    </p>
                                </div>
                                {selectedSession.status === 'active' && (
                                    <button 
                                        onClick={handleCloseSession}
                                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                                    >
                                        Kết thúc
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg._id}
                                        className={`mb-4 max-w-3/4 ${
                                            msg.sender_type === 'admin'
                                                ? 'ml-auto text-right'
                                                : ''
                                        }`}
                                    >
                                        <div
                                            className={`inline-block rounded-lg px-3 py-2 ${
                                                msg.sender_type === 'admin'
                                                    ? 'bg-black text-white'
                                                    : msg.sender_type === 'system'
                                                    ? 'bg-gray-200 text-gray-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {msg.sender_type !== 'system' && msg.sender_type.charAt(0).toUpperCase() + msg.sender_type.slice(1)} | {formatTime(msg.createdAt)}
                                        </p>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            
                            {selectedSession.status === 'active' ? (
                                <form onSubmit={handleSendReply} className="p-3 border-t">
                                    <div className="flex">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Nhập tin nhắn trả lời..."
                                            className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-black text-white rounded-r-lg px-4 py-2 hover:bg-gray-800"
                                            disabled={!replyText.trim()}
                                        >
                                            Gửi
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-3 bg-gray-100 text-center text-gray-600 border-t">
                                    Phiên chat này đã kết thúc
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-gray-500">Chọn một phiên chat để bắt đầu</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChat;