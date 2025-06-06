import React, { useState, useEffect } from "react";
import { Typography, Button, Card, CardContent, CardActions, CircularProgress, Box } from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";
import { useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchModel(`/user/${userId}`)
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user details:", error);
        setError("Failed to load user details. Please try again later.");
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Typography variant="h5">User not found</Typography>;
  }

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isOwnProfile = currentUser && currentUser._id === user._id;

  return (
    <div className="user-detail">
      <Card className="user-card">
        <CardContent>
          <Typography variant="h4" component="h2" gutterBottom>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Location: {user.location}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            Occupation: {user.occupation}
          </Typography>
          <Typography variant="body1" paragraph>
            Description: {user.description}
          </Typography>
        </CardContent>
        <CardActions>
          <Button 
            component={Link} 
            to={`/photos/${userId}`} 
            variant="contained" 
            color="primary"
          >
            View Photos
          </Button>
          {isOwnProfile && (
            <Button 
              component={Link} 
              to={`/profile/${userId}`} 
              variant="outlined" 
              color="primary"
            >
              Edit Profile
            </Button>
          )}
        </CardActions>
      </Card>
    </div>
  );
}

export default UserDetail;
