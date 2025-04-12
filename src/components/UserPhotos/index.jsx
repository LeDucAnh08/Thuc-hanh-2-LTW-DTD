import React from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Grid,
  Container,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useFeatures } from "../../context/FeatureContext";
import { useEffect } from "react";

import "./styles.css";
import { useParams } from "react-router-dom";
import models from "../../modelData/models";

/**
 * Define UserPhotos, a React component of Project 4.
 */
function UserPhotos() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { advancedFeaturesEnabled } = useFeatures();
  const photos = models.photoOfUserModel(userId);
  const user = models.userModel(userId);

  // If advanced features are enabled, redirect to the first photo
  useEffect(() => {
    if (advancedFeaturesEnabled && photos && photos.length > 0) {
      navigate(`/photos/${userId}/${photos[0]._id}`);
    }
  }, [advancedFeaturesEnabled, userId, photos, navigate]);

  if (!photos || photos.length === 0) {
    return (
      <Container className="user-photos">
        <Typography variant="h5" color="text.secondary">
          No photos found for this user
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
                    Comments
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
                    <Typography variant="body2" color="text.secondary">
                      No comments on this photo
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default UserPhotos;
