'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Search, User, Check, CheckCheck, MessageSquare } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'seen';
}

interface Chat {
  _id: string;
  userId: string;
  username: string;
  userEmail: string;
  isOnline: boolean;
  lastSeen: Date | null;
  messages: Message[];
  unreadCount: number;
  lastMessage?: Message;
}

export default function AdminChatView({ onClose, initialChatId }: { onClose: () => void; initialChatId?: string | null }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllChats();
    const interval = setInterval(fetchAllChats, 2000); // Poll every 2s for better real-time feel
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChat) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedChat?.messages]);

  // Auto-select chat from notification
  useEffect(() => {
    if (initialChatId && chats.length > 0) {
      const chat = chats.find(c => c._id === initialChatId);
      if (chat && !selectedChat) {
        handleSelectChat(chat);
      }
    }
  }, [initialChatId, chats]);

  const fetchAllChats = async () => {
    try {
      const res = await fetch('/api/admin/chats');
      const data = await res.json();
      
      if (data.success) {
        setChats(data.chats);
        // Update selected chat if it exists
        if (selectedChat) {
          const updated = data.chats.find((c: Chat) => c._id === selectedChat._id);
          if (updated) {
            setSelectedChat(updated);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const handleSelectChat = async (chat: Chat) => {
    setSelectedChat(chat);
    
    // Mark messages as seen
    try {
      await fetch('/api/admin/chats/seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: chat._id })
      });
    } catch (error) {
      console.error('Error marking as seen:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/chats/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: selectedChat._id,
          message: newMessage
        })
      });

      if (res.ok) {
        setNewMessage('');
        fetchAllChats();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderMessageStatus = (msg: Message) => {
    if (msg.sender !== 'admin') return null;

    if (msg.status === 'seen') {
      return <span className="text-xs text-white-500">seen</span>;
    } else if (msg.status === 'delivered') {
      return <CheckCheck className="w-3 h-3 text-gray-400" />;
    } else {
      return <Check className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full md:h-[700px] flex flex-col md:flex-row overflow-hidden">
        {/* Chat List Sidebar */}
        <div className={`w-full md:w-80 border-r border-gray-200 flex flex-col ${
          selectedChat ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Header */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">User Chats</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {filteredChats.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No chats yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredChats.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left ${
                      selectedChat?._id === chat._id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {chat.username.charAt(0).toUpperCase()}
                        </div>
                        {/* Online Status Indicator */}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          chat.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {chat.username}
                          </p>
                          {chat.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-xs font-semibold rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        {chat.lastMessage && (
                          <p className="text-xs text-gray-500 truncate">
                            {chat.lastMessage.sender === 'admin' ? 'You: ' : ''}
                            {chat.lastMessage.text}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col ${
          selectedChat ? 'flex' : 'hidden md:flex'
        }`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="px-4 md:px-6 py-4 border-b border-gray-200 bg-gray-50">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden mb-3 text-purple-600 text-sm font-medium flex items-center gap-1 hover:text-purple-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to chats
                </button>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedChat.username.charAt(0).toUpperCase()}
                    </div>
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                      selectedChat.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedChat.username}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedChat.isOnline ? (
                        <span className="text-green-600 font-medium">● Online</span>
                      ) : (
                        <span className="text-gray-500">
                          Last seen: {selectedChat.lastSeen ? new Date(selectedChat.lastSeen).toLocaleString() : 'Unknown'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] ${
                        msg.sender === 'admin'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      } rounded-2xl px-4 py-2`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        <p className="text-xs opacity-70">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {renderMessageStatus(msg)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 md:px-6 py-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your reply..."
                    className="flex-1 px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim()}
                    className="px-3 md:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">Select a chat to start</p>
                <p className="text-gray-400 text-sm mt-1">Choose a user from the list to view conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
