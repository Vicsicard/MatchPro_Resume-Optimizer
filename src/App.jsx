import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home';
import UploadPage from './components/upload/UploadPage';
import PricingPage from './components/pricing/PricingPage';
import SuccessPage from './components/stripe/SuccessPage';
import CancelPage from './components/stripe/CancelPage';
import { JobPostingTest } from './components/test/JobPostingTest';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/test/job-posting" element={<JobPostingTest />} />
      </Routes>
    </Router>
  );
}

export default App;