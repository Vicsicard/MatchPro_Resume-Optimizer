import puppeteer from 'puppeteer';

// Extract job posting from LinkedIn
async function extractFromLinkedIn(url, page) {
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  // Wait for job description to load
  await page.waitForSelector('.job-details');
  
  // Extract job details
  const jobPosting = await page.evaluate(() => {
    const title = document.querySelector('.job-details h1')?.textContent || '';
    const company = document.querySelector('.job-details span.company-name')?.textContent || '';
    const description = document.querySelector('.job-details .description__text')?.textContent || '';
    const requirements = document.querySelector('.job-details .requirements__text')?.textContent || '';
    
    return `
[JOB TITLE]
${title.trim()}

[COMPANY]
${company.trim()}

[JOB DESCRIPTION]
${description.trim()}

[REQUIREMENTS]
${requirements.trim()}
    `.trim();
  });
  
  return jobPosting;
}

// Extract job posting from Indeed
async function extractFromIndeed(url, page) {
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  // Wait for job description to load
  await page.waitForSelector('#jobDescriptionText');
  
  // Extract job details
  const jobPosting = await page.evaluate(() => {
    const title = document.querySelector('.jobsearch-JobInfoHeader-title')?.textContent || '';
    const company = document.querySelector('.jobsearch-CompanyInfoContainer')?.textContent || '';
    const description = document.querySelector('#jobDescriptionText')?.textContent || '';
    
    return `
[JOB TITLE]
${title.trim()}

[COMPANY]
${company.trim()}

[JOB DESCRIPTION]
${description.trim()}
    `.trim();
  });
  
  return jobPosting;
}

// Extract job posting from Glassdoor
async function extractFromGlassdoor(url, page) {
  await page.goto(url, { waitUntil: 'networkidle0' });
  
  // Wait for job description to load
  await page.waitForSelector('.jobDescriptionContent');
  
  // Extract job details
  const jobPosting = await page.evaluate(() => {
    const title = document.querySelector('.job-title')?.textContent || '';
    const company = document.querySelector('.employer-name')?.textContent || '';
    const description = document.querySelector('.jobDescriptionContent')?.textContent || '';
    
    return `
[JOB TITLE]
${title.trim()}

[COMPANY]
${company.trim()}

[JOB DESCRIPTION]
${description.trim()}
    `.trim();
  });
  
  return jobPosting;
}

// Main extraction function
export async function extractJobPosting(url) {
  let browser;
  try {
    // Launch browser in headless mode
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set viewport and user agent for better compatibility
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Extract based on URL
    let jobPosting;
    if (url.includes('linkedin.com')) {
      jobPosting = await extractFromLinkedIn(url, page);
    } else if (url.includes('indeed.com')) {
      jobPosting = await extractFromIndeed(url, page);
    } else if (url.includes('glassdoor.com')) {
      jobPosting = await extractFromGlassdoor(url, page);
    } else {
      throw new Error('Unsupported job board');
    }
    
    return jobPosting;
    
  } catch (error) {
    console.error('Error extracting job posting:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
