import './App.css';

import React from "react";
import { Grid, Typography, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import PhotoViewer from "./components/PhotoViewer";
import { FeatureProvider, useFeatures } from "./context/FeatureContext";

const MainContent = () => {
  const { advancedFeaturesEnabled } = useFeatures();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TopBar />
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
              element={<UserPhotos />}
            />
            <Route
              path="/photos/:userId/:photoId"
              element={advancedFeaturesEnabled ? <PhotoViewer /> : <UserPhotos />}
            />
            <Route path="/users" element={<UserList />} />
            <Route path="/" element={<UserList />} />
          </Routes>
        </Paper>
      </Grid>
    </Grid>
  );
};

const App = () => {
  return (
    <Router>
      <FeatureProvider>
        <MainContent />
      </FeatureProvider>
    </Router>
  );
};

export default App;
