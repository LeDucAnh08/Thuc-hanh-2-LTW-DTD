import React, { useState, useEffect } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  FormControlLabel,
  Checkbox,
  Button,
  Chip
} from "@mui/material";
import { PhotoCamera, Circle } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

import "./styles.css";
import models from "../../modelData/models";
import { useFeatures } from "../../context/FeatureContext";
import { postModel, removeToken, fetchModel } from "../../lib/fetchModelData";

/**
 * Define TopBar, a React component of Project 4.
 */
function TopBar({ user, onLogout, onAddPhotoClick }) {
  const location = useLocation();
  const { advancedFeaturesEnabled, toggleAdvancedFeatures } = useFeatures();
  const [serverStatus, setServerStatus] = useState('checking'); // 'online', 'offline', 'checking'
  
  // Check server status
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        // Try to fetch user list as a simple health check
        await fetchModel('/user/list');
        setServerStatus('online');
      } catch (error) {
        console.error('Server check failed:', error);
        setServerStatus('offline');
      }
    };

    checkServerStatus();
    // Check server status every 30 seconds
    const interval = setInterval(checkServerStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleLogout = async () => {
    try {
      await postModel('/admin/logout', {});
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if server request fails
    } finally {
      // Always clear token and logout locally
      removeToken();
      onLogout();
    }
  };
  
  // Get context information based on current route
  const getContextInfo = () => {
    const path = location.pathname;
    let userId;
    
    // Extract userId from path for both /users/:userId and /photos/:userId routes
    if (path.startsWith('/users/')) {
      userId = path.split('/users/')[1];
    } else if (path.startsWith('/photos/')) {
      userId = path.split('/photos/')[1];
      // If it's a specific photo view, get just the userId part
      if (userId) {
        userId = userId.split('/')[0];
      }
    }
    
    if (userId) {
      const user = models.userModel(userId);
      if (user) {
        if (path.startsWith('/photos/')) {
          return `Photos of ${user.first_name} ${user.last_name}`;
        } else {
          return `${user.first_name} ${user.last_name}`;
        }
      }
    }
    
    return "";
  };

  return (
    <AppBar position="fixed" className="cs142-topbar-appBar">
      <Toolbar>
        <Box display="flex" alignItems="center" width="100%">
          <Typography variant="h5" color="inherit" sx={{ flexGrow: 0, marginRight: 2 }}>
            📸 Photo Sharing App
          </Typography>
          
          <Box display="flex" alignItems="center" gap={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={advancedFeaturesEnabled}
                  onChange={toggleAdvancedFeatures}
                  sx={{ 
                    color: 'white',
                    '&.Mui-checked': {
                      color: 'rgba(76, 175, 80, 1)',
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" color="inherit">
                  Enable Advanced Features
                </Typography>
              }
            />
          </Box>
          
          <Box display="flex" alignItems="center" gap={2} sx={{ marginLeft: 'auto' }}>
            {user ? (
              <>
                <Typography variant="body1" color="inherit">
                  Hi {user.first_name}
                </Typography>
                <Button 
                  color="inherit" 
                  variant="outlined"
                  size="small"
                  startIcon={<PhotoCamera />}
                  onClick={onAddPhotoClick}
                  disabled={serverStatus !== 'online'}
                  sx={{ 
                    borderColor: serverStatus === 'online' ? 'rgba(76, 175, 80, 0.7)' : 'rgba(255, 255, 255, 0.3)',
                    color: serverStatus === 'online' ? 'rgba(76, 175, 80, 1)' : 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: serverStatus === 'online' ? 'rgba(76, 175, 80, 1)' : 'rgba(255, 255, 255, 0.3)',
                      backgroundColor: serverStatus === 'online' ? 'rgba(76, 175, 80, 0.1)' : 'transparent'
                    }
                  }}
                >
                  UPLOAD
                </Button>
                <Button 
                  color="inherit" 
                  variant="outlined"
                  size="small"
                  onClick={handleLogout}
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Typography variant="body1" color="inherit" sx={{ fontStyle: 'italic' }}>
                Please Login
              </Typography>
            )}
            
            <Typography variant="h6" color="inherit">
              {getContextInfo()}
            </Typography>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
