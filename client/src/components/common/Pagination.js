import React from 'react';
import { 
  Box, Pagination as MuiPagination, 
  FormControl, InputLabel, Select, MenuItem,
  Typography, useTheme, useMediaQuery
} from '@mui/material';

/**
 * Custom pagination component with page size selector
 * 
 * @param {Object} props
 * @param {number} props.count - Total number of items
 * @param {number} props.page - Current page (1-based)
 * @param {number} props.pageSize - Number of items per page
 * @param {Array} props.pageSizeOptions - Available page size options
 * @param {function} props.onPageChange - Function called when page changes
 * @param {function} props.onPageSizeChange - Function called when page size changes
 * @param {boolean} props.showPageSizeSelector - Whether to show the page size selector
 * @param {boolean} props.showItemCounts - Whether to show item count text
 * @param {Object} props.sx - Additional styles to apply
 */
const Pagination = ({ 
  count = 0, 
  page = 1, 
  pageSize = 10, 
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  showItemCounts = true,
  sx = {}
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Calculate total pages
  const totalPages = Math.ceil(count / pageSize);
  
  // Calculate item indices for display
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, count);
  
  // Handle page change event
  const handlePageChange = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
  };
  
  // Handle page size change event
  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };
  
  // Don't render if there's only one page and no page size selector
  if (totalPages <= 1 && !showPageSizeSelector && !showItemCounts) {
    return null;
  }
  
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      justifyContent="space-between" 
      flexWrap="wrap"
      gap={2}
      sx={{ py: 2, ...sx }}
    >
      {showItemCounts && count > 0 && (
        <Typography variant="body2" color="textSecondary">
          {isMobile ? (
            `${startItem}-${endItem} of ${count}`
          ) : (
            `Showing ${startItem} to ${endItem} of ${count} entries`
          )}
        </Typography>
      )}
      
      <Box display="flex" alignItems="center" gap={2} ml="auto">
        {showPageSizeSelector && (
          <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
            <InputLabel id="page-size-selector-label">Per Page</InputLabel>
            <Select
              labelId="page-size-selector-label"
              id="page-size-selector"
              value={pageSize}
              onChange={handlePageSizeChange}
              label="Per Page"
            >
              {pageSizeOptions.map(option => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        
        {totalPages > 1 && (
          <MuiPagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? "small" : "medium"}
            showFirstButton={!isMobile}
            showLastButton={!isMobile}
          />
        )}
      </Box>
    </Box>
  );
};

export default Pagination;