import { useState, useEffect, useContext } from "react";
import { User, Mail, Phone, Briefcase, Code, Edit, Save, X, ChevronDown, Plus, Briefcase as JobIcon } from "lucide-react";
import Navbar from "./Navbar";
import { context } from "../context/Context";

export default function UserProfile() {
    const [userData, setUserData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dropdownStates, setDropdownStates] = useState({
        degree: false,
        specialization: false,
        jobRole: false
    });
    const [newSkill, setNewSkill] = useState("");
    const [showCustomJobRole, setShowCustomJobRole] = useState(false);

    // This would typically come from your authentication context
    const { email } = useContext(context)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`http://localhost:2000/user?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'x-user-email': email
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                setUserData(data);
                setEditedData(data);
                console.log(data)

                // Check if job role is 'Other' to display custom job role field
                if (data.customJobRole.length > 0) {
                    setShowCustomJobRole(true);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (email) {
            fetchUserData();
        }
    }, [email]);

    const handleEditToggle = () => {
        if (isEditing) {
            setEditedData(userData); // Reset changes if canceling
            setNewSkill(""); // Clear the new skill input
            // Reset custom job role state
            setShowCustomJobRole(userData.jobRole === 'Other');
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData({
            ...editedData,
            [name]: value
        });
    };

    const handleDegreeSelect = (degree) => {
        setEditedData({
            ...editedData,
            degree,
            specialization: '' // Reset specialization when degree changes
        });
        setDropdownStates({
            ...dropdownStates,
            degree: false,
            specialization: false
        });
    };

    const handleSpecializationSelect = (specialization) => {
        setEditedData({
            ...editedData,
            specialization
        });
        setDropdownStates({
            ...dropdownStates,
            specialization: false
        });
    };

    const handleJobRoleSelect = (jobRole) => {
        setEditedData({
            ...editedData,
            jobRole,
            customJobRole: jobRole === 'Other' ? editedData.customJobRole : '' // Clear custom job role if not "Other"
        });
        setShowCustomJobRole(jobRole === 'Other');
        setDropdownStates({
            ...dropdownStates,
            jobRole: false
        });
    };

    const toggleDropdown = (dropdown) => {
        setDropdownStates({
            ...dropdownStates,
            [dropdown]: !dropdownStates[dropdown]
        });
    };

    const handleSkillToggle = (skill) => {
        if (!isEditing) return;

        const updatedSkills = editedData.technicalSkills.includes(skill)
            ? editedData.technicalSkills.filter(s => s !== skill)
            : [...editedData.technicalSkills, skill];

        setEditedData({
            ...editedData,
            technicalSkills: updatedSkills
        });
    };

    const handleAddSkill = () => {
        if (!newSkill.trim() || !isEditing) return;

        // Check if skill already exists
        if (editedData.technicalSkills.includes(newSkill.trim())) {
            // You could add a visual feedback here for duplicate skills
            return;
        }

        setEditedData({
            ...editedData,
            technicalSkills: [...editedData.technicalSkills, newSkill.trim()]
        });

        setNewSkill(""); // Clear the input after adding
    };

    const handleNewSkillKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill();
        }
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);

            // Prepare data for submission with proper job role handling
            const submissionData = { ...editedData };
            if (submissionData.jobRole === 'Other' && submissionData.customJobRole) {
                // For display in profile, keep both fields for editing capability
                submissionData.displayJobRole = submissionData.customJobRole;
            } else {
                submissionData.displayJobRole = submissionData.jobRole;
            }

            const response = await fetch('http://localhost:2000/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-email': email
                },
                body: JSON.stringify({
                    ...submissionData,
                    email: email // Include email in both body and header
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update user data');
            }

            const updatedData = await response.json();
            setUserData(updatedData);
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Close dropdowns when clicking outside
    useEffect(() => {
        if (!isEditing) return;

        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setDropdownStates({
                    degree: false,
                    specialization: false,
                    jobRole: false
                });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isEditing]);

    if (isLoading && !userData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-violet-600 text-xl">Loading user profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-red-500 text-xl">Error: {error}</div>
            </div>
        );
    }

    if (!userData) return null;

    // Degree and Specialization Options
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

    // Job Role Options
    const jobRoleOptions = [
        'Software Developer', 'Data Scientist', 'Web Developer',
        'UX/UI Designer', 'Product Manager', 'Project Manager',
        'Business Analyst', 'Financial Analyst', 'Marketing Specialist',
        'Content Writer', 'HR Manager', 'Operations Manager',
        'Research Scientist', 'Healthcare Professional', 'Teacher/Professor',
        'Consultant', 'Sales Executive', 'Customer Support Specialist',
        'Network Administrator', 'Cybersecurity Analyst', 'Other'
    ];

    // Function to display job role properly
    const getDisplayJobRole = () => {
        if (userData.jobRole === 'Other' && userData.customJobRole) {
            return userData.customJobRole || userData.displayJobRole;
        }
        return userData.jobRole || 'Not specified';
    };

    return (
        <>
            <Navbar />

            <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-5">
                <div className="flex justify-between items-center mb-6 ">
                    <h1 className="text-2xl font-bold text-violet-800">User Profile</h1>
                    <button
                        onClick={handleEditToggle}
                        className={`flex items-center px-4 py-2 rounded-lg ${isEditing
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "bg-violet-100 text-violet-600 hover:bg-violet-200"
                            }`}
                    >
                        {isEditing ? (
                            <>
                                <X size={18} className="mr-2" /> Cancel
                            </>
                        ) : (
                            <>
                                <Edit size={18} className="mr-2" /> Edit Profile
                            </>
                        )}
                    </button>
                </div>

                {isEditing && (
                    <div className="bg-violet-50 p-4 mb-6 rounded-lg">
                        <p className="text-violet-800 font-medium mb-2">
                            You are currently in edit mode. Make your changes and click Save when you're done.
                        </p>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Personal Information Section */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex items-center mb-4">
                            <User className="text-violet-600 mr-2" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedData.name || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    />
                                ) : (
                                    <p className="text-gray-800">{userData.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        name="age"
                                        value={editedData.age || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    />
                                ) : (
                                    <p className="text-gray-800">{userData.age}</p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                                    <Phone size={16} className="mr-1 text-violet-500" /> Mobile
                                </label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={editedData.mobile || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    />
                                ) : (
                                    <p className="text-gray-800">{userData.mobile}</p>
                                )}
                            </div>

                            <div>
                                <label className="flex items-center text-sm font-medium text-gray-600 mb-1">
                                    <Mail size={16} className="mr-1 text-violet-500" /> Email
                                </label>
                                <p className="text-gray-800">{userData.email}</p>
                                {isEditing && (
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed as it's used for account identification</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Education Section */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="flex items-center mb-4">
                            <Briefcase className="text-violet-600 mr-2" size={20} />
                            <h2 className="text-lg font-semibold text-gray-800">Education</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Degree</label>
                                {isEditing ? (
                                    <div className="relative dropdown-container">
                                        <button
                                            type="button"
                                            onClick={() => toggleDropdown('degree')}
                                            className="w-full p-2 text-left border border-gray-300 rounded flex justify-between items-center bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                        >
                                            <span>{editedData.degree || 'Select a degree'}</span>
                                            <ChevronDown size={16} className={`transition-transform ${dropdownStates.degree ? 'rotate-180' : ''}`} />
                                        </button>

                                        {dropdownStates.degree && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto">
                                                {degreeOptions.map((degree) => (
                                                    <div
                                                        key={degree}
                                                        className="px-4 py-2 cursor-pointer hover:bg-violet-50 text-sm"
                                                        onClick={() => handleDegreeSelect(degree)}
                                                    >
                                                        {degree}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-800">{userData.degree || 'Not specified'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Specialization</label>
                                {isEditing ? (
                                    <div className="relative dropdown-container">
                                        <button
                                            type="button"
                                            onClick={() => toggleDropdown('specialization')}
                                            disabled={!editedData.degree}
                                            className={`w-full p-2 text-left border rounded flex justify-between items-center bg-white ${!editedData.degree
                                                ? 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed'
                                                : 'border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                                                }`}
                                        >
                                            <span>
                                                {editedData.specialization || (!editedData.degree
                                                    ? 'Please select a degree first'
                                                    : 'Select a specialization')}
                                            </span>
                                            {editedData.degree && (
                                                <ChevronDown size={16} className={`transition-transform ${dropdownStates.specialization ? 'rotate-180' : ''}`} />
                                            )}
                                        </button>

                                        {dropdownStates.specialization && editedData.degree && specializationOptions[editedData.degree] && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto">
                                                {specializationOptions[editedData.degree].map((specialization) => (
                                                    <div
                                                        key={specialization}
                                                        className="px-4 py-2 cursor-pointer hover:bg-violet-50 text-sm"
                                                        onClick={() => handleSpecializationSelect(specialization)}
                                                    >
                                                        {specialization}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-gray-800">{userData.specialization || 'Not specified'}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Additional Information</label>
                                {isEditing ? (
                                    <textarea
                                        name="additionalInfo"
                                        value={editedData.additionalInfo || ''}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                        rows="3"
                                        placeholder="Any additional educational information"
                                    />
                                ) : (
                                    <p className="text-gray-800">{userData.additionalInfo || 'None'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Career Information Section */}
                <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                        <JobIcon className="text-violet-600 mr-2" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">Career Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Desired Job Role</label>
                            {isEditing ? (
                                <div className="relative dropdown-container">
                                    <button
                                        type="button"
                                        onClick={() => toggleDropdown('jobRole')}
                                        className="w-full p-2 text-left border border-gray-300 rounded flex justify-between items-center bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <span>{editedData.jobRole || 'Select a job role'}</span>
                                        <ChevronDown size={16} className={`transition-transform ${dropdownStates.jobRole ? 'rotate-180' : ''}`} />
                                    </button>

                                    {dropdownStates.jobRole && (
                                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto">
                                            {jobRoleOptions.map((role) => (
                                                <div
                                                    key={role}
                                                    className="px-4 py-2 cursor-pointer hover:bg-violet-50 text-sm"
                                                    onClick={() => handleJobRoleSelect(role)}
                                                >
                                                    {role}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-800">{getDisplayJobRole()}</p>
                            )}
                        </div>

                        {/* Custom Job Role Input (only shows in edit mode when "Other" is selected) */}
                        {isEditing && showCustomJobRole && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Specify Job Role</label>
                                <input
                                    type="text"
                                    name="customJobRole"
                                    value={editedData.customJobRole || ''}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    placeholder="Enter your desired job role"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Technical Skills Section */}
                <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                        <Code className="text-violet-600 mr-2" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">Technical Skills</h2>
                    </div>

                    {/* Add New Skill Input (only shows in edit mode) */}
                    {isEditing && (
                        <div className="mb-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyDown={handleNewSkillKeyDown}
                                    placeholder="Add a new skill"
                                    className="flex-grow p-2 border border-gray-300 rounded focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                />
                                <button
                                    onClick={handleAddSkill}
                                    className="flex items-center px-4 py-2 bg-violet-600 text-white rounded hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                                >
                                    <Plus size={18} className="mr-1" />
                                    Add
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Press Enter or click Add to add the skill
                            </p>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {(isEditing ? editedData.technicalSkills : userData.technicalSkills)?.map((skill) => (
                            <div
                                key={skill}
                                onClick={() => handleSkillToggle(skill)}
                                className={`
                px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all
                ${isEditing
                                        ? editedData.technicalSkills.includes(skill)
                                            ? 'bg-violet-100 text-violet-800 border border-violet-300 hover:bg-violet-200'
                                            : 'bg-gray-100 text-gray-500 border border-gray-300 hover:bg-gray-200 line-through'
                                        : 'bg-violet-100 text-violet-800 border border-violet-300'
                                    }
              `}
                            >
                                {skill}
                            </div>
                        ))}
                    </div>

                    {isEditing && (
                        <p className="text-sm text-gray-600 mt-2">
                            Click on a skill to toggle its selection. Add new skills using the input above.
                        </p>
                    )}
                </div>

                {isEditing && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex items-center px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                        >
                            <Save size={18} className="mr-2" />
                            Save Changes
                        </button>
                    </div>
                )}

                {isLoading && isEditing && (
                    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <p className="text-violet-600 font-medium">Saving changes...</p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}