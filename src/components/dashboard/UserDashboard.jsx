import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Download,
  Delete,
  Visibility,
  History,
  WorkOutline,
  TrendingUp,
} from '@mui/icons-material';

export const UserDashboard = ({ optimizationHistory = [] }) => {
  const [selectedOptimization, setSelectedOptimization] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Resume Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your resume optimizations and job applications
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <History color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Total Optimizations
                </Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {optimizationHistory.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WorkOutline color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Jobs Applied
                </Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {optimizationHistory.filter(h => h.applied).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Average Match Score
                </Typography>
              </Box>
              <Typography variant="h3" color="primary">
                {optimizationHistory.length > 0
                  ? Math.round(
                      optimizationHistory.reduce((acc, curr) => acc + curr.matchScore, 0) /
                      optimizationHistory.length
                    )
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Optimization History */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Optimizations
            </Typography>
            <List>
              {optimizationHistory.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={item.jobTitle}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {item.company}
                          </Typography>
                          {' — '}{formatDate(item.date)}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="view"
                        onClick={() => setSelectedOptimization(item)}
                        sx={{ mr: 1 }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="download"
                        onClick={() => window.open(item.resumeUrl)}
                        sx={{ mr: 1 }}
                      >
                        <Download />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => {/* Handle delete */}}
                      >
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < optimizationHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {optimizationHistory.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No optimizations yet"
                    secondary="Start by optimizing your resume for a job posting"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
