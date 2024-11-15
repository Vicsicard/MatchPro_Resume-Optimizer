import React from 'react';
import {
  Box,
  Card,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import {
  Check,
  AutoFixHigh,
  FormatSize,
  Psychology,
  Spellcheck,
  Style,
} from '@mui/icons-material';

export const OptimizationFeedback = ({
  improvements,
  keywordsAdded,
  formattingFixes,
  atsImprovements,
}) => {
  return (
    <Box sx={{ mt: 2 }}>
      {/* ATS Improvements */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoFixHigh sx={{ mr: 1 }} /> ATS Optimization Improvements
        </Typography>
        <List>
          {atsImprovements.map((improvement, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Check color="success" />
              </ListItemIcon>
              <ListItemText primary={improvement} />
            </ListItem>
          ))}
        </List>
      </Card>

      {/* Keywords Added */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Psychology sx={{ mr: 1 }} /> Keywords Optimized
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {keywordsAdded.map((keyword, index) => (
            <Chip
              key={index}
              label={keyword}
              color="primary"
              icon={<Check />}
              variant="outlined"
            />
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary">
          These industry-relevant keywords have been strategically incorporated to improve your resume's visibility.
        </Typography>
      </Card>

      {/* Formatting Improvements */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FormatSize sx={{ mr: 1 }} /> Formatting Enhancements
        </Typography>
        <List>
          {formattingFixes.map((fix, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Style color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={fix.description}
                secondary={fix.reason}
              />
            </ListItem>
          ))}
        </List>
      </Card>

      {/* Content Improvements */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Spellcheck sx={{ mr: 1 }} /> Content Enhancements
        </Typography>
        <List>
          {improvements.map((improvement, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Check color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={improvement.what}
                secondary={improvement.why}
              />
            </ListItem>
          ))}
        </List>
      </Card>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'info.main', color: 'info.contrastText', borderRadius: 1 }}>
        <Typography variant="subtitle1" align="center">
          Your resume has been automatically optimized with these improvements.
          The optimized version is ready to use in the "Optimized Resume" tab.
        </Typography>
      </Box>
    </Box>
  );
};
