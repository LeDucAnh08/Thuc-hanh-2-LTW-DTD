import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  ListItemButton,
  CircularProgress,
  Badge,
  Chip
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserList, a React component of Project 4.
 */
function UserList() {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchModel("/user/list")
      .then(data => {
        setUsers(data);
        
        // Fetch photo counts and comment counts for each user
        const statsPromises = data.map(user => {
          return fetchModel(`/photosOfUser/${user._id}`)
            .then(photos => {
              // Count total comments by this user across all photos
              let userCommentCount = 0;
              
              // Get all photos to count comments by this user
              return fetchModel(`/user/list`)
                .then(allUsers => {
                  const allPhotosPromises = allUsers.map(u => 
                    fetchModel(`/photosOfUser/${u._id}`)
                  );
                  
                  return Promise.all(allPhotosPromises)
                    .then(allPhotoLists => {
                      // Flatten all photos
                      const allPhotos = allPhotoLists.flat();
                      
                      // Count comments by this user
                      allPhotos.forEach(photo => {
                        if (photo.comments) {
                          userCommentCount += photo.comments.filter(
                            comment => comment.user._id === user._id
                          ).length;
                        }
                      });
                      
                      return {
                        userId: user._id,
                        photoCount: photos.length,
                        commentCount: userCommentCount
                      };
                    });
                });
            });
        });
        
        return Promise.all(statsPromises);
      })
      .then(statsArray => {
        const statsMap = {};
        statsArray.forEach(stat => {
          statsMap[stat.userId] = {
            photoCount: stat.photoCount,
            commentCount: stat.commentCount
          };
        });
        setUserStats(statsMap);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching user list:", error);
        setError("Failed to load users. Please try again later.");
        setLoading(false);
      });
  }, []);

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };
  
  const handleCommentCountClick = (event, userId) => {
    event.stopPropagation();
    navigate(`/comments/${userId}`);
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
    <Box className="user-list">
      <Typography 
        variant="h6" 
        component="h2" 
        gutterBottom 
        sx={{ px: 2, pt: 2 }}
      >
        Users
      </Typography>
      <List component="nav">
        {users.map((user, index) => (
          <React.Fragment key={user._id}>
            <ListItemButton 
              onClick={() => handleUserClick(user._id)}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <ListItemText 
                primary={`${user.first_name} ${user.last_name}`}
              />
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={userStats[user._id]?.photoCount || 0}
                  size="small"
                  sx={{ 
                    bgcolor: 'success.main',
                    color: 'white',
                    minWidth: '30px'
                  }}
                />
                <Chip
                  label={userStats[user._id]?.commentCount || 0}
                  size="small"
                  onClick={(e) => handleCommentCountClick(e, user._id)}
                  sx={{ 
                    bgcolor: 'error.main',
                    color: 'white',
                    minWidth: '30px',
                    cursor: 'pointer'
                  }}
                />
              </Box>
            </ListItemButton>
            {index < users.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export default UserList;
