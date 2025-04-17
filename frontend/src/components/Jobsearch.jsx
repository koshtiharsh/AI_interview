import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, Briefcase, Calendar, ExternalLink, Filter } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";

const ProfileBasedJobRecommendations = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keywordUsed, setKeywordUsed] = useState("");
    const [filters, setFilters] = useState({
        remote: false,
        minMatch: 60,
        fromMonth: new Date().getMonth(), // Default to current month
        fromYear: 2025, // Default year 2025
        showRangeUntilNow: true, // New state to track if we should show from selected date until now
        location: "all"
    });
    const [availableLocations, setAvailableLocations] = useState([]);
    const [query] = useSearchParams();

    const jobpost = query.get('jobpost')
    const [searchParams, setSearchParams] = useState({ what: jobpost || "", where: "" });

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Get current date for comparison
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Fetch jobs from Express backend
    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:2000/jobs", { params: searchParams });

            // Handle the new response structure from our enhanced backend
            const responseData = response.data;
            const jobResults = Array.isArray(responseData) ? responseData : (responseData.results || []);

            // Store which keyword was used (if available in new response format)
            if (responseData.keywordUsed) {
                setKeywordUsed(responseData.keywordUsed);
            }

            const fetchedJobs = jobResults.map((job) => ({
                id: job.id,
                title: job.title,
                company: job.company?.display_name || "Unknown",
                location: job.location?.display_name || "Remote",
                salary: job.salary_min
                    ? `$${job.salary_min.toLocaleString()} - $${job.salary_max?.toLocaleString()}`
                    : "Not disclosed",
                match: Math.floor(Math.random() * 40) + 60, // Simulating match %
                description: job.description,
                descriptionPreview: job.description.slice(0, 150) + "...",
                posted: new Date(job.created).toDateString(),
                postedDate: new Date(job.created),
                remote: job.contract_time === "remote" || job.location?.display_name?.toLowerCase().includes("remote"),
                redirect_url: job.redirect_url,
                isFresher: job.description.toLowerCase().includes("fresher") ||
                    job.description.toLowerCase().includes("no experience") ||
                    job.description.toLowerCase().includes("0 year experience") ||
                    job.description.toLowerCase().includes("0+ year") ||
                    job.description.toLowerCase().includes("0-1 year")
            }));

            // Extract all unique locations
            const locations = [...new Set(fetchedJobs.map(job => job.location))];
            setAvailableLocations(locations);

            setJobs(fetchedJobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchJobs();
    }, [searchParams]);

    // Handle search input change
    const handleInputChange = (e) => {
        setSearchParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // Apply filters and sort
    const filteredJobs = jobs
        .filter((job) => {
            // Apply remote filter
            if (filters.remote && !job.remote) return false;

            // Apply match percentage filter
            if (job.match < filters.minMatch) return false;

            // Apply location filter
            if (filters.location !== "all" && job.location !== filters.location) return false;

            // Apply date filter (from selected month/year to current date)
            const jobMonth = job.postedDate.getMonth();
            const jobYear = job.postedDate.getFullYear();
            
            const selectedFromDate = new Date(filters.fromYear, filters.fromMonth);
            const jobDate = new Date(jobYear, jobMonth);

            if (filters.showRangeUntilNow) {
                // Check if job date is between selected date and current date
                return jobDate >= selectedFromDate && jobDate <= currentDate;
            } else {
                // If not showing range, just check the exact month/year
                return jobMonth === parseInt(filters.fromMonth) && jobYear === parseInt(filters.fromYear);
            }
        })
        .sort((a, b) => {
            // Sort by fresher status (fresher jobs first)
            if (a.isFresher && !b.isFresher) return -1;
            if (!a.isFresher && b.isFresher) return 1;

            // Then by match percentage
            return b.match - a.match;
        });

    // Get match badge color
    const getMatchBadgeColor = (match) => {
        if (match >= 85) return "bg-green-500";
        if (match >= 70) return "bg-yellow-500";
        return "bg-orange-400";
    };

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-6">
                <h2 className="text-2xl font-bold text-white">Job Recommendations</h2>
                <p className="text-indigo-100 mt-1">Personalized job opportunities based on your Profile</p>
                {keywordUsed && (
                    <p className="text-indigo-100 mt-1 text-sm">
                        {/* Using keyword modifier: <span className="font-semibold">{keywordUsed}</span> */}
                    </p>
                )}
            </div>

            <div className="p-6">
                {/* Search and Filter Controls */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                        <Filter size={18} className="text-gray-700 mr-2" />
                        <h3 className="font-medium text-gray-800">Filters</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Location Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <select
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            >
                                <option value="all">All Locations</option>
                                {availableLocations.map((location, index) => (
                                    <option key={index} value={location}>{location}</option>
                                ))}
                            </select>
                        </div>

                        {/* From Month and Year Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Month</label>
                            <select
                                name="fromMonth"
                                value={filters.fromMonth}
                                onChange={handleFilterChange}
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            >
                                {months.map((month, index) => (
                                    <option key={index} value={index}>{month}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">From Year</label>
                            <select
                                name="fromYear"
                                value={filters.fromYear}
                                onChange={handleFilterChange}
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            >
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center mt-4 space-x-6">
                        <div className="flex items-center">
                            <input
                                id="show-range"
                                name="showRangeUntilNow"
                                type="checkbox"
                                checked={filters.showRangeUntilNow}
                                onChange={handleFilterChange}
                                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300"
                            />
                            <label htmlFor="show-range" className="ml-2 text-sm font-medium text-gray-700">
                                Show jobs from selected date until now
                            </label>
                        </div>
                        
                        <div className="flex items-center">
                            <input
                                id="remote-filter"
                                name="remote"
                                type="checkbox"
                                checked={filters.remote}
                                onChange={handleFilterChange}
                                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300"
                            />
                            <label htmlFor="remote-filter" className="ml-2 text-sm font-medium text-gray-700">
                                Remote only
                            </label>
                        </div>
                    </div>
                    
                    {filters.showRangeUntilNow && (
                        <div className="mt-2 px-2 py-1 bg-blue-50 text-blue-800 text-sm rounded">
                            Showing jobs from {months[filters.fromMonth]} {filters.fromYear} to {months[currentMonth]} {currentYear} (current date)
                        </div>
                    )}
                </div>

                {/* Job Search
                <div className="mb-6 flex items-center gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="what"
                            value={searchParams.what}
                            onChange={handleInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                            placeholder="Job title (e.g., Developer)"
                        />
                    </div>

                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <MapPin size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="where"
                            value={searchParams.where}
                            onChange={handleInputChange}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                            placeholder="Location (e.g., Pune)"
                        />
                    </div>

                    <button
                        onClick={fetchJobs}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
                    >
                        Search
                    </button>
                </div> */}

                {/* Job Listings */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No jobs found. Try adjusting your search criteria.</p>
                                <p className="mt-2 text-sm">Total jobs in original results: {jobs.length}</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-sm text-gray-500 mb-2">
                                    Showing {filteredJobs.length} of {jobs.length} jobs
                                </div>
                                {filteredJobs.map((job) => (
                                    <div key={job.id} className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${job.isFresher ? 'border-green-400' : ''}`}>
                                        <div className="p-4 relative">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                                                    <div className="text-gray-600">{job.company}</div>
                                                    {job.isFresher && (
                                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                                                            Fresher Friendly
                                                        </span>
                                                    )}
                                                </div>
                                                <div className={`${getMatchBadgeColor(job.match)} text-white font-medium text-sm px-3 py-1 rounded-full`}>
                                                    {job.match}% Match
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-y-2 mt-3 text-sm text-gray-500">
                                                <div className="flex items-center mr-4">
                                                    <MapPin size={16} className="mr-1" />
                                                    {job.location}
                                                </div>
                                                <div className="flex items-center mr-4">
                                                    <Briefcase size={16} className="mr-1" />
                                                    {job.salary}
                                                </div>
                                                <div className="flex items-center">
                                                    <Calendar size={16} className="mr-1" />
                                                    {job.posted}
                                                </div>
                                            </div>

                                            <p className="mt-3 text-sm text-gray-600">{job.descriptionPreview}</p>

                                            <div className="mt-4 flex justify-between items-center">
                                                <div className="text-sm text-gray-500">{job.remote ? "Remote position" : "On-site position"}</div>
                                                <a
                                                    href={job.redirect_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                                >
                                                    View job <ExternalLink size={14} className="ml-1" />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileBasedJobRecommendations;