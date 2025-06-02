import React, { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Container,
  Box,
  CircularProgress
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useFeatures } from "../../context/FeatureContext";

import "./styles.css";
import { useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import CommentInput from "../CommentInput";

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos({ currentUser }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { advancedFeaturesEnabled } = useFeatures();
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Backend server URL - adjust this based on your backend configuration
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

  // Function to get the correct image URL with fallback logic
  const getImageUrl = (fileName) => {
    // Check if it's a new uploaded image (usually has UUID format)
    const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(fileName);
    
    if (isUUIDFormat) {
      // New uploaded images are from backend server
      return `${BACKEND_URL}/images/${fileName}`;
    } else {
      // Old images are from frontend public folder
      return `${process.env.PUBLIC_URL}/images/${fileName}`;
    }
  };

  useEffect(() => {
    setLoading(true);
    // Fetch photos
    fetchModel(`/photosOfUser/${userId}`)
      .then(data => {
        setPhotos(data);
        return fetchModel(`/user/${userId}`);
      })
      .then(userData => {
        setUser(userData);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching photos:", error);
        setError("Failed to load photos. Please try again later.");
        setLoading(false);
      });
  }, [userId, refreshKey]);

  // Refresh photos when component receives focus (for newly uploaded photos)
  useEffect(() => {
    const handleFocus = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // If advanced features are enabled, redirect to the first photo
  useEffect(() => {
    if (advancedFeaturesEnabled && photos && photos.length > 0) {
      navigate(`/photos/${userId}/${photos[0]._id}`);
    }
  }, [advancedFeaturesEnabled, userId, photos, navigate]);

  // Handle adding a new comment to a specific photo
  const handleCommentAdded = (photoId, newComment) => {
    setPhotos(prevPhotos => 
      prevPhotos.map(photo => 
        photo._id === photoId 
          ? { ...photo, comments: [...photo.comments, newComment] }
          : photo
      )
    );
  };

  // Handle image load error with fallback
  const handleImageError = (e, fileName) => {
    const currentSrc = e.target.src;
    const backendUrl = `${BACKEND_URL}/images/${fileName}`;
    const frontendUrl = `${process.env.PUBLIC_URL}/images/${fileName}`;
    
    console.error('Failed to load image from:', currentSrc);
    
    // Try the other source if current one fails
    if (currentSrc.includes('localhost:3001')) {
      // If backend failed, try frontend
      console.log('Trying frontend URL:', frontendUrl);
      e.target.src = frontendUrl;
    } else {
      // If frontend failed, try backend
      console.log('Trying backend URL:', backendUrl);
      e.target.src = backendUrl;
    }
    
    // If both fail, hide the image
    e.target.onerror = () => {
      console.error('Both image sources failed for:', fileName);
      e.target.style.display = 'none';
    };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container className="user-photos">
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <Container className="user-photos">
        <Typography variant="h5" color="text.secondary">
          No photos found for this user
        </Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="user-photos">
        <Typography variant="h5" color="text.secondary">
          User not found
        </Typography>
      </Container>
    );
  }

  // Format date string to a user-friendly format
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <Container className="user-photos">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Photos of {user.first_name} {user.last_name}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {photos.map((photo) => (
          <Grid item xs={12} key={photo._id}>
            <Card elevation={2} className="photo-card">
              <CardMedia
                component="img"
                className="photo-image"
                image={getImageUrl(photo.file_name)}
                alt={`Photo by ${user.first_name}`}
                onError={(e) => handleImageError(e, photo.file_name)}
              />
              <CardContent>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Posted on: {formatDate(photo.date_time)}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="h6" gutterBottom>
                    Comments ({photo.comments ? photo.comments.length : 0})
                  </Typography>

                  {photo.comments && photo.comments.length > 0 ? (
                    <div className="comments-section">
                      {photo.comments.map((comment) => (
                        <Box key={comment._id} className="comment" mb={2}>
                          <Typography variant="h6" component="div">
                            <Link
                              to={`/users/${comment.user._id}`}
                              style={{
                                textDecoration: "none",
                                color: "primary.main",
                              }}
                            >
                              {comment.user.first_name} {comment.user.last_name}
                            </Link>
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: "1.1rem",
                              my: 1,
                            }}
                          >
                            {comment.comment}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Commented on: {formatDate(comment.date_time)}
                          </Typography>
                          <Divider sx={{ mt: 2 }} />
                        </Box>
                      ))}
                    </div>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No comments on this photo yet. Be the first to comment!
                    </Typography>
                  )}
                </Box>

                {/* Comment Input Section */}
                {currentUser && (
                  <CommentInput
                    photoId={photo._id}
                    currentUser={currentUser}
                    onCommentAdded={(newComment) => handleCommentAdded(photo._id, newComment)}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default UserPhotos;
