import React, { useContext, useEffect, useState } from 'react';
import { context } from '../context/Context';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import {
  Upload,
  FileText,
  Briefcase,
  Code,
  LineChart,
  ChevronDown,
  CheckCircle,
  Loader2
} from 'lucide-react';
import photo from '../assets/rmphoto.png';

// Job roles categorized by tech/non-tech
const jobRoles = {
  technical: [
    'Software Developer', 'Web Developer', 'Full Stack Developer', 'Frontend Developer',
    'Backend Developer', 'Mobile App Developer', 'Cloud Engineer', 'DevOps Engineer',
    'Data Scientist', 'Machine Learning Engineer', 'AI Engineer', 'Cybersecurity Analyst',
    'Network Administrator', 'Database Administrator', 'UI/UX Designer', 'IT Support Engineer',
    'Software Tester', 'QA Engineer', 'Blockchain Developer', 'Game Developer',
    'Embedded Systems Engineer', 'MERN Stack'
  ],
  nonTechnical: [
    'Product Manager', 'Project Manager', 'Business Analyst', 'Operations Manager',
    'Supply Chain Manager', 'HR Manager', 'Recruitment Specialist', 'Training and Development Manager',
    'Strategy Consultant', 'Financial Analyst', 'Investment Analyst', 'Chartered Accountant',
    'Auditor', 'Risk Analyst', 'Tax Consultant', 'Banking Associate', 'Wealth Manager',
    'Stock Market Trader', 'Marketing Specialist', 'Digital Marketing Manager', 'SEO Specialist',
    'Content Marketer', 'Social Media Manager', 'Brand Manager', 'Market Research Analyst',
    'Advertising Executive', 'Teacher', 'Professor', 'Academic Counselor', 'Trainer',
    'Research Associate', 'Librarian', 'Education Consultant', 'Doctor', 'Nurse', 'Pharmacist',
    'Medical Researcher', 'Physiotherapist', 'Radiologist', 'Pathologist', 'Healthcare Administrator',
    'Medical Coder', 'Sales Executive', 'Business Development Executive', 'Key Account Manager',
    'Retail Manager', 'Customer Support Specialist', 'Client Relationship Manager',
    'Inside Sales Representative', 'Lawyer', 'Corporate Legal Advisor', 'Paralegal',
    'Legal Consultant', 'Civil Engineer', 'Mechanical Engineer', 'Electrical Engineer',
    'Electronics Engineer', 'Chemical Engineer', 'Automobile Engineer', 'Aerospace Engineer',
    'Production Engineer', 'Quality Engineer', 'Journalist', 'Content Writer', 'Copywriter',
    'Video Editor', 'Graphic Designer', 'Animator', 'Film Director', 'Music Producer',
    'Photographer', 'Government Officer', 'Defense Personnel'
  ]
};

const Resume = () => {
  const [file, setFile] = useState(null);
  const navigate = useNavigate();
  const { htmlContent, setHtmlContent, email } = useContext(context);
  const [jobCategory, setJobCategory] = useState('technical');
  const [subRole, setSubRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [fileHover, setFileHover] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (subRole.length === 0 && file == null) {
      // Show validation error UI instead of alert
      return;
    }

    if (file) {
      let name = file.name;
      let arr = name.split('.');

      if (arr[1] !== 'pdf') {
        // Show validation error UI instead of alert
        setFile(null);
        return;
      }
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('role', subRole);
    formData.append('email', email);
    formData.append('jobType', jobCategory);
    if (file) formData.append('file', file);

    async function rec() {
      const res = await fetch('http://localhost:2000/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          jobType: jobCategory
        })
      });

      const data = await res.json();
      return data;
    }

    try {
      const uploadRes = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData
      });

      const uploadData = await uploadRes.json();

      if (uploadData) {
        await rec();
        window.location.href = "/resume/resumereport";
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.name.endsWith('.pdf')) {
        setFile(selectedFile);
      } else {
        // Show validation error UI instead of alert
        setFile(null);
      }
    }
  };


  useEffect(()=>{


    console.log(jobCategory)
  },[jobCategory])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Resume Analysis</h1>
          <p className="text-gray-600 mt-2">Upload your resume and get personalized career insights</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-auto min-h-screen">
          <div className="md:flex">
            {/* Left side: Image */}
            <div className="md:w-1/2 bg-blue-50 hidden md:block">
              <div className="h-full flex items-center justify-center p-6">
                <img
                  src={photo}
                  className="w-full h-auto object-cover rounded-lg shadow-md"
                  alt="Resume analysis illustration"
                />
              </div>
            </div>

            {/* Right side: Form */}
            <div className="md:w-1/2 p-8">
              <div className="space-y-6">
                {/* File upload section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText size={18} />
                    Resume File
                  </label>

                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${fileHover ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                      }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setFileHover(true);
                    }}
                    onDragLeave={() => setFileHover(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setFileHover(false);
                      const droppedFile = e.dataTransfer.files[0];
                      if (droppedFile && droppedFile.name.endsWith('.pdf')) {
                        setFile(droppedFile);
                      }
                    }}
                    onClick={() => document.getElementById('fileselect').click()}
                  >
                    <input
                      id="fileselect"
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf"
                      hidden
                    />

                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-blue-600">
                        <CheckCircle size={20} />
                        <span className="font-medium">{file.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-gray-500">
                        <Upload size={32} className="text-gray-400" />
                        <p className="text-sm font-medium">Drag and drop your PDF resume or click to browse</p>
                        <p className="text-xs text-gray-400">Only PDF files are supported</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Category dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Briefcase size={18} />
                    Job Category
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center justify-between w-full p-3 text-left border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                      onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                    >
                      <div className="flex items-center gap-2">
                        {jobCategory === 'technical' ? (
                          <Code size={18} className="text-blue-500" />
                        ) : (
                          <LineChart size={18} className="text-green-500" />
                        )}
                        <span>
                          {jobCategory === 'technical' ? 'Technical Jobs' : 'Non-Technical Jobs'}
                        </span>
                      </div>
                      <ChevronDown size={18} className={`transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {categoryDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                        <div
                          className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setJobCategory('technical');
                            setSubRole('');
                            setCategoryDropdownOpen(false);
                          }}
                        >
                          <Code size={18} className="text-blue-500" />
                          <span>Technical Jobs</span>
                        </div>
                        <div
                          className="flex items-center gap-2 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setJobCategory('nonTechnical');
                            setSubRole('');
                            setCategoryDropdownOpen(false);
                          }}
                        >
                          <LineChart size={18} className="text-green-500" />
                          <span>Non-Technical Jobs</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Role dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Code size={18} />
                    Specific Role
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center justify-between w-full p-3 text-left border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <span>{subRole || 'Select Job Role'}</span>
                      <ChevronDown size={18} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {jobRoles[jobCategory].map((role, index) => (
                          <div
                            key={index}
                            className="p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setSubRole(role);
                              setDropdownOpen(false);
                            }}
                          >
                            {role}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || (!file && !subRole)}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${isLoading || (!file && !subRole)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <FileText size={20} />
                      <span>Generate Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume;