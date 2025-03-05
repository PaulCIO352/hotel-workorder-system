import React, { useState } from 'react';
import { 
  Box, TextField, Button, Paper, Typography, 
  CircularProgress, Alert
} from '@mui/material';
import { 
  Send as SendIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';

const CommentForm = ({ onAddComment, workOrderId }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Mock user ID - in a real app, you would get this from authentication
  const userId = '12345';
  
  const handleTextChange = (e) => {
    setText(e.target.value);
    // Clear success message when user starts typing again
    if (success) setSuccess(false);
  };
  
  const handleFileChange = (e) => {
    const fileList = Array.from(e.target.files);
    setAttachments(fileList);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!text.trim()) {
      setError('Comment text is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create comment object
      const newComment = {
        text,
        userId,
        workOrderId,
        attachments
      };
      
      // Call the onAddComment function passed as prop
      await onAddComment(newComment);
      
      // Reset form
      setText('');
      setAttachments([]);
      setSuccess(true);
      
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add Comment
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Comment added successfully!
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Type your comment here..."
          label="Comment"
          value={text}
          onChange={handleTextChange}
          disabled={loading}
          sx={{ mb: 2 }}
        />
        
        <input
          accept="image/*,application/pdf"
          style={{ display: 'none' }}
          id="attachment-button"
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={loading}
        />
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <label htmlFor="attachment-button">
              <Button
                component="span"
                startIcon={<AttachFileIcon />}
                disabled={loading}
                sx={{ mr: 1 }}
              >
                Attach Files
              </Button>
            </label>
            
            {attachments.length > 0 && (
              <Typography variant="body2" component="span" color="textSecondary">
                {attachments.length} file(s) selected
              </Typography>
            )}
          </Box>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            disabled={loading || !text.trim()}
          >
            {loading ? 'Sending...' : 'Post Comment'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CommentForm;