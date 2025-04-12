import React from "react";
import { Typography, Button, Card, CardContent, CardActions } from "@mui/material";
import { Link } from "react-router-dom";

import "./styles.css";
import { useParams } from "react-router-dom";
import models from "../../modelData/models";

/**
 * Define UserDetail, a React component of Project 4.
 */
function UserDetail() {
  const { userId } = useParams();
  const user = models.userModel(userId);

  if (!user) {
    return <Typography variant="h5">User not found</Typography>;
  }

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
        </CardActions>
      </Card>
    </div>
  );
}

export default UserDetail;
