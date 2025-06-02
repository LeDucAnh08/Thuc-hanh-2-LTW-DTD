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
import { FeatureProvider, useFeatures } from "./context/FeatureContext";
import { fetchModel } from "./lib/fetchModelData";

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

  if (!user) {
    return null; // LoginRegister will be shown by App component
  }

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar 
            user={user} 
            onLogout={onLogout} 
            onAddPhotoClick={handleAddPhotoClick}
          />
        </Grid>
        <div className="main-topbar-buffer" />
        <Grid item sm={3}>
          <Paper className="main-grid-item">
            <UserList />
          </Paper>
        </Grid>
        <Grid item sm={9}>
          <Paper className="main-grid-item">
            <Routes>
              <Route
                path="/users/:userId"
                element={<UserDetail />}
              />
              <Route
                path="/photos/:userId"
                element={<UserPhotos currentUser={user} key={refreshTrigger} />}
              />
              <Route
                path="/photos/:userId/:photoId"
                element={advancedFeaturesEnabled ? <PhotoViewer currentUser={user} /> : <UserPhotos currentUser={user} key={refreshTrigger} />}
              />
              <Route 
                path="/comments/:userId" 
                element={<UserComments />} 
              />
              <Route path="/users" element={<UserList />} />
              <Route path="/" element={<UserList />} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>

      {/* Photo Upload Dialog */}
      <PhotoUpload 
        open={showPhotoUpload}
        onClose={handlePhotoUploadClose}
        onPhotoUploaded={handlePhotoUploaded}
      />
    </>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await fetchModel('/admin/session');
        if (sessionData.logged_in) {
          // Get full user data
          const userData = await fetchModel(`/user/${sessionData.user_id}`);
          setUser(userData);
        }
      } catch (error) {
        console.log('No active session');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
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
