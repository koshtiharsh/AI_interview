import React, { useState, useEffect } from 'react';

const SignupForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        mobile: '',
        email: '',
        degree: '',
        specialization: '',
        jobRole: '',
        customJobRole: '',
        additionalInfo: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [showCustomJobRole, setShowCustomJobRole] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            verifyToken(token);
        }
    }, []);

    useEffect(() => {
        // Handle toggling of custom job role field
        if (formData.jobRole === 'Other') {
            setShowCustomJobRole(true);
        } else {
            setShowCustomJobRole(false);
            setFormData(prev => ({ ...prev, customJobRole: '' }));
        }
    }, [formData.jobRole]);

    const verifyToken = async (token) => {
        try {
            const response = await fetch('http://localhost:2000/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setIsSignedIn(true);
            } else {
                setIsSignedIn(false);
                localStorage.removeItem('token');
            }
        } catch (error) {
            setIsSignedIn(false);
            localStorage.removeItem('token');
            console.error('Token verification failed:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: null });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.age) newErrors.age = 'Age is required';
        else if (isNaN(formData.age) || formData.age < 16 || formData.age > 100)
            newErrors.age = 'Please enter a valid age between 16 and 100';

        if (!formData.mobile) newErrors.mobile = 'Mobile number is required';
        else if (!/^\d{10}$/.test(formData.mobile))
            newErrors.mobile = 'Please enter a valid 10-digit mobile number';

        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email))
            newErrors.email = 'Please enter a valid email address';

        if (!formData.degree) newErrors.degree = 'Please select your degree';
        if (!formData.specialization) newErrors.specialization = 'Please select your specialization';
        if (!formData.jobRole) newErrors.jobRole = 'Please select your desired job role';
        if (formData.jobRole === 'Other' && !formData.customJobRole.trim())
            newErrors.customJobRole = 'Please specify your job role';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = validateForm();

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            return;
        }

        // Prepare data for submission with proper job role handling
        const submissionData = { ...formData };
        if (formData.jobRole === 'Other') {
            submissionData.jobRole = "Other";
        }

        try {
            const response = await fetch('http://localhost:2000/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData)
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                setIsSignedIn(true);
                window.location.href = '/';
                alert('Signup successful!');
            } else {
                if (data.message === 'Email already exists') {
                    setErrors({ email: 'This email is already registered' });
                } else {
                    setErrors({ server: data.message || 'An error occurred during signup' });
                }
            }
        } catch (error) {
            setErrors({ server: 'Network error occurred. Please try again later.' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsSignedIn(false);
    };
    const degreeOptions = [
        'Bachelor of Science (B.Sc)', 'Master of Science (M.Sc)',
        'Bachelor of Arts (B.A)', 'Master of Arts (M.A)',
        'Bachelor of Commerce (B.Com)', 'Master of Commerce (M.Com)',
        'Bachelor of Technology (B.Tech)', 'Master of Technology (M.Tech)',
        'Bachelor of Engineering (B.E)', 'Master of Engineering (M.E)',
        'Bachelor of Business Administration (BBA)', 'Master of Business Administration (MBA)',
        'Bachelor of Computer Applications (BCA)', 'Master of Computer Applications (MCA)',
        'Other'
    ];

    const specializationOptions = {
        'Bachelor of Science (B.Sc)': [
            'Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Biology',
            'Environmental Science', 'Geology', 'Statistics', 'Botany', 'Zoology',
            'Microbiology', 'Biochemistry', 'Biotechnology', 'Data Science', 'Forensic Science'
        ],
        'Master of Science (M.Sc)': [
            'Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Biotechnology',
            'Artificial Intelligence', 'Machine Learning', 'Cybersecurity', 'Statistics', 'Data Science'
        ],
        'Bachelor of Arts (B.A)': [
            'English', 'History', 'Political Science', 'Psychology', 'Sociology',
            'Philosophy', 'Economics', 'Geography', 'Journalism', 'Fine Arts'
        ],
        'Master of Arts (M.A)': [
            'English', 'History', 'Political Science', 'Psychology', 'Sociology',
            'Public Administration', 'International Relations', 'Journalism & Mass Communication'
        ],
        'Bachelor of Commerce (B.Com)': [
            'Accounting', 'Finance', 'Marketing', 'Economics', 'Banking & Insurance',
            'Business Analytics', 'Taxation', 'Corporate Law', 'E-commerce'
        ],
        'Master of Commerce (M.Com)': [
            'Accounting', 'Finance', 'Taxation', 'Auditing', 'International Business'
        ],
        'Bachelor of Technology (B.Tech)': [
            'Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Electronics',
            'Artificial Intelligence', 'Cybersecurity', 'Data Engineering', 'Biomedical', 'Nanotechnology'
        ],
        'Master of Technology (M.Tech)': [
            'Computer Science', 'Mechanical', 'Electronics', 'Data Science', 'Robotics'
        ],
        'Bachelor of Engineering (B.E)': [
            'Computer Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering'
        ],
        'Master of Engineering (M.E)': [
            'Computer Engineering', 'Mechanical Engineering', 'Electronics & Communication', 'Structural Engineering'
        ],
        'Bachelor of Business Administration (BBA)': [
            'Marketing', 'Finance', 'Human Resource Management', 'International Business', 'Entrepreneurship'
        ],
        'Master of Business Administration (MBA)': [
            'Marketing', 'Finance', 'Human Resource Management', 'Operations', 'Business Analytics'
        ],
        'Bachelor of Computer Applications (BCA)': [
            'Software Development', 'Cybersecurity', 'Data Science', 'Artificial Intelligence', 'Web Development'
        ],
        'Master of Computer Applications (MCA)': [
            'Software Engineering', 'Cybersecurity', 'Machine Learning', 'Cloud Computing'
        ],
        'Other': [
            'Medicine (MBBS)', 'Dentistry (BDS)', 'Pharmacy (B.Pharm)', 'Nursing (B.Sc Nursing)',
            'Law (LLB)', 'Education (B.Ed)', 'Architecture (B.Arch)', 'Agriculture (B.Sc Agriculture)',
            'Veterinary Science', 'Physiotherapy (BPT)', 'Hospitality Management', 'Fashion Design',
            'Animation & Multimedia', 'Sports Science', 'Culinary Arts', 'Aviation'
        ]
    };


    const jobRoleOptions = [
        'Software Developer', 'Web Developer', 'Full Stack Developer', 
        'Frontend Developer', 'Backend Developer', 'Mobile App Developer', 
        'Cloud Engineer', 'DevOps Engineer', 'Data Scientist', 
        'Machine Learning Engineer', 'AI Engineer', 'Cybersecurity Analyst', 
        'Network Administrator', 'Database Administrator', 'UI/UX Designer', 
        'IT Support Engineer', 'Software Tester', 'QA Engineer', 
        'Blockchain Developer', 'Game Developer', 'Embedded Systems Engineer', 
        'Product Manager', 'Project Manager', 'Business Analyst', 
        'Operations Manager', 'Supply Chain Manager', 'HR Manager', 
        'Recruitment Specialist', 'Training and Development Manager', 
        'Strategy Consultant', 'Financial Analyst', 'Investment Analyst', 
        'Chartered Accountant', 'Auditor', 'Risk Analyst', 'Tax Consultant', 
        'Banking Associate', 'Wealth Manager', 'Stock Market Trader', 
        'Marketing Specialist', 'Digital Marketing Manager', 'SEO Specialist', 
        'Content Marketer', 'Social Media Manager', 'Brand Manager', 
        'Market Research Analyst', 'Advertising Executive', 'Teacher', 
        'Professor', 'Academic Counselor', 'Trainer', 'Research Associate', 
        'Librarian', 'Education Consultant', 'Doctor', 'Nurse', 'Pharmacist', 
        'Medical Researcher', 'Physiotherapist', 'Radiologist', 'Pathologist', 
        'Healthcare Administrator', 'Medical Coder', 'Sales Executive', 
        'Business Development Executive', 'Key Account Manager', 'Retail Manager', 
        'Customer Support Specialist', 'Client Relationship Manager', 
        'Inside Sales Representative', 'Lawyer', 'Corporate Legal Advisor', 
        'Paralegal', 'Legal Consultant', 'Civil Engineer', 'Mechanical Engineer', 
        'Electrical Engineer', 'Electronics Engineer', 'Chemical Engineer', 
        'Automobile Engineer', 'Aerospace Engineer', 'Production Engineer', 
        'Quality Engineer', 'Journalist', 'Content Writer', 'Copywriter', 
        'Video Editor', 'Graphic Designer', 'Animator', 'Film Director', 
        'Music Producer', 'Photographer', 'Government Officer', 
        'Defense Personnel',  'Other'
    ];
    

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 to-purple-100 p-4">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-violet-200/50">
                {isSignedIn ? (
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-violet-900 mb-8 tracking-tight">
                            Welcome Back!
                        </h2>
                        <p className="text-violet-700 mb-4">You are already signed in.</p>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold text-center text-violet-900 mb-8 tracking-tight">
                            Sign Up
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Personal Information */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-violet-800 border-b border-violet-200 pb-2">
                                    Personal Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-violet-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                            placeholder="Enter your full name"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-violet-700 mb-1">Age</label>
                                            <input
                                                type="number"
                                                name="age"
                                                value={formData.age}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                                placeholder="Your age"
                                            />
                                            {errors.age && <p className="mt-1 text-sm text-red-500">{errors.age}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-violet-700 mb-1">Mobile Number</label>
                                            <input
                                                type="tel"
                                                name="mobile"
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                                placeholder="10-digit mobile"
                                            />
                                            {errors.mobile && <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                            placeholder="your.email@example.com"
                                        />
                                        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-700 mb-1">Password</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                            placeholder="Enter your password"
                                        />
                                        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Education Information */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-violet-800 border-b border-violet-200 pb-2">
                                    Education Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-violet-700 mb-1">Degree</label>
                                        <select
                                            name="degree"
                                            value={formData.degree}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                        >
                                            <option value="">Select Degree</option>
                                            {degreeOptions.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        {errors.degree && <p className="mt-1 text-sm text-red-500">{errors.degree}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-violet-700 mb-1">Specialization</label>
                                        <select
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                            disabled={!formData.degree}
                                        >
                                            <option value="">Select Specialization</option>
                                            {formData.degree && specializationOptions[formData.degree]?.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        {errors.specialization && <p className="mt-1 text-sm text-red-500">{errors.specialization}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Career Information */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-violet-800 border-b border-violet-200 pb-2">
                                    Career Information
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-violet-700 mb-1">Desired Job Role</label>
                                        <select
                                            name="jobRole"
                                            value={formData.jobRole}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                        >
                                            <option value="">Select Job Role</option>
                                            {jobRoleOptions.map((option) => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </select>
                                        {errors.jobRole && <p className="mt-1 text-sm text-red-500">{errors.jobRole}</p>}
                                    </div>

                                    {showCustomJobRole && (
                                        <div>
                                            <label className="block text-sm font-medium text-violet-700 mb-1">Specify Job Role</label>
                                            <input
                                                type="text"
                                                name="customJobRole"
                                                value={formData.customJobRole}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                                placeholder="Enter your desired job role"
                                            />
                                            {errors.customJobRole && <p className="mt-1 text-sm text-red-500">{errors.customJobRole}</p>}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-violet-700 mb-1">Additional Information (Optional)</label>
                                        <textarea
                                            name="additionalInfo"
                                            value={formData.additionalInfo}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 rounded-lg border border-violet-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-violet-50/50 transition-all duration-200"
                                            rows="3"
                                            placeholder="Any additional information you'd like to share about your career goals"
                                        />
                                    </div>
                                </div>
                            </div>

                            {errors.server && (
                                <div className="text-center text-sm text-red-500 mb-4">
                                    {errors.server}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg hover:bg-violet-700 focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                Sign Up
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default SignupForm;