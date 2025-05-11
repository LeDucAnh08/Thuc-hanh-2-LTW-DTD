import React, { useState, useEffect } from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  ListItemButton,
  CircularProgress
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

/**
 * Define UserList, a React component of Project 4.
 */
function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetchModel("/user/list")
      .then(data => {
        setUsers(data);
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
            </ListItemButton>
            {index < users.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
}

export default UserList;
