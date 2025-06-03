import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  Container,
  Divider,
  CircularProgress
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { Link, useNavigate, useParams } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import CommentInput from "../CommentInput";
import { useFeatures } from "../../context/FeatureContext";

const API_BASE_URL = 'http://localhost:3001';
// const API_BASE_URL = 'https://lpq7hx-3001.csb.app';

function PhotoViewer({ currentUser }) {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();
  const { advancedFeaturesEnabled } = useFeatures();
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Backend server URL - adjust this based on your backend configuration
  const BACKEND_URL = API_BASE_URL;

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

  // Handle image load error with fallback
  const handleImageError = (e, fileName) => {
    const currentSrc = e.target.src;
    const backendUrl = `${BACKEND_URL}/images/${fileName}`;
    const frontendUrl = `${process.env.PUBLIC_URL}/images/${fileName}`;
    
    console.error('Failed to load image from:', currentSrc);
    
    // Try the other source if current one fails
    if (currentSrc.includes(API_BASE_URL)) {
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
        console.error("Error fetching photo data:", error);
        setError("Failed to load photo data. Please try again later.");
        setLoading(false);
      });
  }, [userId]);

  // Redirect to photos list if advanced features are disabled
  useEffect(() => {
    if (!advancedFeaturesEnabled) {
      navigate(`/photos/${userId}`);
    }
  }, [advancedFeaturesEnabled, userId, navigate]);

  // Handle adding a new comment to the current photo
  const handleCommentAdded = (newComment) => {
    setPhotos(prevPhotos => 
      prevPhotos.map(photo => 
        photo._id === photoId 
          ? { ...photo, comments: [...photo.comments, newComment] }
          : photo
      )
    );
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
      <Container>
        <Typography variant="h5" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!photos || photos.length === 0 || !user) {
    return (
      <Container>
        <Typography variant="h5" color="text.secondary">
          No photos found
        </Typography>
      </Container>
    );
  }

  // Find current photo index
  const currentPhotoIndex = photos.findIndex((photo) => photo._id === photoId);
  const currentPhoto = photos[currentPhotoIndex];

  if (currentPhotoIndex === -1 || !currentPhoto) {
    return (
      <Container>
        <Typography variant="h5" color="text.secondary">
          Photo not found
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

  // Handle navigation between photos
  const handleNavigate = (direction) => {
    const newIndex = currentPhotoIndex + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
      navigate(`/photos/${userId}/${photos[newIndex]._id}`);
    }
  };

  return (
    <Container className="photo-viewer">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Photos of {user.first_name} {user.last_name}
        </Typography>
      </Box>

      <Card elevation={2} className="photo-card">
        <Box className="stepper-container">
          <IconButton
            onClick={() => handleNavigate(-1)}
            disabled={currentPhotoIndex === 0}
            size="large"
          >
            <ArrowBackIcon />
          </IconButton>

          <CardMedia
            component="img"
            className="photo-image"
            image={getImageUrl(currentPhoto.file_name)}
            alt={`Photo by ${user.first_name}`}
            onError={(e) => handleImageError(e, currentPhoto.file_name)}
          />

          <IconButton
            onClick={() => handleNavigate(1)}
            disabled={currentPhotoIndex === photos.length - 1}
            size="large"
          >
            <ArrowForwardIcon />
          </IconButton>
        </Box>

        <CardContent>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Photo {currentPhotoIndex + 1} of {photos.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Posted on: {formatDate(currentPhoto.date_time)}
            </Typography>
          </Box>

          <Box mb={2}>
            <Typography variant="h6" gutterBottom>
              Comments ({currentPhoto.comments ? currentPhoto.comments.length : 0})
            </Typography>

            {currentPhoto.comments && currentPhoto.comments.length > 0 ? (
              <div className="comments-section">
                {currentPhoto.comments.map((comment) => (
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
                      {formatDate(comment.date_time)}
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
              photoId={currentPhoto._id}
              currentUser={currentUser}
              onCommentAdded={handleCommentAdded}
            />
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default PhotoViewer;
