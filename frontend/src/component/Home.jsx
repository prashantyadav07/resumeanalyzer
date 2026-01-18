// --- START OF FILE src/component/Home.jsx (FULLY UPDATED AND COMPLETE) ---

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
    Upload, FileText, CheckCircle, AlertCircle, Trash2, Loader2, LogIn, LogOut,
    User, Github, ChevronRight, BarChart4, Cpu, Palette, TabletSmartphone, Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge"; 
import toast from 'react-hot-toast';
import axios from 'axios';
import { auth } from '../firebase';
import logoImage from '../assets/logo.png'; 

// --- AXIOS API SETUP ---
const API_BASE_URL = 'http://localhost:3000/api/v1'; 
const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use(async (config) => {
    const token = await auth.currentUser?.getIdToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// --- MAIN WRAPPER COMPONENT ---
const Home = () => {
    const { currentUser } = useAuth();
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-x-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-100/[0.03] dark:bg-grid-slate-700/[0.05]"></div>
             <Navbar />
            <AnimatePresence mode="wait">
                {currentUser ? (
                    <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Dashboard />
                    </motion.div>
                ) : (
                    <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <LandingPage />
                    </motion.div>
                )}
            </AnimatePresence>
            <Footer />
        </div>
    );
};


// --- UI COMPONENTS ---

const Navbar = () => {
    const { currentUser, signInWithGoogle, signOut } = useAuth();
    return (
        <header className="sticky top-0 z-50 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} className="flex items-center space-x-3">
                        <img src={logoImage} alt="Resume Analyzer Logo" className="h-8 w-auto" />
                        <span className="text-xl font-bold tracking-tight">ResumeAnalyzer</span>
                    </motion.div>
                    <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} className="flex items-center space-x-2 sm:space-x-4">
                        {currentUser ? (
                            <>
                                <Avatar className="h-9 w-9"><AvatarImage src={currentUser.photoURL} alt={currentUser.displayName} /><AvatarFallback>{currentUser.displayName?.[0]}</AvatarFallback></Avatar>
                                <Button variant="ghost" size="sm" onClick={() => signOut().then(() => toast.success("Signed out!"))}>
                                    <LogOut className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Sign Out</span>
                                </Button>
                            </>
                        ) : ( 
                            <Button onClick={() => signInWithGoogle().catch(() => toast.error("Sign in failed"))} className="bg-white text-gray-800 border border-gray-300 shadow-sm hover:bg-gray-100 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700 transition-all group px-3 sm:px-4 py-2">
                                <svg aria-hidden="true" className="w-5 h-5 sm:mr-2" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 262"><path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path><path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.27 12.04-45.257 12.04-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.186-.524 1.49c21.621 42.709 63.824 72.028 113.469 72.028z"></path><path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.8-4.351-25.82 0-9.02.964-17.697 3.204-25.82l-1.138-.498-39.062-30.123-.623 1.492c-5.864 11.7-9.282 24.66-9.282 38.812 0 14.152 3.548 27.112 9.11 38.812l41.057-31.913z"></path><path fill="#EB4335" d="M130.55 50.479c19.205 0 36.344 6.698 49.088 18.857l36.844-35.894C195.245 12.91 165.798 0 130.55 0 81.024 0 38.875 29.318 17.254 72.028l41.196 31.913c10.445-31.477 39.746-54.25 74.269-54.25z"></path></svg>
                                <span className="hidden sm:inline text-sm font-medium">Sign In with Google</span>
                            </Button>
                        )}
                    </motion.div>
                </div>
            </div>
        </header>
    );
};

