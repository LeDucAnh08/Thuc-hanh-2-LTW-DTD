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
  CircularProgress,
  Paper
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

/**
 * UserComments component shows all comments made by a specific user
 */
function UserComments() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    // First fetch the user information
    fetchModel(`/user/${userId}`)
      .then(userData => {
        setUser(userData);
        
        // Get all users to fetch all photos
        return fetchModel(`/user/list`);
      })
      .then(allUsers => {
        // Get all photos from all users
        const allPhotosPromises = allUsers.map(user => 
          fetchModel(`/photosOfUser/${user._id}`)
        );
        
        return Promise.all(allPhotosPromises);
      })
      .then(allPhotoLists => {
        // Flatten all photos
        const allPhotos = allPhotoLists.flat();
        
        // Find all comments made by this user
        const comments = [];
        
        allPhotos.forEach(photo => {
          if (photo.comments) {
            const userCommentsOnPhoto = photo.comments.filter(
              comment => comment.user._id === userId
            );
            
            // Add photo information to each comment
            userCommentsOnPhoto.forEach(comment => {
              comments.push({
                ...comment,
                photo: {
                  _id: photo._id,
                  file_name: photo.file_name,
                  user_id: photo.user_id
                }
              });
            });
          }
        });
        
        // Sort comments by date (most recent first)
        comments.sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
        
        setUserComments(comments);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user comments:", error);
        setError("Failed to load comments. Please try again later.");
        setLoading(false);
      });
  }, [userId]);

  const handleCommentClick = (photoId) => {
    navigate(`/photos/${userId}/${photoId}`);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      <Box p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container className="user-comments">
      <Typography variant="h4" component="h1" gutterBottom>
        Comments by {user.first_name} {user.last_name}
      </Typography>
      
      {userComments.length === 0 ? (
        <Paper sx={{ p: 2 }}>
          <Typography>This user hasn't made any comments yet.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {userComments.map((comment) => (
            <Grid item xs={12} key={comment._id}>
              <Card 
                className="comment-card"
                onClick={() => handleCommentClick(comment.photo._id)}
                sx={{ cursor: 'pointer' }}
              >
                <Grid container>
                  <Grid item xs={12} sm={3} md={2}>
                    <CardMedia
                      component="img"
                      className="comment-photo-thumbnail"
                      image={`https://7xxj88-3001.csb.app/images/${comment.photo.file_name}`}
                      alt="Photo thumbnail"
                    />
                  </Grid>
                  <Grid item xs={12} sm={9} md={10}>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {formatDate(comment.date_time)}
                      </Typography>
                      <Typography variant="body1" className="comment-text">
                        {comment.comment}
                      </Typography>
                    </CardContent>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default UserComments; 