import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from '@/src/components/layout/Navigation';
import Dashboard from '@/src/pages/Dashboard';
import Schedule from '@/src/pages/Schedule';
import Progress from '@/src/pages/Progress';
import Care from '@/src/pages/Care';
import AppointmentBooking from '@/src/pages/AppointmentBooking';
import ProductDetail from '@/src/pages/ProductDetail';
import FoodItemDetail from '@/src/pages/FoodItemDetail';
import LabTestDetail from '@/src/pages/LabTestDetail';
import Journal from '@/src/pages/Journal';
import VoiceAssistant from '@/src/pages/VoiceAssistant';
import Profile from '@/src/pages/Profile';
import BiomarkersList from '@/src/pages/BiomarkersList';

function AppContent() {
  const location = useLocation();
  const hideNav = location.pathname === '/voice-assistant' || location.pathname === '/profile' || location.pathname === '/biomarkers';

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Main content area - mobile optimized */}
      <main className="w-full max-w-md mx-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/care" element={<Care />} />
          <Route path="/book-appointment/:doctorId" element={<AppointmentBooking />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/food-item/:itemId" element={<FoodItemDetail />} />
          <Route path="/lab-test/:testId" element={<LabTestDetail />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/voice-assistant" element={<VoiceAssistant />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/biomarkers" element={<BiomarkersList />} />
        </Routes>
      </main>

      {/* Bottom navigation - hidden on voice assistant and profile pages */}
      {!hideNav && <Navigation />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
