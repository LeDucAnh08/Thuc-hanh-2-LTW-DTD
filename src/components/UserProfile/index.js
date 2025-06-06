import React, { useState, useEffect } from "react";
import { Typography, Button, Card, CardContent, CardActions, CircularProgress, Box, TextField, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

import "./style.css";
import { useParams } from "react-router-dom";
import fetchModel, { updateModel } from "../../lib/fetchModelData";

function UserProfile({ user }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         login_name: user.login_name || "",
//         password: "",
//         first_name: user.first_name || "",
//         last_name: user.last_name || "",
//         location: user.location || "",
//         description: user.description || "",
//         occupation: user.occupation || ""
//       });
//     }
//   }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateModel(`/user/${user._id}`, formData);
      localStorage.setItem('user', JSON.stringify(response.user));
      setSuccess(true);
      
      // Redirect to user detail page after 2 seconds
      setTimeout(() => {
        navigate(`/users/${user._id}`);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Typography variant="h5">User not found</Typography>;
  }

  return (
    <div className="user-profile">
      <Card className="profile-card">
        <CardContent>
          <Typography variant="h4" component="h2" gutterBottom>
            Update Profile
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully! Redirecting...</Alert>}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Login Name"
              name="login_name"
              value={formData.login_name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="New password"
              name="password"
              type="password"
              onChange={handleChange}
              margin="normal"
              placeholder="Enter new password if needed"
            />
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <Box mt={2}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : "Update Profile"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserProfile;