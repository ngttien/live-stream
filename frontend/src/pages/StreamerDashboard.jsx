import { useEffect, useState } from 'react';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../hooks/useAuth';

const StreamerDashboard = () => {
  const { user } = useAuth();
  const [streamKey, setStreamKey] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('gaming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (user?.streamKey) {
      setStreamKey(user.streamKey);
    }

    // Load existing rooms
    loadMyRooms();
  }, [user]);

  const loadMyRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/rooms/my/rooms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success && data.rooms.length > 0) {
        const activeRoom = data.rooms.find(r => r.is_live);
        if (activeRoom) {
          setRoomInfo(activeRoom);
          setRoomId(activeRoom.room_id);
          setTitle(activeRoom.title);
          setDescription(activeRoom.description || '');
          setCategory(activeRoom.category || 'gaming');
        }
      }
    } catch (err) {
      console.error('Load rooms error:', err);
    }
  };

  const createRoom = async () => {
    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề stream');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, description, category })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      setRoomInfo(data.room);
      setRoomId(data.room.room_id);
      alert('Phòng stream đã được tạo! Bắt đầu stream từ OBS.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="viewer-layout">
      <main className="main-content">
        <div className="controls-overlay">
          <h2>Bảng điều khiển Streamer</h2>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="info-box">
            <div className="info-box-title">Cấu hình OBS</div>
            <div className="form-group">
              <label className="form-label">RTMP URL</label>
              <input
                type="text"
                value="rtmp://localhost:1935/live"
                readOnly
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Stream Key</label>
              <input
                type="text"
                value={streamKey || 'Đang tải...'}
                readOnly
              />
            </div>
          </div>

          {!roomInfo ? (
            <div className="info-box">
              <div className="info-box-title">Tạo phòng stream mới</div>
              <div className="form-group">
                <label className="form-label required">Tiêu đề</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề stream..."
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Mô tả về stream của bạn..."
                  maxLength={500}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Danh mục</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                >
                  <option value="gaming">Gaming</option>
                  <option value="music">Music</option>
                  <option value="talk">Talk Show</option>
                  <option value="creative">Creative</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <button
                onClick={createRoom}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {loading ? 'Đang tạo...' : 'Tạo phòng stream'}
              </button>
            </div>
          ) : (
            <div className="info-box">
              <div className="info-box-title">Thông tin phòng stream</div>
              <div style={{ marginBottom: '16px' }}>
                <div className="live-badge" style={{ minWidth: '180px' }}>
                  <span className="status-indicator status-live"></span>
                  <span>ĐANG TRỰC TIẾP</span>
                </div>
              </div>
              <div className="info-item">
                <strong>Tiêu đề:</strong> {roomInfo.title}
              </div>
              <div className="info-item">
                <strong>Room ID:</strong> {roomInfo.room_id}
              </div>
              <div className="info-item">
                <strong>Danh mục:</strong> {roomInfo.category}
              </div>
              {roomInfo.description && (
                <div className="info-item">
                  <strong>Mô tả:</strong> {roomInfo.description}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      {roomId && <ChatBox roomId={roomId} isStreamer={true} />}
    </div>
  );
};

export default StreamerDashboard;