const LandingPage = () => {
    const { signInWithGoogle } = useAuth();
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    const features = [ 
        { icon: Cpu, title: "AI-Powered Analysis", description: "Leverage Google's Gemini AI to get deep insights on your resume's effectiveness." },
        { icon: Palette, title: "Modern & Clean UI", description: "Enjoy a beautiful, intuitive interface built with the latest web technologies." },
        { icon: TabletSmartphone, title: "Fully Responsive", description: "Analyze your resume on any device, whether on a desktop, tablet, or phone." }
    ];

    return (
         <>
            <title>Free AI Resume Analyzer - Check Your CV Score | ResumeAnalyzer</title>
            <meta name="description" content="Get instant AI-powered feedback on your resume. Our free tool analyzes your CV for ATS keywords, formatting, and provides a score to help you land your dream job." />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 text-center relative z-10">
                <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}>
                    <Badge variant="outline" className="py-1 px-3 mb-4 border-blue-300 dark:border-blue-700">Powered by Gemini AI</Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">Upgrade Your Resume, <br/> Fast-Track Your Career</h1>
                    <p className="max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400 mb-8">Stop guessing. Get instant, AI-driven feedback to optimize your resume and impress recruiters.</p>
                </motion.div>
                <motion.div initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{duration:0.7,delay:0.2}}>
                    <Button size="lg" className="rounded-full shadow-lg" onClick={()=>signInWithGoogle()}>Get Started for Free <ChevronRight className="h-5 w-5 ml-2"/></Button>
                </motion.div>
                
                <div ref={ref} className="mt-24 md:mt-32 w-full text-left">
                     <motion.h2 
                         initial={{opacity:0, y:20}} 
                         animate={isInView ? {opacity:1, y:0} : {}}
                         transition={{duration: 0.5}}
                         className="text-3xl font-bold text-center mb-8"
                     >
                         Why Choose Us?
                     </motion.h2>
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
                    >
                        {features.map((feature, i) => (
                            <motion.div 
                                key={i} 
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                                }}
                            >
                                <Card className="h-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
                                    <CardHeader>
                                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg w-fit mb-2">
                                            <feature.icon className="h-6 w-6 text-blue-600"/>
                                        </div>
                                        <CardTitle>{feature.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </main>
        </>
    );
};

