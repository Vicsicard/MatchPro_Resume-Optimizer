import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Zap, Target, BarChart, Shield, Clock, Sparkles, FileText } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
  <div className="p-6 rounded-lg bg-blue-50">
    <div className="w-12 h-12 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-4">
      <Icon size={24} />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "AI-Powered Optimization",
      description: "Our advanced AI algorithms analyze and enhance your resume in real-time, ensuring perfect alignment with job requirements."
    },
    {
      icon: Target,
      title: "Smart Job Matching",
      description: "Automatically identify the most relevant job opportunities based on your skills, experience, and career goals."
    },
    {
      icon: BarChart,
      title: "ATS Score Analysis",
      description: "Get detailed insights into how well your resume performs against Applicant Tracking Systems (ATS)."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is protected with enterprise-grade security. We never share your information without permission."
    },
    {
      icon: Clock,
      title: "Quick Results",
      description: "Receive optimization suggestions and ATS scoring within minutes, not hours or days."
    },
    {
      icon: FileText,
      title: "Format Preservation",
      description: "Keep your resume's professional formatting while improving its content and keyword optimization."
    },
    {
      icon: Sparkles,
      title: "Custom Templates",
      description: "Access a library of ATS-friendly templates designed for your industry and experience level."
    },
    {
      icon: Check,
      title: "Version Control",
      description: "Maintain multiple versions of your resume for different job applications and track changes over time."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Features that Set Us Apart
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Everything you need to create the perfect resume and land your dream job.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 py-2"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-blue-50 py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Ready to Optimize Your Resume?
            </h2>
            <p className="text-gray-600 mb-8">
              Join thousands of successful job seekers who have improved their chances with MatchPro.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-6 py-2"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
