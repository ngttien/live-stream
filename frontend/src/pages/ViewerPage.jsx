import { useState, useEffect } from 'react';
import FlvPlayer from '../components/FlvPlayer';
import ChatBox from '../components/ChatBox';
import { useAuth } from '../hooks/useAuth';

const ViewerPage = () => {
  const { user } = useAuth();
  const [liveRooms, setLiveRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    loadLiveRooms();
    const interval = setInterval(loadLiveRooms, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadLiveRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/rooms?limit=50`);
      const data = await res.json();

      if (data.success) {
        setLiveRooms(data.rooms);
      }
    } catch (err) {
      console.error('Load rooms error:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchRooms = async () => {
    if (!searchQuery.trim()) {
      loadLiveRooms();
      return;
    }

    try {
      const res = await fetch(`${API_URL}/rooms/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data.success) {
        setLiveRooms(data.rooms);
      }
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const joinRoom = async (room) => {
    setSelectedRoom(room);
  };

  const leaveRoom = () => {
    setSelectedRoom(null);
  };

  if (selectedRoom) {
    return (
      <div className="viewer-layout">
        <div className="main-content">
          <button onClick={leaveRoom} className="btn-secondary" style={{ marginBottom: '16px' }}>
            ← Quay lại danh sách
          </button>

          <FlvPlayer streamKey={selectedRoom.stream_key} />

          <div className="controls-overlay" style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ marginBottom: '8px' }}>{selectedRoom.title}</h2>
                <div style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{selectedRoom.streamer_username}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="live-badge">
                  <span className="status-indicator status-live"></span>
                  <span>LIVE</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                  {selectedRoom.viewer_count || 0} người xem
                </span>
              </div>
            </div>
            {selectedRoom.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', marginBottom: '12px' }}>
                {selectedRoom.description}
              </p>
            )}
            <div className="divider"></div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span style={{ fontWeight: '500' }}>Danh mục:</span> {selectedRoom.category}
            </div>
          </div>
        </div>
        <div style={{ position: 'sticky', top: '72px', height: 'fit-content' }}>
          <ChatBox roomId={selectedRoom.room_id} isStreamer={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Khám phá</h1>
        <p className="page-subtitle">Xem các stream đang phát trực tiếp</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && searchRooms()}
          placeholder="Tìm kiếm stream theo tiêu đề, streamer..."
          className="search-input"
        />
        <button onClick={searchRooms} className="btn-blue">
          Tìm kiếm
        </button>
        <button onClick={loadLiveRooms} className="btn-secondary">
          Làm mới
        </button>
      </div>

      {loading ? (
        <div className="stream-grid">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="skeleton skeleton-card"></div>
          ))}
        </div>
      ) : liveRooms.length === 0 ? (
        <div className="empty-state">
          <h3 style={{ marginBottom: '8px' }}>Không có stream nào đang live</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy quay lại sau nhé!'}
          </p>
        </div>
      ) : (
        <div className="stream-grid">
          {liveRooms.map(room => (
            <div key={room.id} onClick={() => joinRoom(room)} className="stream-card">
              <div className="stream-thumbnail">
                <div className="stream-live-badge">
                  <span className="status-indicator status-live"></span>
                  <span>LIVE</span>
                </div>
                <span className="stream-viewer-count">
                  {room.viewer_count || 0} người xem
                </span>
                <div className="stream-thumbnail-icon">▶</div>
              </div>
              <div className="stream-info">
                <h3 className="stream-title">{room.title}</h3>
                <div className="stream-meta">
                  <span className="stream-meta-item">{room.streamer_username}</span>
                  <span className="stream-meta-divider"></span>
                  <span className="stream-meta-item">{room.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewerPage;
