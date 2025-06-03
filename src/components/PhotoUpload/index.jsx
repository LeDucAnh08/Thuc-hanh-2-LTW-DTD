import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardMedia,
  Snackbar
} from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import { postModelWithFile } from '../../lib/fetchModelData';
import './styles.css';

function PhotoUpload({ open, onClose, onPhotoUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setUploadError('');
    
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Please select a valid image file (JPEG, PNG, GIF, BMP, WebP)');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setUploadError('File size must be less than 10MB');
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      // Debug: Log the API base URL and token
      console.log('API Base URL:', 'http://localhost:3001');
      console.log('Has token:', !!localStorage.getItem('jwt_token'));
      
      const formData = new FormData();
      formData.append('uploadedphoto', selectedFile);

      console.log('Attempting to upload to:', 'http://localhost:3001/photos/new');
      const result = await postModelWithFile('/photos/new', formData);

      // Success
      setShowSuccess(true);
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (onPhotoUploaded) {
          onPhotoUploaded(result.photo);
        }
        handleClose();
      }, 1500); // Show success message for 1.5 seconds
    } catch (error) {
      console.error('Upload error details:', error);
      console.error('Error message:', error.message);
      
      // More specific error messages
      if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
        setUploadError('Cannot connect to server. Please make sure the backend server is running on http://localhost:3001');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setUploadError('Authentication failed. Please login again.');
      } else if (error.message.includes('400')) {
        setUploadError(error.message || 'Invalid request. Please check your file and try again.');
      } else {
        setUploadError(error.message || 'Upload failed. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadError('');
    setShowSuccess(false);
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={!uploading ? handleClose : undefined}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CloudUpload color="primary" />
            <Typography variant="h6">Upload New Photo</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Success Message */}
            {showSuccess && (
              <Alert 
                severity="success" 
                sx={{ mb: 2 }}
                icon={<CheckCircle />}
              >
                Photo uploaded successfully! Redirecting to your photos...
              </Alert>
            )}

            {/* File Input Section */}
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <input
                type="file"
                id="photo-input"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                disabled={uploading || showSuccess}
              />
              <label htmlFor="photo-input">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<CloudUpload />}
                  size="large"
                  sx={{ minWidth: 200 }}
                  disabled={uploading || showSuccess}
                >
                  {selectedFile ? selectedFile.name : 'Choose Photo'}
                </Button>
              </label>
            </Box>

            {/* Preview Section */}
            {previewUrl && (
              <Box display="flex" justifyContent="center">
                <Card sx={{ maxWidth: 400, maxHeight: 300 }}>
                  <CardMedia
                    component="img"
                    image={previewUrl}
                    alt="Preview"
                    sx={{ 
                      maxHeight: 300,
                      objectFit: 'contain'
                    }}
                  />
                </Card>
              </Box>
            )}

            {/* Error Message */}
            {uploadError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {uploadError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ padding: 3, gap: 2 }}>
          <Button
            onClick={handleClose}
            disabled={uploading}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || showSuccess}
            variant="contained"
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PhotoUpload; 