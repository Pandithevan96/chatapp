import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup'; // Import Signup component
import ProfilePage from './components/ProfilePage';
const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/chatapp/" element={<Home />} /> // Home Page Route
          <Route path="/login" element={<Login />} /> // Login Page Route
          <Route path="/signup" element={<Signup />} /> // Signup Page Route
          <Route path="/profilePage" element={<ProfilePage />} /> // Signup Page Route
        </Routes>
      </div>
    </Router>
  );
};

export default App;
