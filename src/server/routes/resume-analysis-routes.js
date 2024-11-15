import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Analyze resume endpoint
router.post('/analyze-resume', async (req, res) => {
  try {
    const { resumeText, jobPostingText } = req.body;

    if (!resumeText || !jobPostingText) {
      return res.status(400).json({
        error: 'Both resume and job posting texts are required'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "You are an expert resume analyst that provides detailed feedback on how well a resume matches a job posting."
      }, {
        role: "user",
        content: `
        Please analyze this resume against the job posting and provide detailed feedback in the following JSON format:
        {
          "matchScore": number between 0-100,
          "keywordMatches": [list of matched keywords],
          "missingKeywords": [important keywords from job posting not found in resume],
          "skillsAnalysis": {
            "matched": [matched skills],
            "missing": [missing important skills],
            "additional": [skills in resume but not in job posting]
          },
          "sectionFeedback": {
            "experience": string with feedback on experience section,
            "education": string with feedback on education section,
            "skills": string with feedback on skills section
          },
          "improvementSuggestions": [list of specific suggestions],
          "formatIssues": [any ATS formatting concerns]
        }

        Resume:
        ${resumeText}

        Job Posting:
        ${jobPostingText}
        `
      }],
      temperature: 0.7,
      max_tokens: 2048
    });

    const analysis = JSON.parse(completion.choices[0].message.content);
    res.json(analysis);

  } catch (error) {
    console.error('Resume analysis failed:', error);
    res.status(500).json({
      error: 'Failed to analyze resume',
      details: error.message
    });
  }
});

// Calculate match score endpoint
router.post('/match-score', async (req, res) => {
  try {
    const { resumeText, jobPostingText } = req.body;

    if (!resumeText || !jobPostingText) {
      return res.status(400).json({
        error: 'Both resume and job posting texts are required'
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "You are an expert at calculating how well a resume matches a job posting."
      }, {
        role: "user",
        content: `
        Calculate a match score between this resume and job posting. Return a JSON object with:
        {
          "overallScore": number between 0-100,
          "categoryScores": {
            "skills": number between 0-100,
            "experience": number between 0-100,
            "education": number between 0-100,
            "keywords": number between 0-100
          },
          "quickSummary": one-line summary of the match
        }

        Resume:
        ${resumeText}

        Job Posting:
        ${jobPostingText}
        `
      }],
      temperature: 0.3,
      max_tokens: 1024
    });

    const matchScore = JSON.parse(completion.choices[0].message.content);
    res.json(matchScore);

  } catch (error) {
    console.error('Match score calculation failed:', error);
    res.status(500).json({
      error: 'Failed to calculate match score',
      details: error.message
    });
  }
});

export default router;
