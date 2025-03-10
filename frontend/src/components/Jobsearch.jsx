import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, Briefcase, Calendar, ExternalLink, Filter } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";

const ProfileBasedJobRecommendations = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ remote: false, minMatch: 60 });
    const [query] = useSearchParams();

    const jobpost = query.get('jobpost')
    console.log(jobpost)
    const [searchParams, setSearchParams] = useState({ what: jobpost, where: "" });

    // Fetch jobs from Express backend
    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:2000/jobs", { params: searchParams });
            const fetchedJobs = response.data.map((job) => ({
                id: job.id,
                title: job.title,
                company: job.company?.display_name || "Unknown",
                location: job.location?.display_name || "Remote",
                salary: job.salary_min
                    ? `$${job.salary_min.toLocaleString()} - $${job.salary_max?.toLocaleString()}`
                    : "Not disclosed",
                match: Math.floor(Math.random() * 40) + 60, // Simulating match %
                description: job.description.slice(0, 150) + "...",
                posted: new Date(job.created).toDateString(),
                remote: job.contract_time === "remote" || job.location?.display_name?.toLowerCase().includes("remote"),
                redirect_url: job.redirect_url,
            }));
            setJobs(fetchedJobs);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const response = await axios.get("http://localhost:2000/jobs", { params: searchParams });
                const fetchedJobs = response.data.map((job) => ({
                    id: job.id,
                    title: job.title,
                    company: job.company?.display_name || "Unknown",
                    location: job.location?.display_name || "Remote",
                    salary: job.salary_min
                        ? `$${job.salary_min.toLocaleString()} - $${job.salary_max?.toLocaleString()}`
                        : "Not disclosed",
                    match: Math.floor(Math.random() * 40) + 60, // Simulating match %
                    description: job.description.slice(0, 150) + "...",
                    posted: new Date(job.created).toDateString(),
                    remote: job.contract_time === "remote" || job.location?.display_name?.toLowerCase().includes("remote"),
                    redirect_url: job.redirect_url,
                }));
                setJobs(fetchedJobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
            }
            setLoading(false);
        };
        fetchJobs();

    }, [])

    // Handle search input change
    const handleInputChange = (e) => {
        setSearchParams((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Apply filters
    const filteredJobs = jobs.filter((job) => {
        if (filters.remote && !job.remote) return false;
        if (job.match < filters.minMatch) return false;
        return true;
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
            </div>

            <div className="p-6">
                {/* Search Bar & Filters */}
                {/* <div className="mb-6 flex items-center justify-between">
                    <div className="relative w-64">
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

                    <div className="relative w-64">
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

                    <div className="flex items-center">
                        <input
                            id="remote-filter"
                            type="checkbox"
                            checked={filters.remote}
                            onChange={() => setFilters((prev) => ({ ...prev, remote: !prev.remote }))}
                            className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300"
                        />
                        <label htmlFor="remote-filter" className="ml-2 text-sm font-medium text-gray-700">
                            Remote only
                        </label>
                    </div>
                </div> */}

                {/* Job Listings */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredJobs.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">No jobs found. Try adjusting your search criteria.</div>
                        ) : (
                            filteredJobs.map((job) => (
                                <div key={job.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="p-4 relative">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                                                <div className="text-gray-600">{job.company}</div>
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

                                        <p className="mt-3 text-sm text-gray-600">{job.description}</p>

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
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileBasedJobRecommendations;
