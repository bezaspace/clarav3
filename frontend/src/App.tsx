import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/src/components/layout/Navigation';
import Dashboard from '@/src/pages/Dashboard';
import Progress from '@/src/pages/Progress';
import Care from '@/src/pages/Care';
import Journal from '@/src/pages/Journal';
import VoiceAssistant from '@/src/pages/VoiceAssistant';

export default function App() {
  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        
        <main className="flex-1 p-3 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/care" element={<Care />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/voice-assistant" element={<VoiceAssistant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
