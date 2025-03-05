import React, { useState } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemText, 
  ListItemAvatar, Avatar, Divider, IconButton, Tooltip,
  Chip, Dialog, DialogContent, Card, CardMedia,
  MenuItem, Menu, Button, LinearProgress
} from '@mui/material';
import { 
  Comment as CommentIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  DeleteOutline as DeleteIcon,
  AttachFile as AttachmentIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

// Function to determine icon for attachment based on file type
const getAttachmentIcon = (attachment) => {
  const fileType = attachment.split('.').pop().toLowerCase();
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
  const pdfType = 'pdf';
  
  if (imageTypes.includes(fileType)) {
    return <ImageIcon />;
  } else if (fileType === pdfType) {
    return <PdfIcon />;
  } else {
    return <FileIcon />;
  }
};

const CommentList = ({ comments = [], onDeleteComment }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAttachmentClick = (attachmentUrl) => {
    // If it's an image, open in dialog
    const fileType = attachmentUrl.split('.').pop().toLowerCase();
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
    
    if (imageTypes.includes(fileType)) {
      setSelectedImage(attachmentUrl);
    } else {
      // For other file types, open in a new tab
      window.open(attachmentUrl, '_blank');
    }
  };
  
  const handleMenuClick = (event, commentId) => {
    setAnchorEl(event.currentTarget);
    setSelectedCommentId(commentId);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedCommentId(null);
  };
  
  const handleDeleteComment = async () => {
    if (!selectedCommentId) return;
    
    setLoading(true);
    
    try {
      // Call the delete function passed as prop
      if (onDeleteComment) {
        await onDeleteComment(selectedCommentId);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    } finally {
      setLoading(false);
      handleCloseMenu();
    }
  };
  
  // Mock function to get user by ID (in a real app this would be from your user context or data)
  const getUserById = (userId) => {
    // These would come from your users database
    const mockUsers = {
      '12345': { name: 'John Doe', avatar: null, role: 'Manager' },
      '67890': { name: 'Jane Smith', avatar: null, role: 'Maintenance' },
      '13579': { name: 'Bob Johnson', avatar: null, role: 'Housekeeping' }
    };
    
    return mockUsers[userId] || { name: 'Unknown User', avatar: null, role: 'Staff' };
  };
  
  if (comments.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <CommentIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">
            Comments
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="textSecondary" align="center">
          No comments yet. Be the first to add a comment.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <CommentIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Comments ({comments.length})
        </Typography>
      </Box>
      
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      <Divider sx={{ mb: 2 }} />
      
      <List>
        {comments.map((comment, index) => {
          const user = getUserById(comment.userId);
          
          return (
            <React.Fragment key={comment._id || index}>
              <ListItem 
                alignItems="flex-start"
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    aria-label="comment actions"
                    onClick={(e) => handleMenuClick(e, comment._id)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar alt={user.name} src={user.avatar}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center">
                      <Typography variant="subtitle1" component="span">
                        {user.name}
                      </Typography>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                        {formatDistanceToNow(new Date(comment.created), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                        sx={{ display: 'block', mt: 1, whiteSpace: 'pre-wrap' }}
                      >
                        {comment.text}
                      </Typography>
                      
                      {comment.attachments && comment.attachments.length > 0 && (
                        <Box mt={1}>
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                            <AttachmentIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                            Attachments:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {comment.attachments.map((attachment, attIndex) => (
                              <Tooltip title={attachment} key={attIndex}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={getAttachmentIcon(attachment)}
                                  onClick={() => handleAttachmentClick(attachment)}
                                  sx={{ textTransform: 'none' }}
                                >
                                  {attachment.split('/').pop().substring(0, 15)}
                                  {attachment.split('/').pop().length > 15 ? '...' : ''}
                                </Button>
                              </Tooltip>
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  }
                />
              </ListItem>
              {index < comments.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          );
        })}
      </List>
      
      {/* Image Preview Dialog */}
      <Dialog
        open={Boolean(selectedImage)}
        onClose={() => setSelectedImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 1 }}>
          {selectedImage && (
            <Card>
              <CardMedia
                component="img"
                image={selectedImage}
                alt="Attachment preview"
                sx={{ 
                  maxHeight: '80vh', 
                  objectFit: 'contain',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedImage(null)}
              />
            </Card>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Comment Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleDeleteComment} disabled={loading}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Comment
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default CommentList;