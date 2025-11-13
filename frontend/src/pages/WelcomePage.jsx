import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';

const WelcomePage = () => {
  const { user } = useAuth();
  const [liveRooms, setLiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    loadLiveRooms();
  }, []);

  const loadLiveRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/rooms?limit=6`);
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

  return (
    <div className="container">
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '80px 0 60px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '56px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '700',
          lineHeight: '1.2'
        }}>
          Streemly
        </h1>
        <p style={{ fontSize: '22px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: '1.6' }}>
          Nền tảng livestream hiện đại với độ trễ thấp<br />
          Kết nối streamer và người xem mọi lúc, mọi nơi
        </p>

        {!user ? (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register">
              <button className="btn-primary btn-lg">
                Bắt đầu ngay
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-secondary btn-lg">
                Đăng nhập
              </button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/stream">
              <button className="btn-primary btn-lg">
                Bắt đầu Stream
              </button>
            </Link>
            <Link to="/watch">
              <button className="btn-blue btn-lg">
                Khám phá
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div style={{ marginBottom: '80px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '48px', fontSize: '32px', fontWeight: '600' }}>
          Tính năng nổi bật
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
          <div className="card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>

            <h3 style={{ marginBottom: '12px', fontSize: '20px', fontWeight: '600' }}>Stream chất lượng cao</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              Hỗ trợ streaming với chất lượng HD, độ trễ chỉ 2-3 giây với công nghệ FLV
            </p>
          </div>
          <div className="card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{ marginBottom: '12px', fontSize: '20px', fontWeight: '600' }}>Chat realtime</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              Tương tác trực tiếp với người xem qua chat realtime với Socket.io
            </p>
          </div>
          <div className="card" style={{ padding: '32px', textAlign: 'center', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <h3 style={{ marginBottom: '12px', fontSize: '20px', fontWeight: '600' }}>Đa dạng nội dung</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
              Gaming, Music, Talk Show, Creative và nhiều danh mục khác
            </p>
          </div>
        </div>
      </div>

      {/* Live Streams Section */}
      {liveRooms.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '600' }}>
              <span className="status-indicator status-live" style={{ marginRight: '8px' }}></span>
              Đang live
            </h2>
            <Link to="/watch" className="btn-secondary">
              Xem tất cả →
            </Link>
          </div>
          <div className="stream-grid">
            {liveRooms.map(room => (
              <Link
                key={room.id}
                to="/watch"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="stream-card">
                  <div className="stream-thumbnail">
                    <div className="stream-live-badge">
                      <span className="status-indicator status-live"></span>
                      <span>LIVE</span>
                    </div>
                    <span className="stream-viewer-count">
                      {room.viewer_count || 0}
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
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomePage;