const Dashboard = () => {
    const [file, setFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [analysisData, setAnalysisData] = useState(null);
    const [loadingState, setLoadingState] = useState({
        docs: true,
        upload: false,
        analysis: false,
        delete: null,
        pdfGenerate: false // <-- NEW STATE FOR PDF GENERATION
    });
    const fileInputRef = useRef(null);
    
    const fetchDocuments = async () => {
        setLoadingState(p => ({ ...p, docs: true }));
        try {
            const { data } = await api.get('/pdf/');
            if (data.success) setDocuments(data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch docs.");
        } finally {
            setLoadingState(p => ({ ...p, docs: false }));
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else if (selectedFile) {
            toast.error("Please select a PDF file.");
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoadingState(p => ({ ...p, upload: true }));
        const toastId = toast.loading("Uploading PDF...");
        const formData = new FormData();
        formData.append('pdf', file);
        try {
            const { data } = await api.post('/pdf/upload', formData);
            if (data.success) {
                toast.success("PDF uploaded! Analyzing...", { id: toastId });
                setFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                await fetchDocuments();
                await analyzeDocument(data.data.document._id);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed.', { id: toastId });
        } finally {
            setLoadingState(p => ({ ...p, upload: false }));
        }
    };

    const analyzeDocument = async (id) => {
        setAnalysisData(null);
        setLoadingState(p => ({ ...p, analysis: true }));
        const toastId = toast.loading("AI is analyzing resume...");
        try {
            const { data } = await api.get(`/gemini/analyze/${id}`);
            if (data.success) {
                toast.success("Analysis complete!", { id: toastId });
                setAnalysisData(data.data);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Analysis failed.", { id: toastId });
        } finally {
            setLoadingState(p => ({ ...p, analysis: false }));
        }
    };

    const deleteDocument = async (id) => {
        if (!window.confirm("Delete this document? This action cannot be undone.")) return;
        setLoadingState(p => ({ ...p, delete: id }));
        const toastId = toast.loading("Deleting document...");
        try {
            // ✅ UPDATED DELETE ENDPOINT
            await api.delete(`/delete/pdf/${id}`);
            toast.success("Document deleted.", { id: toastId });
            setDocuments(docs => docs.filter(d => d._id !== id));
            if (analysisData?.resumeId === id) setAnalysisData(null);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete.", { id: toastId });
        } finally {
            setLoadingState(p => ({ ...p, delete: null }));
        }
    };

    // --- ⭐ NEW FUNCTION TO GENERATE AND DOWNLOAD PDF ---
    const handleGenerateAndDownload = async (id) => {
        setLoadingState(p => ({ ...p, pdfGenerate: true }));
        const toastId = toast.loading("Generating your new ATS-friendly resume...");

        try {
            const response = await api.post(
                `/gemini/generate-resume/${id}`,
                {},
                { responseType: 'blob' } // IMPORTANT: tells axios to expect a file
            );

            // Create a Blob from the PDF stream
            const file = new Blob([response.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const link = document.createElement('a');
            link.href = fileURL;
            link.setAttribute('download', 'ATS_Optimized_Resume.pdf');
            document.body.appendChild(link);
            link.click();

            // Clean up
            link.parentNode.removeChild(link);
            URL.revokeObjectURL(fileURL);
            
            toast.success("Your resume has been downloaded!", { id: toastId });

        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF. Please try again.", { id: toastId });
        } finally {
            setLoadingState(p => ({ ...p, pdfGenerate: false }));
        }
    };

    useEffect(() => { fetchDocuments() }, []);

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <motion.div className="lg:col-span-2 flex flex-col gap-8" variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}>
                    <UploaderCard file={file} loading={loadingState.upload} onFileChange={handleFileChange} onUpload={handleUpload} fileInputRef={fileInputRef} setFile={setFile} />
                    <DocumentList documents={documents} loading={loadingState.docs} deletingId={loadingState.delete} onAnalyze={analyzeDocument} onDelete={deleteDocument} />
                </motion.div>
                <motion.div className="lg:col-span-3" variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}>
                    <AnalysisPanel 
                        loading={loadingState.analysis} 
                        data={analysisData} 
                        onGenerate={handleGenerateAndDownload} 
                        isGenerating={loadingState.pdfGenerate}
                    />
                </motion.div>
            </motion.div>
        </main>
    );
};

const UploaderCard = ({ file, loading, onFileChange, onUpload, fileInputRef, setFile }) => {
    const [isDragging, setIsDragging] = useState(false);
    const handleDragOver = (e) => {e.preventDefault();setIsDragging(true)};
    const handleDragLeave = (e) => {e.preventDefault();setIsDragging(false)};
    const handleDrop = (e) => {e.preventDefault();setIsDragging(false);const droppedFile=e.dataTransfer.files[0];if(droppedFile&&droppedFile.type==='application/pdf'){setFile(droppedFile);onFileChange({target:{files:[droppedFile]}})}else if(droppedFile){toast.error("Please drop a PDF file only.")}};
    
    return(
        <Card className={`shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10 ${loading?'opacity-50 pointer-events-none':''}`}>
            <CardHeader><CardTitle>Upload New Resume</CardTitle></CardHeader>
            <CardContent>
                {!file?(<motion.div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 ease-in-out relative border-slate-300 dark:border-slate-700" variants={{idle:{borderColor:"hsl(var(--border))",backgroundColor:"transparent"},dragging:{borderColor:"hsl(262 83% 58%)",backgroundColor:"hsla(262, 83%, 58%, 0.1)",scale:1.05}}} animate={isDragging?"dragging":"idle"} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={()=>fileInputRef.current?.click()}>
                    <AnimatePresence>{isDragging&&(<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute -inset-2 rounded-lg bg-violet-500/30 blur-lg"></motion.div>)}</AnimatePresence>
                    <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={onFileChange}/>
                    <motion.div variants={{idle:{scale:1},dragging:{scale:1.2}}} className="flex flex-col items-center justify-center">
                        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-2 transition-colors"/><p className="font-semibold text-base transition-colors">{isDragging?'Drop the file!':'Click or drag to upload'}</p><p className="text-xs text-slate-500">PDF only, max 5MB</p>
                    </motion.div>
                </motion.div>):(
                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
                    <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center space-x-3">
                        <FileText className="h-10 w-10 text-violet-500 flex-shrink-0"/><div className="flex-1 overflow-hidden"><p className="font-semibold text-sm truncate">{file.name}</p><p className="text-xs text-slate-500">{(file.size/1024).toFixed(1)} KB</p></div>
                        <button onClick={()=>{setFile(null);if(fileInputRef.current)fileInputRef.current.value=""}} className="p-1 text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="h-5 w-5"/></button>
                    </div>
                    <Button className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white" onClick={onUpload} disabled={loading}>{loading?<Loader2 className="animate-spin mr-2"/>:<Cpu className="h-4 w-4 mr-2"/>}Upload & Analyze</Button>
                </motion.div>
                )}
            </CardContent>
        </Card>
    );
};

const DocumentList=({documents,loading,deletingId,onAnalyze,onDelete})=>(
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 relative z-10">
        <CardHeader><CardTitle>Your Document Library</CardTitle></CardHeader>
        <CardContent>
            <motion.div className="max-h-96 min-h-[10rem] overflow-y-auto space-y-3 -m-2 p-2">
                <AnimatePresence>
                    {loading?<motion.div key="loader" className="flex justify-center items-center h-40"><Loader2 className="animate-spin text-violet-400 h-8 w-8"/></motion.div>:
                    documents.length>0?(documents.map((doc)=>(<motion.div layout key={doc._id} initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20,transition:{duration:0.2}}} className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center space-x-3 truncate"><FileText className="h-5 w-5 text-violet-400"/><span className="truncate font-medium text-sm">{doc.filename}</span></div>
                        <div className="flex items-center space-x-1"><Button size="sm" variant="ghost" onClick={()=>onAnalyze(doc._id)}>Analyze</Button><Button size="icon" variant="ghost" onClick={()=>onDelete(doc._id)} disabled={deletingId===doc._id}>{deletingId===doc._id?<Loader2 className="h-4 w-4 animate-spin"/>:<Trash2 className="h-4 w-4 text-red-500/80 hover:text-red-500"/>}</Button></div>
                    </motion.div>))):
                    <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} className="text-center p-8 text-slate-500 flex flex-col items-center h-40 justify-center"><FileText className="h-12 w-12 text-slate-700 mb-2"/>No documents yet.<br/>Upload one to begin.</motion.div>}
                </AnimatePresence>
            </motion.div>
        </CardContent>
    </Card>
);

const AnalysisPanel=({loading,data, onGenerate, isGenerating })=>(<Card className="shadow-xl min-h-full sticky top-24"><CardHeader><CardTitle>AI Analysis Report</CardTitle></CardHeader><CardContent className="pt-2"><AnimatePresence mode="wait">{loading?<LoadingAnalysis key="loading"/>:data?<AnalysisResult key="data" data={data} onGenerate={onGenerate} isGenerating={isGenerating} />:<PlaceholderAnalysis key="placeholder"/>}</AnimatePresence></CardContent></Card>);

const LoadingAnalysis=()=>(<motion.div className="flex flex-col items-center justify-center h-96" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><motion.div className="h-16 w-16 text-violet-500" animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:"linear"}}><Cpu/></motion.div><p className="font-semibold text-lg mt-4">Gemini AI is analyzing...</p><p className="text-sm text-slate-500">This might take a moment.</p></motion.div>);

const PlaceholderAnalysis=()=>(<motion.div className="flex flex-col items-center justify-center h-96 text-slate-600" initial={{opacity:0}} animate={{opacity:1,transition:{delay:0.2}}} exit={{opacity:0}}><BarChart4 className="h-20 w-20 mb-4 opacity-50"/><p className="text-lg font-medium text-center">Your report will appear here.</p><p className="text-sm text-center">Upload or select a document to begin.</p></motion.div>);

const AnalysisResult = ({ data, onGenerate, isGenerating }) => (
    <motion.div className="space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Score */}
        <motion.div className="text-center" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
            <CardDescription>
                Score for <span className="font-bold text-violet-600 dark:text-violet-400">{data.resumeName}</span>
            </CardDescription>
            <p className="text-7xl font-bold">{data.analysis.overallScore}<span className="text-2xl text-slate-500">/100</span></p>
        </motion.div>
        
        {/* Strengths */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}>
            <Card className="bg-slate-50 dark:bg-slate-800/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center text-slate-800 dark:text-slate-200">
                        <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />Strengths
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        {data.analysis.keyStrengths?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
        </motion.div>
        
        {/* Improvements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}>
            <Card className="bg-slate-50 dark:bg-slate-800/50">
                <CardHeader>
                    <CardTitle className="text-base flex items-center text-slate-800 dark:text-slate-200">
                        <AlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2" />Improvements
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300">
                        {data.analysis.priorityImprovements?.map((item, i) => <li key={i}>{item}</li>)}
                    </ul>
                </CardContent>
            </Card>
        </motion.div>

        {/* Overall Assessment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}>
            <h4 className="font-bold mb-2">Overall Assessment</h4>
            <p className="text-sm p-4 bg-slate-100 dark:bg-slate-800/70 rounded-lg text-slate-700 dark:text-slate-300">
                {data.analysis.overallAssessment}
            </p>
        </motion.div>

        {/* --- ⭐ NEW ACTION BUTTON --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }} className="pt-4 border-t border-slate-200 dark:border-slate-800">
             <Button 
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" 
                size="lg"
                onClick={() => onGenerate(data.resumeId)}
                disabled={isGenerating}
            >
                {isGenerating ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                    <Download className="h-5 w-5 mr-2" />
                )}
                {isGenerating ? 'Generating PDF...' : 'Generate & Download ATS Resume'}
            </Button>
            <p className="text-xs text-center text-slate-500 mt-2">Our AI will rewrite your resume and provide a downloadable PDF.</p>
        </motion.div>
    </motion.div>
);

const Footer=()=>(<footer className="bg-transparent mt-12"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-slate-500"><p>© {new Date().getFullYear()} Resume Analyzer. Crafted with ❤️ by Prashant Yadav.</p><a href="https://github.com/prashant-yadav-v" target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 hover:text-violet-400 transition-colors"><Github className="h-4 w-4 mr-1"/> View on GitHub</a></div></footer>);

export default Home;