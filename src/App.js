import './App.css';

import React, { useState, useEffect } from "react";
import { Grid, Typography, Paper, Box, CircularProgress } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import PhotoViewer from "./components/PhotoViewer";
import UserComments from "./components/UserComments";
import LoginRegister from "./components/LoginRegister";
import PhotoUpload from "./components/PhotoUpload";
import UserProfile from "./components/UserProfile";
import { FeatureProvider, useFeatures } from "./context/FeatureContext";
import { fetchModel, getToken, setToken, removeToken } from "./lib/fetchModelData";

const MainContent = ({ user, onLogout }) => {
  const { advancedFeaturesEnabled } = useFeatures();
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAddPhotoClick = () => {
    setShowPhotoUpload(true);
  };

  const handlePhotoUploaded = (photo) => {
    setShowPhotoUpload(false);
    // Force refresh of photos by updating trigger
    setRefreshTrigger(prev => prev + 1);
    // Navigate to the photos page of the user who uploaded the photo
    navigate(`/photos/${photo.user_id}`);
  };

  const handlePhotoUploadClose = () => {
    setShowPhotoUpload(false);
  };

  const handleLogout = () => {
    // Clear JWT token
    removeToken();
    onLogout();
  };

  if (!user) {
    return null; // LoginRegister will be shown by App component
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <TopBar user={user} onLogout={handleLogout} onAddPhotoClick={handleAddPhotoClick} />
      <Box sx={{ marginTop: '64px', padding: 3 }}>
        <Grid container spacing={3}>
          <Grid item sm={3} md={3}>
            <Paper elevation={2} sx={{ height: 'fit-content' }}>
              <UserList />
            </Paper>
          </Grid>
          <Grid item sm={9} md={9}>
            <Paper elevation={2} sx={{ minHeight: '600px', padding: 2 }}>
              <Routes>
                <Route path="/" element={
                  <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                    <Typography variant="h4" color="textSecondary">
                      Select a user from the list to view their details or photos
                    </Typography>
                  </Box>
                } />
                <Route path="/users/:userId" element={<UserDetail refreshTrigger={refreshTrigger} />} />
                <Route path="profile/:userId" element={<UserProfile user={user} />} />
                <Route path="/photos/:userId" element={<UserPhotos refreshTrigger={refreshTrigger} currentUser={user} />} />
                <Route path="/photos/:userId/:photoId" element={<PhotoViewer currentUser={user} />} />
                {advancedFeaturesEnabled && (
                  <Route path="/comments/:userId" element={<UserComments currentUser={JSON.parse(localStorage.getItem('user'))}/>} />
                )}
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      
      <PhotoUpload 
        open={showPhotoUpload}
        onPhotoUploaded={handlePhotoUploaded}
        onClose={handlePhotoUploadClose}
      />
    </Box>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = getToken();
        if (token) {
          // Try to get session info using existing token
          const sessionData = await fetchModel('/admin/session');
          if (sessionData.logged_in) {
            // Get full user data
            const userData = await fetchModel(`/user/${sessionData.user_id}`);
            setUser(userData);
          }
        }
      } catch (error) {
        console.log('No active session or invalid token');
        // Clear invalid token
        removeToken();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (userData) => {
    // Store JWT token
    if (userData.token) {
      setToken(userData.token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    // Clear JWT token
    removeToken();
    setUser(null);
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  return (
    <Router>
      <FeatureProvider>
        {user ? (
          <MainContent user={user} onLogout={handleLogout} />
        ) : (
          <LoginRegister onLogin={handleLogin} />
        )}
      </FeatureProvider>
    </Router>
  );
};

export default App;
