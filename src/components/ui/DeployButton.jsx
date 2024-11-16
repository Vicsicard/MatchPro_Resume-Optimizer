import React from 'react';
import { Button } from './button';

export default function DeployButton() {
  const deployUrl = "https://vercel.com/new/clone?" + new URLSearchParams({
    "repository-url": "https://github.com/yourusername/match-pro",
    "project-name": "match-pro",
    "repository-name": "match-pro",
    "demo-title": "MatchPro Resume Optimization Platform",
    "demo-description": "An AI-powered resume optimization platform with Supabase authentication, React, and Vite",
    "demo-url": "https://match-pro.vercel.app",
    "integration-ids": "oac_VqOgBHqhEoFTPzGkPd7L0iH6" // Supabase integration ID
  }).toString();

  return (
    <Button
      asChild
      variant="outline"
      className="gap-2"
    >
      <a
        href={deployUrl}
        target="_blank"
        rel="noreferrer"
      >
        <svg
          aria-label="Vercel logomark"
          role="img"
          viewBox="0 0 74 64"
          className="h-4 w-4"
        >
          <path
            d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
            fill="currentColor"
          />
        </svg>
        Deploy to Vercel
      </a>
    </Button>
  );
}
