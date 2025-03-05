import React, { useState, useRef } from 'react';
import { 
  Box, Typography, Button, IconButton,
  Card, CardMedia, Grid, CircularProgress,
  Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Close as CloseIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';

/**
 * Image Upload component that allows users to upload and preview multiple images
 * 
 * @param {Object} props
 * @param {function} props.onChange - Function called when files are added or removed
 * @param {Array} props.initialImages - Array of image URLs to show initially
 * @param {number} props.maxImages - Maximum number of images allowed
 * @param {boolean} props.disabled - Whether the component is disabled
 * @param {string} props.label - Label for the upload button
 * @param {string} props.helperText - Helper text below the component
 * @param {boolean} props.preview - Whether to show image previews
 */
const ImageUpload = ({ 
  onChange, 
  initialImages = [], 
  maxImages = 5,
  disabled = false,
  label = "Upload Images",
  helperText = `You can upload up to ${maxImages} images`,
  preview = true
}) => {
  const [images, setImages] = useState(initialImages);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (event) => {
    if (disabled) return;
    
    const files = Array.from(event.target.files);
    
    if (!files.length) return;
    
    // Check if adding new files would exceed the maximum
    if (files.length + images.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }
    
    setLoading(true);
    
    // Process each file to create preview URLs
    const newImages = files.map(file => {
      // For files, we'll create a temporary URL for preview
      return {
        file: file,
        url: URL.createObjectURL(file),
        name: file.name
      };
    });
    
    const updatedImages = [...images, ...newImages];
    setImages(updatedImages);
    
    // Extract just the File objects for the onChange handler
    const fileObjects = updatedImages
      .filter(img => img.file)
      .map(img => img.file);
    
    // Add any string URLs from initialImages
    const stringUrls = updatedImages
      .filter(img => typeof img === 'string' || !img.file);
    
    if (onChange) {
      onChange([...fileObjects, ...stringUrls]);
    }
    
    setLoading(false);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle image deletion
  const handleDeleteImage = (indexToDelete) => {
    if (disabled) return;
    
    // Filter out the image to delete
    const updatedImages = images.filter((_, index) => index !== indexToDelete);
    setImages(updatedImages);
    
    // Extract files and URLs for the onChange handler
    const fileObjects = updatedImages
      .filter(img => img.file)
      .map(img => img.file);
    
    const stringUrls = updatedImages
      .filter(img => typeof img === 'string' || !img.file);
    
    if (onChange) {
      onChange([...fileObjects, ...stringUrls]);
    }
  };
  
  // Handle opening the preview dialog
  const handleOpenPreview = (image) => {
    if (typeof image === 'string') {
      setPreviewImage(image);
    } else {
      setPreviewImage(image.url);
    }
  };
  
  // Handle closing the preview dialog
  const handleClosePreview = () => {
    setPreviewImage(null);
  };
  
  // Open the file selector
  const handleClickUpload = () => {
    if (fileInputRef.current && !disabled) {
      fileInputRef.current.click();
    }
  };
  
  // Get the URL for an image (handles both string URLs and file objects)
  const getImageUrl = (image) => {
    if (typeof image === 'string') {
      return image;
    }
    return image.url;
  };
  
  // Get the name/label for an image
  const getImageName = (image, index) => {
    if (typeof image === 'string') {
      // Extract filename from URL
      const parts = image.split('/');
      return parts[parts.length - 1] || `Image ${index + 1}`;
    }
    return image.name || `Image ${index + 1}`;
  };
  
  return (
    <Box>
      <Box 
        sx={{ 
          border: '1px dashed',
          borderColor: 'grey.400',
          borderRadius: 1,
          p: 2,
          mb: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <input
          accept="image/*"
          type="file"
          multiple
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: 'none' }}
          disabled={disabled || images.length >= maxImages}
        />
        
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          justifyContent="center"
        >
          <UploadIcon fontSize="large" color="primary" sx={{ mb: 1 }} />
          
          <Typography variant="subtitle1" align="center" gutterBottom>
            {label}
          </Typography>
          
          <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
            {helperText}
          </Typography>
          
          <Button
            variant="contained"
            component="span"
            startIcon={<AddIcon />}
            onClick={handleClickUpload}
            disabled={disabled || images.length >= maxImages || loading}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Select Images'}
          </Button>
        </Box>
      </Box>
      
      {preview && images.length > 0 && (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={6} sm={4} md={3} key={index}>
              <Card variant="outlined">
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={getImageUrl(image)}
                    alt={getImageName(image, index)}
                    sx={{ objectFit: 'cover' }}
                  />
                  
                  <Box 
                    sx={{ 
                      position: 'absolute', 
                      top: 0, 
                      right: 0, 
                      display: 'flex',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      borderRadius: '0 0 0 8px'
                    }}
                  >
                    <IconButton 
                      size="small" 
                      onClick={() => handleOpenPreview(image)} 
                      sx={{ color: 'white' }}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                    
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteImage(index)}
                      disabled={disabled}
                      sx={{ color: 'white' }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box p={1}>
                  <Typography variant="body2" noWrap>
                    {getImageName(image, index)}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Image Preview Dialog */}
      <Dialog 
        open={Boolean(previewImage)} 
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Image Preview
          <IconButton
            aria-label="close"
            onClick={handleClosePreview}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                maxHeight: '70vh', 
                objectFit: 'contain' 
              }} 
            />
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImageUpload;