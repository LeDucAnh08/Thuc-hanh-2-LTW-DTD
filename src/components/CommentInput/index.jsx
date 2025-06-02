import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { postModel } from '../../lib/fetchModelData';
import './styles.css';

function CommentInput({ photoId, onCommentAdded, currentUser }) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newComment = await postModel(`/commentsOfPhoto/${photoId}`, {
        comment: comment.trim()
      });
      
      // Clear the input
      setComment('');
      
      // Notify parent component about the new comment
      onCommentAdded(newComment);
      
    } catch (error) {
      setError(error.message || 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 2, mt: 2, backgroundColor: '#f8f9fa' }}>
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        Add a Comment
      </Typography>
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={`What do you think about this photo, ${currentUser?.first_name}?`}
          disabled={isSubmitting}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Commenting as {currentUser?.first_name} {currentUser?.last_name}
          </Typography>
          
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !comment.trim()}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
            sx={{ minWidth: 120 }}
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default CommentInput; 