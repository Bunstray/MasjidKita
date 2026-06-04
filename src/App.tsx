import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookmarkProvider } from '@/context/BookmarkContext';
import { AuthProvider } from '@/context/AuthContext';
import AppShell from '@/components/layout/AppShell';
import Dashboard from '@/pages/Dashboard';
import PrayerTimes from '@/pages/PrayerTimes';
import Quran from '@/pages/Quran';
import QuranReader from '@/pages/QuranReader';
import DigitalInfaq from '@/pages/DigitalInfaq';
import InfaqHistory from '@/pages/InfaqHistory';
import Qibla from '@/pages/Qibla';
import News from '@/pages/News';
import NewsDetail from '@/pages/NewsDetail';
import Dua from '@/pages/Dua';
import More from '@/pages/More';
import EKupon from '@/pages/EKupon';

// Auth & User Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';

// Admin Pages
import AdminLayout from '@/components/layout/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminInfaq from '@/pages/admin/AdminInfaq';
import AdminNews from '@/pages/admin/AdminNews';
import AdminEKupon from './pages/admin/AdminEKupon';

// const navigate = useNavigate();

export default function App() {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/prayer" element={<PrayerTimes />} />
              <Route path="/quran" element={<Quran />} />
              <Route path="/quran/:surahNumber" element={<QuranReader />} />
              <Route path="/infaq" element={<DigitalInfaq />} />
              <Route path="/infaq/history" element={<InfaqHistory />} />
              <Route path="/qibla" element={<Qibla />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsDetail />} />
              <Route path="/dua" element={<Dua />} />
              <Route path="/more" element={<More />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/e-coupons" element={<EKupon />} />
            </Route>

            {/* Auth Routes without bottom nav */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="infaq" element={<AdminInfaq />} />
              <Route path="news" element={<AdminNews />} />
              <Route path="e-coupons" element={<AdminEKupon />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BookmarkProvider>
    </AuthProvider>
  );
}
