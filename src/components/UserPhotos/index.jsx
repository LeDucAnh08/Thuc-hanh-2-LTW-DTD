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
  }, [userId]);

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
                image={`${process.env.PUBLIC_URL}/images/${photo.file_name}`}
                alt={`Photo by ${user.first_name}`}
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
