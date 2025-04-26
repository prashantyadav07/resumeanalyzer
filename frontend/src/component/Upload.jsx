import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Search, X, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Base URL for API - adjust as needed for your environment
const API_BASE_URL = 'http://localhost:8000/api/v1';

export default function PDFUploader() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const [uploadedDocId, setUploadedDocId] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Auto-analyze after upload if we have a document ID
  useEffect(() => {
    if (uploadedDocId) {
      analyzeDocument(uploadedDocId);
      setUploadedDocId(null); // Reset to prevent multiple analyses
    }
  }, [uploadedDocId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/pdf`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data.documents);
      } else {
        throw new Error(data.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError(`Failed to load documents: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const searchDocuments = async () => {
    setLoading(true);
    if (!searchQuery.trim()) {
      fetchDocuments();
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/pdf/search?query=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data || []);
        setError(null);
      } else {
        throw new Error(data.message || 'Search failed');
      }
    } catch (error) {
      console.error('Error searching documents:', error);
      setError(`Search failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setFile(null);
        setError("Please select a PDF file");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please drop a PDF file");
      }
    }
  };

  const uploadFile = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    const formData = new FormData();
    formData.append('pdf', file);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      const response = await fetch(`${API_BASE_URL}/pdf/upload`, {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Server returned status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setProgress(100);
        setUploaded(true);
        setUploading(false);
        
        // Store the uploaded document ID for analysis
        if (data.data && data.data.document && data.data.document._id) {
          setUploadedDocId(data.data.document._id);
        }
        
        fetchDocuments();
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      setProgress(0);
      setUploading(false);
      setError(err.message || 'Error uploading file');
      console.error('Upload error:', err);
    }
  };

  const clearFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploaded(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const analyzeDocument = async (id) => {
    try {
      setAnalysisData({ loading: true });
      
      const response = await fetch(`${API_BASE_URL}/gemini/analyze/${id}`);
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalysisData(data.data || data);
        setError(null);
      } else {
        throw new Error(data.message || 'Analysis failed');
      }
    } catch (error) {
      setError(`Error analyzing document: ${error.message}`);
      setAnalysisData(null);
      console.error('Error analyzing document:', error);
    }
  };

  const deleteDocument = async (id) => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/pdf/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Server returned status ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setDocuments(prevDocs => prevDocs.filter(doc => doc._id !== id));
        if (analysisData && analysisData.documentId === id) {
          setAnalysisData(null);
        }
        setError(null);
      } else {
        throw new Error(data.message || 'Failed to delete document');
      }
    } catch (error) {
      setError(`Error deleting document: ${error.message}`);
      console.error('Error deleting document:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchDocuments();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MINI RESUME ANALYZER</h2>
      
      {error && (
        <Alert variant="destructive" className="mb-4 animate-fadeIn">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-2 right-2 h-6 w-6 p-0" 
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}
      
      {uploaded && !analysisData && (
        <Alert className="mb-4 bg-green-50 border-green-200 animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your PDF has been uploaded successfully! Analyzing document...</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-xl overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <h3 className="font-semibold text-lg text-gray-800">Upload New Document</h3>
            </div>
            
            {!file ? (
              <div 
                className="border-2 border-dashed rounded-lg m-4 p-8 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-16 w-16 text-blue-400 mb-4" />
                <p className="text-lg font-medium mb-2">Drag & drop your PDF here</p>
                <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                <Button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white transition-all duration-300"
                >
                  Select PDF File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center mb-4 bg-blue-50 rounded-lg p-3">
                  <FileText className="h-10 w-10 text-blue-500 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearFile} 
                    className="text-gray-500 hover:text-red-500 transition-colors duration-200"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
                
                {(uploading || uploaded) && (
                  <div className="mb-4">
                    <Progress 
                      value={progress} 
                      className="h-2" 
                      indicatorClassName={uploaded ? "bg-green-500" : "bg-blue-500"}
                    />
                    <p className="text-xs text-gray-500 text-right mt-1">{progress}%</p>
                  </div>
                )}
                
                {!uploading && !uploaded && (
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 transition-all duration-300" 
                    onClick={uploadFile}
                    disabled={uploading}
                  >
                    Upload & Analyze PDF
                  </Button>
                )}
                
                {uploaded && (
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                    onClick={clearFile}
                  >
                    Upload Another PDF
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800">Document Library</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchDocuments} 
              disabled={loading}
              className="text-indigo-600 hover:text-indigo-800"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 border-indigo-200 focus:border-indigo-400 focus:ring-indigo-300"
              />
              <Button 
                onClick={searchDocuments}
                className="bg-indigo-500 hover:bg-indigo-600 transition-colors duration-200"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No documents found</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div 
                    key={doc._id} 
                    className="border rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center p-3 bg-gradient-to-r from-white to-indigo-50">
                      <FileText className="h-6 w-6 text-indigo-500 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.filename}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs bg-indigo-50">
                            {doc.metaData?.pageCount || 0} pages
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between p-2 bg-gray-50 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => analyzeDocument(doc._id)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Analyze
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this document?')) {
                            deleteDocument(doc._id);
                          }
                        }}
                        disabled={isDeleting}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {analysisData && (
        <div className="mt-6 bg-white shadow-md rounded-xl overflow-hidden animate-fadeIn">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800">
              {analysisData.loading ? 'Analyzing Document...' : `Analysis Summary for ${analysisData.resumeName || 'Document'}`}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setAnalysisData(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {analysisData.loading ? (
            <div className="flex justify-center items-center h-32">
              <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
            </div>
          ) : (
            <div className="p-4 md:p-6 space-y-6">
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 flex-1 min-w-48">
                  <h4 className="text-sm text-gray-500 mb-1">Overall Score</h4>
                  <div className="text-2xl font-bold text-blue-700">{analysisData.analysis?.overallScore || 'N/A'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-2 text-green-800 border-b pb-1">Top Key Strengths</h4>
                {analysisData.analysis?.keyStrengths?.length > 0 ? (
                  <ul className="space-y-1">
                    {analysisData.analysis.keyStrengths.slice(0, 3).map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No key strengths identified</p>
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-lg mb-2 text-amber-800 border-b pb-1">Top Priority Improvements</h4>
                {analysisData.analysis?.priorityImprovements?.length > 0 ? (
                  <ul className="space-y-1">
                    {analysisData.analysis.priorityImprovements.slice(0, 3).map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="h-4 w-4 text-amber-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No priority improvements suggested</p>
                )}
              </div>
              
              {analysisData.analysis?.overallAssessment && (
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-indigo-800 border-b pb-1">Overall Assessment</h4>
                  <p className="text-gray-700 bg-indigo-50 p-3 rounded-lg">{analysisData.analysis.overallAssessment}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}