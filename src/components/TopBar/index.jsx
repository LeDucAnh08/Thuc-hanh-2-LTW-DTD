import React from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  FormControlLabel,
  Checkbox,
  Button
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

import "./styles.css";
import models from "../../modelData/models";
import { useFeatures } from "../../context/FeatureContext";
import { postModel } from "../../lib/fetchModelData";

/**
 * Define TopBar, a React component of Project 4.
 */
function TopBar({ user, onLogout, onAddPhotoClick }) {
  const location = useLocation();
  const { advancedFeaturesEnabled, toggleAdvancedFeatures } = useFeatures();
  
  const handleLogout = async () => {
    try {
      await postModel('/admin/logout', {});
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails on server, clear local state
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
    <AppBar className="topbar-appBar" position="absolute">
      <Toolbar>
        <Box display="flex" width="100%" alignItems="center">
          {/* Left side - Your Name */}
          <Typography 
            variant="h5" 
            color="inherit" 
            component={Link} 
            to="/users" 
            className="app-title"
          >
            Bùi Thế Vĩnh Nguyên - B22DCCN588
          </Typography>

          {/* Center - Advanced Features Toggle */}
          <Box mx={4}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={advancedFeaturesEnabled}
                  onChange={toggleAdvancedFeatures}
                  color="default"
                />
              }
              label={
                <Typography color="inherit">
                  Enable Advanced Features
                </Typography>
              }
            />
          </Box>
          
          {/* Right side - User Info and Context */}
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
                  sx={{ 
                    borderColor: 'rgba(76, 175, 80, 0.7)',
                    color: 'rgba(76, 175, 80, 1)',
                    '&:hover': {
                      borderColor: 'rgba(76, 175, 80, 1)',
                      backgroundColor: 'rgba(76, 175, 80, 0.1)'
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
