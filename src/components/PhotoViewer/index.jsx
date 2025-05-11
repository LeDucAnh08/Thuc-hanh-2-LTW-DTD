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

function PhotoViewer() {
  const { userId, photoId } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            image={`${process.env.PUBLIC_URL}/images/${currentPhoto.file_name}`}
            alt={`Photo by ${user.first_name}`}
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
              Comments
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
              <Typography variant="body2" color="text.secondary">
                No comments on this photo
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export default PhotoViewer;
