import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'; // Thêm useLocation
import { AuthProvider } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StreamerDashboard from './pages/StreamerDashboard';
import ViewerPage from './pages/ViewerPage';
import './assets/style.css';

// --- 1. Import Matomo ---
import { MatomoProvider, createInstance, useMatomo } from '@datapunt/matomo-tracker-react';
import { useEffect } from 'react';

// --- 2. Cấu hình Matomo (Điền thông tin của bạn vào đây) ---
const instance = createInstance({
  urlBase: 'https://streair.matomo.cloud/', // <--- Thay URL Matomo của bạn
  siteId: 1, // <--- Thay Site ID của bạn
});

// --- 3. Component nhỏ để tự động track khi chuyển trang ---
const PageTracker = () => {
  const location = useLocation();
  const { trackPageView } = useMatomo();

  useEffect(() => {
    trackPageView(); // Gửi tín hiệu "đã xem trang" mỗi khi URL thay đổi
  }, [location, trackPageView]);

  return null;
};

function App() {
  return (
    // --- 4. Bọc ứng dụng bằng MatomoProvider ---
    <MatomoProvider value={instance}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <PageTracker /> {/* <--- Đặt cái này vào trong Router để nó chạy */}
            <div className="App">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<WelcomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/stream" element={<ProtectedRoute><StreamerDashboard /></ProtectedRoute>} />
                  <Route path="/watch" element={<ViewerPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </MatomoProvider>
  );
}

export default App;