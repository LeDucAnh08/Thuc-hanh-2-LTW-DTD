import React from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  FormControlLabel,
  Checkbox
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

import "./styles.css";
import models from "../../modelData/models";
import { useFeatures } from "../../context/FeatureContext";

/**
 * Define TopBar, a React component of Project 4.
 */
function TopBar() {
  const location = useLocation();
  const { advancedFeaturesEnabled, toggleAdvancedFeatures } = useFeatures();
  
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
          
          {/* Right side - Context Info */}
          <Typography variant="h6" color="inherit" sx={{ marginLeft: 'auto' }}>
            {getContextInfo()}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;
