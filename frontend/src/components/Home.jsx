import { useState } from 'react';
import { Menu, BarChart2, FileText, Award, Briefcase, User, ArrowRight, Star, Code, CheckCircle, Zap, PlayCircle, Database, Sparkles, Lightbulb, PieChart, Activity, Flame, Target, Globe, Layers, Cpu, Gauge, } from 'lucide-react';
import Navbar from './Navbar';
import EmotionChart from './EmotionGraph';

const AIInterviewHomepage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [animatedSection, setAnimatedSection] = useState(0);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header - Section 1 */}

      <header className="bg-white shadow-md sticky top-0 z-50 backdrop-filter backdrop-blur-lg bg-opacity-90">
        {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">InterviewXpert</span>
              </div>
              <nav className="hidden md:ml-10 md:flex md:space-x-10">
                <a href="#" className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Features
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  How it Works
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Contact
                </a>
              </nav>
            </div>
            <div className="hidden md:flex items-center">
              <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                Log in
              </a>
              <a href="#" className="ml-4 inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                Sign up free
              </a>
            </div>
            <div className="flex items-center md:hidden">
              <button onClick={toggleMobileMenu} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div> */}

        <Navbar />
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <a href="#" className="bg-blue-50 border-blue-500 text-blue-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                Home
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                Features
              </a>
              <a href="#HowItWork" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                How it Works
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                About
              </a>
              <a href="#" className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                Contact
              </a>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <a href="#" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">
                  Log in
                </a>
                <a href="#" className="block pl-3 pr-4 py-2 text-base font-medium text-blue-600 hover:text-blue-800">
                  Sign up free
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section - Section 2 */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Ace your next interview with</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 xl:inline"> AI-powered coaching</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Practice with our AI interviewer, get personalized feedback on your resume, discover job recommendations, and plan your career path—all in one platform.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md ">
                    <a href="/resume" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 md:py-4 md:text-lg md:px-10 transition-all duration-200">
                      Get started
                    </a>
                  </div>
                  <div className="mt-0 sm:mt-0 sm:ml-3">
                    <a href="https://youtu.be/z8Yumo9hybA?si=1rAeuk508y0Vhonr" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-colors duration-200">
                      <PlayCircle className="mr-2 h-5 w-5" /> Watch demo
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-r from-blue-100 to-violet-100 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <div className="w-3/4 h-3/4 bg-white rounded-xl shadow-xl flex items-center justify-center border border-blue-100 overflow-hidden relative">
              <div className="absolute top-0 w-full h-10 bg-gradient-to-r from-blue-600 to-violet-600 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-white text-xs font-medium ml-4">AI Interview Simulation</div>
              </div>
              <div className="mt-12 text-center w-full px-6">
                <div className="flex flex-col space-y-4">
                  <div className="px-8 py-3 mx-auto max-w-xs bg-blue-50 rounded-lg border border-blue-100 mb-3 text-sm text-left text-gray-600">
                    How would you handle a difficult customer?
                  </div>
                  <div className="px-8 py-3 mx-auto max-w-xs bg-violet-50 rounded-lg border border-violet-100 text-sm text-left text-gray-600">
                    When faced with a challenging customer, I first...
                  </div>
                  <div className="animate-pulse flex items-center space-x-2 px-8 py-3 mx-auto max-w-xs bg-gradient-to-r from-blue-50 to-violet-50 rounded-lg border border-blue-100 text-sm text-left text-gray-500">
                    <span className="inline-block w-3 h-3 bg-blue-400 rounded-full"></span>
                    <span className="inline-block w-3 h-3 bg-blue-400 rounded-full"></span>
                    <span className="inline-block w-3 h-3 bg-blue-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section - Section 3 */}
      <div className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our AI-powered platform helps you prepare for interviews, improve your resume, find jobs, and plan your career.
            </p>
          </div>
          <div className="mt-16">
            <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-12">
              {/* Feature 1 */}
              <div className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 hover:border-blue-100 group">
                <div className="absolute -top-6 flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg group-hover:rotate-3 transition-all duration-300">
                  <FileText className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Resume Analyzer</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Get detailed analysis of your resume with AI-powered feedback to help you stand out to potential employers and increase your chances of getting interviews.
                </div>
                <div className="mt-4 ml-16">
                  <a href="/resume" className="text-blue-600 hover:text-blue-500 inline-flex items-center text-sm font-medium">
                    Analyze your resume <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 hover:border-blue-100 group">
                <div className="absolute -top-6 flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg group-hover:rotate-3 transition-all duration-300">
                  <Zap className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Skill Analysis</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Identify your strengths and skill gaps with our AI assessment tool. Get personalized recommendations for skill development and learning resources.
                </div>
                <div className="mt-4 ml-16">
                  <a href="/resume/result" className="text-blue-600 hover:text-blue-500 inline-flex items-center text-sm font-medium">
                    Analyze your skills <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
              {/* Feature 3 */}
              <div className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 hover:border-blue-100 group">
                <div className="absolute -top-6 flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg group-hover:rotate-3 transition-all duration-300">
                  <User className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Mock HR Interviews</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Practice with our AI interviewer that simulates real HR interviews and provides instant feedback on your responses. Get comfortable with common questions.
                </div>
                <div className="mt-4 ml-16">
                  <a href="/hr" className="text-blue-600 hover:text-blue-500 inline-flex items-center text-sm font-medium">
                    Try mock interview <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>


              {/* Feature 4 */}
              <div className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 hover:border-blue-100 group">
                <div className="absolute -top-6 flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg group-hover:rotate-3 transition-all duration-300">
                  <Code className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Technical Interview Prep</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Master technical interviews with our specialized AI coach. Practice coding challenges, system design questions, and technical concepts explanation.
                </div>
                <div className="mt-4 ml-16">
                  <a href="/technical" className="text-blue-600 hover:text-blue-500 inline-flex items-center text-sm font-medium">
                    Practice tech interviews <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 hover:border-blue-100 group">
                <div className="absolute -top-6 flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg group-hover:rotate-3 transition-all duration-300">
                  <Award className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Career Path Planning</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Get guidance on potential career paths, skill development opportunities, and long-term professional growth strategies tailored to your goals.
                </div>
                <div className="mt-4 ml-16">
                  <a href="/careerpath" className="text-blue-600 hover:text-blue-500 inline-flex items-center text-sm font-medium">
                    Plan your career <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
              {/* Feature 6 */}


              <div className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105 hover:border-blue-100 group">
                <div className="absolute -top-6 flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg group-hover:rotate-3 transition-all duration-300">
                  <Briefcase className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Job Recommendations</p>
                <div className="mt-2 ml-16 text-base text-gray-500">
                  Receive personalized job recommendations based on your skills, experience, and career goals, with AI matching your profile to the perfect opportunities.
                </div>
                <div className="mt-4 ml-16">
                  <a href="/careerpath" className="text-blue-600 hover:text-blue-500 inline-flex items-center text-sm font-medium">
                    Find jobs <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Interactive Technology Section - NEW SECTION */}
      <div className="py-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Advanced Technology</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Powered by cutting-edge AI
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform leverages state-of-the-art artificial intelligence to deliver personalized career guidance.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="relative">
                <div className="bg-white p-8 rounded-xl shadow-xl border border-blue-100 relative z-10 transform transition-all duration-500 hover:scale-105">
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 -mt-12 w-16 h-16 rounded-lg shadow-lg flex items-center justify-center text-white mb-4">
                    <Database className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Natural Language Processing</h3>
                  <p className="text-gray-600 mb-6">
                    Our advanced NLP algorithms analyze your responses in real-time, providing contextual feedback and suggestions just like a human interviewer would.
                  </p>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Lightbulb className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-600">
                          Our AI can detect subtle nuances in your responses, including tone, confidence, and specific industry terminology.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg flex items-center">
                      <Cpu className="h-5 w-5 text-blue-700 mr-2" />
                      <span className="text-sm text-gray-700">Sentiment Analysis</span>
                    </div>
                    <div className="bg-gradient-to-r from-violet-50 to-violet-100 p-3 rounded-lg flex items-center">
                      <Sparkles className="h-5 w-5 text-violet-700 mr-2" />
                      <span className="text-sm text-gray-700">Content Evaluation</span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg flex items-center">
                      <Target className="h-5 w-5 text-blue-700 mr-2" />
                      <span className="text-sm text-gray-700">Relevance Scoring</span>
                    </div>
                    <div className="bg-gradient-to-r from-violet-50 to-violet-100 p-3 rounded-lg flex items-center">
                      <Activity className="h-5 w-5 text-violet-700 mr-2" />
                      <span className="text-sm text-gray-700">Answer Strength</span>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 w-64 h-64 bg-blue-100 rounded-full opacity-60 blur-3xl z-0"></div>
                <div className="absolute -top-4 -left-4 w-32 h-32 bg-violet-100 rounded-full opacity-60 blur-2xl z-0"></div>
              </div>

              <div className="relative">
                <div className="bg-white p-8 rounded-xl shadow-xl border border-blue-100 relative z-10 transform transition-all duration-500 hover:scale-105">
                  <div className="bg-gradient-to-r from-blue-600 to-violet-600 -mt-12 w-16 h-16 rounded-lg shadow-lg flex items-center justify-center text-white mb-4">
                    <BarChart2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Analytics</h3>
                  <p className="text-gray-600 mb-6">
                    Our platform analyzes your performance across multiple interviews to identify patterns and provide tailored improvement recommendations.
                  </p>

                  <div className="bg-gradient-to-r from-blue-50 to-violet-50 p-4 rounded-lg border border-blue-100 mb-6">
                    <div className="flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Communication clarity</span>
                        <span className="text-sm font-medium text-blue-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Technical knowledge</span>
                        <span className="text-sm font-medium text-blue-600">72%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "72%" }}></div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">Problem-solving</span>
                        <span className="text-sm font-medium text-blue-600">91%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "91%" }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg flex items-center">
                      <PieChart className="h-5 w-5 text-blue-700 mr-2" />
                      <span className="text-sm text-gray-700">Skill Assessment</span>
                    </div>
                    <div className="bg-gradient-to-r from-violet-50 to-violet-100 p-3 rounded-lg flex items-center">
                      <Gauge className="h-5 w-5 text-violet-700 mr-2" />
                      <span className="text-sm text-gray-700">Performance Tracking</span>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg flex items-center">
                      <Layers className="h-5 w-5 text-blue-700 mr-2" />
                      <span className="text-sm text-gray-700">Competency Mapping</span>
                    </div>
                    <div className="bg-gradient-to-r from-violet-50 to-violet-100 p-3 rounded-lg flex items-center">
                      <Flame className="h-5 w-5 text-violet-700 mr-2" />
                      <span className="text-sm text-gray-700">Growth Potential</span>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 w-64 h-64 bg-violet-100 rounded-full opacity-60 blur-3xl z-0"></div>
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-blue-100 rounded-full opacity-60 blur-2xl z-0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works - Section 4 */}
      <div className="py-16 bg-white" id='HowItWork'>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Process</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How InterviewXpert works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our streamlined process helps you become interview-ready in just a few steps.
            </p>
          </div>

          <div className="mt-16">
            <div className="relative">
              {/* Process steps */}
              <div className="hidden md:block absolute top-8 left-16 w-3/4 border-t-2 border-blue-200 border-dashed"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Step 1 */}
                <div className="relative flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg z-10">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Create Profile</h3>
                  <p className="mt-2 text-center text-base text-gray-500">
                    Sign up and complete your profile with your skills, experience, and career goals.
                  </p>
                </div>
                {/* Step 2 */}
                <div className="relative flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg z-10">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Choose Practice Area</h3>
                  <p className="mt-2 text-center text-base text-gray-500">
                    Select the type of interview you want to practice or service you need.
                  </p>
                </div>
                {/* Step 3 */}
                <div className="relative flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg z-10">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Practice & Improve</h3>
                  <p className="mt-2 text-center text-base text-gray-500">
                    Complete mock interviews or use our services to improve your skills and materials.
                  </p>
                </div>
                {/* Step 4 */}
                <div className="relative flex flex-col items-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg z-10">
                    <span className="text-xl font-bold">4</span>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Get Hired</h3>
                  <p className="mt-2 text-center text-base text-gray-500">
                    Apply your new skills and improved materials to land your dream job.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <a href="#" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              Start your journey <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Testimonials - Section 5 */}
      {/* <div className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Success stories from our users
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              See how InterviewXpert has helped professionals like you land their dream jobs.
            </p>
          </div> */}

      {/* <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8"> */}

      {/* <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">JD</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">John Doe</h3>
                    <p className="text-sm text-gray-500">Software Engineer at TechCorp</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3">
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                </div>
                <p className="text-gray-600">
                  "The technical interview practice helped me prepare for tough coding questions. I felt confident during my interviews and landed my dream job at TechCorp!"
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-600 font-bold text-lg">JS</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Jane Smith</h3>
                    <p className="text-sm text-gray-500">Marketing Manager at BrandCo</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3">
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                </div>
                <p className="text-gray-600">
                  "The resume analyzer pointed out flaws I would have never noticed. After making the suggested changes, I started getting callbacks for interviews immediately!"
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">RJ</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Robert Johnson</h3>
                    <p className="text-sm text-gray-500">Product Manager at InnovateCo</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3">
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                  <Star className="h-5 w-5" />
                </div>
                <p className="text-gray-600">
                  "The career path planning tool helped me understand what skills I needed to develop to reach my goals. Six months later, I received a promotion to my target role!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* FAQ Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">FAQ</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Find answers to common questions about InterviewXpert.
            </p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <dl className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg leading-6 font-medium text-gray-900">How does the AI interview practice work?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Our AI interview simulator uses advanced natural language processing to engage in realistic interview conversations. It asks industry-standard questions and evaluates your responses based on content, delivery, and relevance.
                </dd>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg leading-6 font-medium text-gray-900">Are the questions adaptive?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes! Our AI adjusts the difficulty dynamically. You start with easier questions, and as you progress, the system evaluates your performance and gradually increases the complexity to match your skill level.
                </dd>
              </div>
              {/* <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg leading-6 font-medium text-gray-900">Can I manually select the difficulty level?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Absolutely! You can select the difficulty level—beginner, intermediate, or advanced—based on your experience and preparation level.
                </dd>
              </div> */}

              {/* <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg leading-6 font-medium text-gray-900">Is my data secure?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, we take data security very seriously. All your personal information and interview data is encrypted and stored securely. We never share your data with third parties without your explicit consent.
                </dd>
              </div> */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg leading-6 font-medium text-gray-900">Do you offer specialized interview practice for specific industries?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, our AI is trained on industry-specific interviews across tech, finance, healthcare, marketing, and many more. You can select your industry when setting up your profile.
                </dd>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg leading-6 font-medium text-gray-900">Will I receive feedback on my responses?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, after each interview session, you will receive detailed feedback on your answers, including strengths, areas for improvement, and suggestions for enhancing your performance.
                </dd>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <dt className="text-lg leading-6 font-medium text-gray-900">Will I get a mock interview report?</dt>
                <dd className="mt-2 text-base text-gray-500">
                  Yes, after completing a mock interview, you will receive a detailed report analyzing your performance, along with recommendations for improvement.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>


      {/* Footer - Section 8 */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Branding Section */}
            <div className="col-span-1">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-violet-600 rounded-lg flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:rotate-3">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <span className="ml-3 text-xl font-bold text-white">InterviewXpert</span>
              </div>
              <p className="mt-4 text-gray-400 text-sm">
                AI-driven interview preparation and career guidance tailored for success.
              </p>
              <div className="mt-6 flex space-x-6">
                <a href="#" className="text-gray-400 hover:text-gray-300">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Section */}
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Our Services</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="/hr" className="text-base text-gray-300 hover:text-white">
                    AI-Powered Mock Interviews
                  </a>
                </li>
                <li>
                  <a href="/resume" className="text-base text-gray-300 hover:text-white">
                    Resume Analysis & Improvement
                  </a>
                </li>
                <li>
                  <a href="/careerpath" className="text-base text-gray-300 hover:text-white">
                    Career Compass – Personalized Career Guidance
                  </a>
                </li>

              </ul>
            </div>

            {/* Quick Links */}
            <div className="col-span-1">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Links</h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-300 hover:text-white">
                    How It Works
                  </a>
                </li>

              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 text-center">
              &copy; 2025 InterviewXpert, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default AIInterviewHomepage;