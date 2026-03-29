import { useState, useEffect, useRef } from 'react';
import { getChatRooms, getMessages, sendMessage } from '../api/adminApi';
import { io } from 'socket.io-client';

function ChatManagementPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedRoomRef = useRef(null);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
    if (selectedRoom) {
      setRooms(prev => prev.map(r => r._id === selectedRoom._id ? { ...r, hasUnread: false } : r));
    }
  }, [selectedRoom]);

  useEffect(() => {
    fetchRooms();

    const socket = io('http://localhost:5000', { withCredentials: true });

    socket.on('admin_receive_message', (message) => {
      const currentRoom = selectedRoomRef.current;
      const isViewing = currentRoom && currentRoom._id === message.chatRoom;
      const isAdminSender = currentRoom && message.senderId === currentRoom.owner?._id;
      
      setRooms(prevRooms => {
        const roomExists = prevRooms.find(r => r._id === message.chatRoom);
        if (roomExists) {
          return prevRooms.map(room => {
            if (room._id === message.chatRoom) {
              return { 
                ...room, 
                lastMessage: message.content, 
                lastMessageTime: message.createdAt || new Date(), 
                hasUnread: !isAdminSender && !isViewing 
              };
            }
            return room;
          }).sort((a,b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
        } else {
          fetchRooms();
          return prevRooms;
        }
      });

      if (isViewing) {
        setMessages(prev => {
           // Tránh duplicate tin nhắn nếu fetchMessages đã gọi xong
           if (!prev.find(m => m._id === message._id)) {
              return [...prev, message];
           }
           return prev;
        });
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom._id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const { data } = await getChatRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchMessages = async (roomId) => {
    setLoadingMessages(true);
    try {
      const { data } = await getMessages(roomId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom) return;

    setSending(true);
    try {
      // Sử dụng owner ID để gửi tin nhắn (admin)
      const { data } = await sendMessage(selectedRoom._id, {
        content: newMessage,
        senderId: selectedRoom.owner?._id,
      });
      
      setNewMessage('');
      // Optimistically add the message to the list to avoid full refresh spinner
      setMessages(prev => {
        if (!prev.find(m => m._id === data._id)) {
          return [...prev, data];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const getInitial = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="management-page">
      <div className="page-header">
        <h2>💬 Chat hỗ trợ</h2>
      </div>

      <div className="chat-layout">
        {/* Chat Rooms Panel */}
        <div className="chat-rooms-panel">
          <div className="chat-rooms-header">
            <h3>Hội thoại ({rooms.length})</h3>
          </div>
          <div className="chat-rooms-list">
            {loadingRooms ? (
              <div className="loading-spinner"><div className="spinner"></div></div>
            ) : rooms.length === 0 ? (
              <div className="empty-state" style={{ padding: 30 }}>
                <i className="bi bi-chat-left-text"></i>
                <p>Chưa có hội thoại</p>
              </div>
            ) : (
              rooms.map(room => (
                <div
                  key={room._id}
                  className={`chat-room-item ${selectedRoom?._id === room._id ? 'active' : ''}`}
                  onClick={() => setSelectedRoom(room)}
                  style={{ position: 'relative' }}
                >
                  <div className="chat-room-avatar" style={{ position: 'relative' }}>
                    {getInitial(room.customer?.fullName)}
                    {room.hasUnread && (
                      <div style={{
                        position: 'absolute', top: -2, right: -2, width: 12, height: 12,
                        background: '#e74c3c', borderRadius: '50%', border: '2px solid white'
                      }} />
                    )}
                  </div>
                  <div className="chat-room-info">
                    <div className="chat-room-name">
                      {room.customer?.fullName || 'Khách hàng'}
                    </div>
                    <div className="chat-room-preview">
                      {room.lastMessage}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span>{formatDate(room.lastMessageTime)}</span>
                    {room.hasUnread && (
                      <span style={{
                        background: '#e74c3c', color: 'white', fontSize: 10, fontWeight: 'bold',
                        padding: '2px 6px', borderRadius: 10
                      }}>Mới</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Panel */}
        <div className="chat-messages-panel">
          {selectedRoom ? (
            <>
              <div className="chat-messages-header">
                <div className="chat-room-avatar" style={{ width: 36, height: 36, fontSize: 14 }}>
                  {getInitial(selectedRoom.customer?.fullName)}
                </div>
                <div>
                  <h4>{selectedRoom.customer?.fullName || 'Khách hàng'}</h4>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {selectedRoom.customer?.email || ''}
                  </div>
                </div>
              </div>

              <div className="chat-messages-body">
                {loadingMessages ? (
                  <div className="loading-spinner"><div className="spinner"></div></div>
                ) : messages.length === 0 ? (
                  <div className="empty-state">
                    <p>Chưa có tin nhắn nào</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isAdmin = msg.senderId?._id === selectedRoom.owner?._id;
                    return (
                      <div
                        key={msg._id}
                        className={`chat-message ${isAdmin ? 'sent' : 'received'}`}
                      >
                        <div>{msg.content}</div>
                        <div className="chat-message-time">
                          {formatTime(msg.createdAt)}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="chat-input-area" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={sending || !newMessage.trim()}
                >
                  <i className="bi bi-send-fill"></i>
                  Gửi
                </button>
              </form>
            </>
          ) : (
            <div className="chat-empty-state">
              <i className="bi bi-chat-square-text"></i>
              <p>Chọn một hội thoại để xem tin nhắn</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatManagementPage;
