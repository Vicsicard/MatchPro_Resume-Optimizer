import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About MatchPro</h1>
          
          <section className="mb-12 bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600">
              At MatchPro, we're revolutionizing the way job seekers approach their career journey. Our mission is to empower individuals with AI-driven tools that transform their resumes into powerful career assets, perfectly aligned with their dream jobs.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">What We Do</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-blue-50">
                <h3 className="text-xl font-medium text-gray-900 mb-3">AI-Powered Optimization</h3>
                <p className="text-gray-600">
                  Our advanced AI algorithms analyze and enhance your resume to match job requirements, increasing your chances of landing interviews.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-blue-50">
                <h3 className="text-xl font-medium text-gray-900 mb-3">Smart Job Matching</h3>
                <p className="text-gray-600">
                  We help you identify and target the right opportunities that align with your skills and career goals.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Choose Us</h2>
            <div className="bg-blue-50 rounded-lg p-8">
              <ul className="list-disc list-inside space-y-4 text-gray-600">
                <li>State-of-the-art AI technology</li>
                <li>User-friendly interface</li>
                <li>Personalized optimization suggestions</li>
                <li>Secure and private</li>
                <li>Continuous updates and improvements</li>
              </ul>
            </div>
          </section>

          <div className="text-center mt-8">
            <Link 
              to="/pricing" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 py-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
