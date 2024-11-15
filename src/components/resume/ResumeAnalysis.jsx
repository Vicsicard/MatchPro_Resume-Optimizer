import React, { useState } from 'react';
import {
  Box,
  Card,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import {
  Check,
  Close,
  TrendingUp,
  Warning,
  School,
  Work,
  Code,
} from '@mui/icons-material';
import { resumeAnalysisService } from '../../services/resumeAnalysisService';

export const ResumeAnalysis = ({ resumeText, jobPostingText, onAnalysisComplete }) => {
  const [analysis, setAnalysis] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeResume = async () => {
    try {
      setLoading(true);
      setError('');

      // Get both analysis and match score in parallel
      const [analysisData, scoreData] = await Promise.all([
        resumeAnalysisService.analyzeResume(resumeText, jobPostingText),
        resumeAnalysisService.getMatchScore(resumeText, jobPostingText)
      ]);

      setAnalysis(analysisData);
      setMatchScore(scoreData);
      
      if (onAnalysisComplete) {
        onAnalysisComplete({ analysis: analysisData, score: scoreData });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!analysis || !matchScore) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Overall Match Score */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Overall Match Score
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CircularProgress
            variant="determinate"
            value={matchScore.overallScore}
            size={60}
            thickness={4}
            sx={{
              color: theme =>
                matchScore.overallScore > 75
                  ? theme.palette.success.main
                  : matchScore.overallScore > 50
                  ? theme.palette.warning.main
                  : theme.palette.error.main,
            }}
          />
          <Typography variant="h4" sx={{ ml: 2 }}>
            {matchScore.overallScore}%
          </Typography>
        </Box>
        <Typography color="text.secondary">
          {matchScore.quickSummary}
        </Typography>
      </Card>

      {/* Category Scores */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Category Scores
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <Code />
            </ListItemIcon>
            <ListItemText
              primary="Skills Match"
              secondary={`${matchScore.categoryScores.skills}% match`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Work />
            </ListItemIcon>
            <ListItemText
              primary="Experience Match"
              secondary={`${matchScore.categoryScores.experience}% match`}
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <School />
            </ListItemIcon>
            <ListItemText
              primary="Education Match"
              secondary={`${matchScore.categoryScores.education}% match`}
            />
          </ListItem>
        </List>
      </Card>

      {/* Keyword Analysis */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Keyword Analysis
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Matched Keywords
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {analysis.keywordMatches.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                color="success"
                icon={<Check />}
              />
            ))}
          </Box>
        </Box>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Missing Keywords
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {analysis.missingKeywords.map((keyword, index) => (
              <Chip
                key={index}
                label={keyword}
                color="error"
                icon={<Close />}
              />
            ))}
          </Box>
        </Box>
      </Card>

      {/* Improvement Suggestions */}
      <Card sx={{ mb: 3, p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Improvement Suggestions
        </Typography>
        <List>
          {analysis.improvementSuggestions.map((suggestion, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <TrendingUp />
              </ListItemIcon>
              <ListItemText primary={suggestion} />
            </ListItem>
          ))}
        </List>
      </Card>

      {/* Format Issues */}
      {analysis.formatIssues.length > 0 && (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            ATS Format Issues
          </Typography>
          <List>
            {analysis.formatIssues.map((issue, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Warning color="warning" />
                </ListItemIcon>
                <ListItemText primary={issue} />
              </ListItem>
            ))}
          </List>
        </Card>
      )}
    </Box>
  );
};
