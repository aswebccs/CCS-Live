import React, { useState } from 'react';
import { Briefcase, MapPin, Clock, Building2, BookmarkPlus, Share2, Flag, ChevronRight, Search, ExternalLink } from 'lucide-react';

export default function JobPortal() {
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      salary: '₹120k - ₹160k',
      type: 'Full-time',
      posted: '2 days ago',
      badge: 'Urgently hiring',
      badgeColor: 'blue',
      easyApply: true,
      description: 'We are seeking an experienced Frontend Developer to join our dynamic team. You will be responsible for building and maintaining high-quality web applications using modern technologies.',
      requirements: [
        '5+ years of experience with React and TypeScript',
        'Strong understanding of web performance optimization',
        'Experience with state management (Redux, Zustand)',
        'Excellent problem-solving skills',
        'Bachelor\'s degree in Computer Science or related field'
      ],
      responsibilities: [
        'Develop new user-facing features using React.js',
        'Build reusable components and front-end libraries',
        'Translate designs and wireframes into high-quality code',
        'Optimize components for maximum performance',
        'Collaborate with back-end developers and designers'
      ],
      benefits: [
        'Competitive salary and equity',
        'Health, dental, and vision insurance',
        '401(k) matching',
        'Unlimited PTO',
        'Remote work options'
      ]
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      company: 'Creative Studios Inc',
      location: 'New York, NY',
      salary: '₹90k - ₹130k',
      type: 'Full-time',
      posted: '1 day ago',
      badge: 'Responds within 1 day',
      badgeColor: 'green',
      easyApply: true,
      description: 'Join our creative team to design beautiful and intuitive user interfaces. We\'re looking for someone passionate about creating exceptional user experiences.',
      requirements: [
        '3+ years of UX/UI design experience',
        'Proficiency in Figma and Adobe Creative Suite',
        'Strong portfolio demonstrating design process',
        'Understanding of responsive design principles',
        'Experience with user research and testing'
      ],
      responsibilities: [
        'Create wireframes, prototypes, and high-fidelity designs',
        'Conduct user research and usability testing',
        'Collaborate with developers to implement designs',
        'Maintain and evolve design systems',
        'Present design concepts to stakeholders'
      ],
      benefits: [
        'Competitive compensation package',
        'Professional development budget',
        'Flexible work schedule',
        'Modern office in downtown',
        'Team events and workshops'
      ]
    },
    {
      id: 3,
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Austin, TX',
      salary: '₹110k - ₹150k',
      type: 'Full-time',
      posted: '3 days ago',
      badge: 'Hiring multiple candidates',
      badgeColor: 'purple',
      easyApply: false,
      description: 'We\'re a fast-growing startup looking for a talented Full Stack Engineer to help build our platform from the ground up.',
      requirements: [
        'Strong experience with Node.js and React',
        'Database design and optimization skills',
        'RESTful API development experience',
        'Understanding of cloud services (AWS/GCP)',
        'Startup experience preferred'
      ],
      responsibilities: [
        'Design and develop scalable backend services',
        'Build responsive frontend applications',
        'Write clean, maintainable code',
        'Participate in code reviews',
        'Troubleshoot and debug applications'
      ],
      benefits: [
        'Equity in a growing startup',
        'Health and wellness benefits',
        'Learning and development budget',
        'Casual work environment',
        'Stock options'
      ]
    },
    {
      id: 4,
      title: 'Product Manager',
      company: 'Innovation Labs',
      location: 'Seattle, WA',
      salary: '₹130k - ₹170k',
      type: 'Full-time',
      posted: '5 days ago',
      easyApply: true,
      description: 'Lead product strategy and development for our flagship products. Work with cross-functional teams to deliver exceptional products.',
      requirements: [
        '5+ years of product management experience',
        'Strong analytical and data-driven mindset',
        'Excellent communication skills',
        'Experience with Agile methodologies',
        'Technical background preferred'
      ],
      responsibilities: [
        'Define product vision and roadmap',
        'Gather and prioritize product requirements',
        'Work closely with engineering and design teams',
        'Analyze market trends and competition',
        'Track and report on product metrics'
      ],
      benefits: [
        'Comprehensive benefits package',
        '401(k) with company match',
        'Generous vacation policy',
        'Professional growth opportunities',
        'Relocation assistance available'
      ]
    },
    {
      id: 5,
      title: 'DevOps Engineer',
      company: 'CloudTech Systems',
      location: 'Remote',
      salary: '₹115k - ₹155k',
      type: 'Full-time',
      posted: '1 week ago',
      badge: 'Remote',
      badgeColor: 'green',
      easyApply: true,
      description: 'Join our infrastructure team to build and maintain scalable cloud infrastructure. Perfect opportunity for someone passionate about automation and reliability.',
      requirements: [
        'Experience with AWS, Azure, or GCP',
        'Strong knowledge of Docker and Kubernetes',
        'CI/CD pipeline experience',
        'Scripting skills (Python, Bash)',
        'Infrastructure as Code (Terraform, CloudFormation)'
      ],
      responsibilities: [
        'Design and implement CI/CD pipelines',
        'Manage cloud infrastructure',
        'Monitor system performance and reliability',
        'Automate deployment processes',
        'Ensure security best practices'
      ],
      benefits: [
        'Fully remote position',
        'Competitive salary',
        'Home office stipend',
        'Health and dental coverage',
        'Annual team retreats'
      ]
    }
  ];

  const [selectedJob, setSelectedJob] = useState(jobs[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter((job) => {
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.type.toLowerCase().includes(query)
    );
  });

  const getBadgeColor = (color) => {
    switch(color) {
      case 'blue': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'green': return 'bg-green-50 text-green-700 border-green-200';
      case 'purple': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keywords, or company"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Find jobs
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Job List (5 columns) */}
          <div className="col-span-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Jobs for you</h2>
              <p className="text-sm text-gray-600 mt-1">{filteredJobs.length} jobs based on your search</p>
            </div>

            <div className="space-y-3">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`bg-white rounded-lg p-4 cursor-pointer transition-all duration-200 border ${
                      selectedJob.id === job.id 
                        ? 'border-blue-500 shadow-md ring-2 ring-blue-100' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    {job.badge && (
                      <div className="mb-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded border ${getBadgeColor(job.badgeColor)}`}>
                          {job.badge}
                        </span>
                      </div>
                    )}

                    <h3 className="text-base font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    
                    <p className="text-sm text-gray-700 font-medium mb-2">{job.company}</p>
                    
                    <p className="text-sm text-gray-600 mb-1">{job.location}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span className="font-medium">{job.salary}</span>
                      <span>•</span>
                      <span>{job.type}</span>
                    </div>

                    {job.easyApply && (
                      <div className="flex items-center gap-1 text-sm text-blue-600 font-medium mt-3">
                        <ChevronRight className="w-4 h-4" />
                        <span>Easily apply</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{job.posted}</span>
                      <BookmarkPlus className="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No jobs found</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Job Details (7 columns) */}
          <div className="col-span-7">
            <div className="bg-white rounded-lg border border-gray-200 sticky top-24">
              <div className="p-6">
                {/* Job Header */}
                <div className="pb-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">
                    {selectedJob.title}
                  </h1>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base text-gray-700 font-medium hover:underline cursor-pointer">
                      {selectedJob.company}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p>{selectedJob.location}</p>
                    <p className="font-medium">{selectedJob.salary} a month</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">
                      Apply now
                    </button>
                    <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center gap-2">
                      <BookmarkPlus className="w-5 h-5" />
                    </button>
                    <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 px-4 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 px-4 rounded-lg transition-colors">
                      <Flag className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="overflow-y-auto max-h-[calc(100vh-400px)] pt-6">
                  {/* Job Description */}
                  <section className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Job description</h2>
                    <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
                  </section>

                  {/* Requirements */}
                  <section className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Qualifications</h2>
                    <ul className="space-y-2">
                      {selectedJob.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Responsibilities */}
                  <section className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Responsibilities</h2>
                    <ul className="space-y-2">
                      {selectedJob.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-700">
                          <span className="text-gray-400 mt-1">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {/* Benefits */}
                  <section className="mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">Benefits</h2>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.benefits.map((benefit, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full">
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}