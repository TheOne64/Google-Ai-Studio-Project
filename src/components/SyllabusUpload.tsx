import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Course } from '../types';

interface SyllabusUploadProps {
  onUploadSuccess: (courseData: Partial<Course>) => void;
}

const LOADING_STEPS = [
  'Detecting files and reading pixels...',
  'Analyzing syllabus structure with Gemini AI...',
  'Extracting important course and assignment data...',
  'Computing grades, weights, and urgency priorities...',
  'Formulating sequential preparation milestones...',
  'Generating your personalized study roadmap...'
];

export default function SyllabusUpload({ onUploadSuccess }: SyllabusUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [textMode, setTextMode] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [mimeType, setMimeType] = useState<string>('');
  const [base64Data, setBase64Data] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interval ref for loading step animations
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startLoadingAnimation = () => {
    setIsLoading(true);
    setLoadingStep(0);
    setError(null);
    
    stepIntervalRef.current = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);
  };

  const stopLoadingAnimation = () => {
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
      stepIntervalRef.current = null;
    }
    setIsLoading(false);
  };

  const handleFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP) of your syllabus.');
      return;
    }

    setMimeType(file.type);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
      
      // Extract clean Base64 data
      const base64 = result.split(',')[1];
      setBase64Data(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedImage = () => {
    setImagePreview(null);
    setBase64Data('');
    setMimeType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!base64Data && !pastedText.trim()) {
      setError('Please select an image or paste syllabus text to analyze.');
      return;
    }

    startLoadingAnimation();

    try {
      const response = await fetch('/api/analyze-syllabus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Data || null,
          mimeType: mimeType || null,
          textContent: textMode ? pastedText : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error occurred during parsing.');
      }

      const data = await response.json();
      
      // Double check structured output format
      if (!data.courseName) {
        throw new Error('Syllabus format was unrecognizable. Try pasting the direct text of your course schedules.');
      }

      // Add frontend specific fields like color & IDs to the returned API data
      const processedCourse: Partial<Course> = {
        name: data.courseName || 'New Course',
        code: data.courseCode || '',
        assignments: (data.assignments || []).map((a: any, aIdx: number) => ({
          id: `a-${Date.now()}-${aIdx}`,
          title: a.title,
          dueDate: a.dueDate,
          description: a.description || '',
          weight: a.weight || 'N/A',
          priority: (a.priority || 'medium').toLowerCase() as 'high' | 'medium' | 'low',
          completed: false,
          milestones: (a.milestones || []).map((m: any, mIdx: number) => ({
            id: `m-${Date.now()}-${aIdx}-${mIdx}`,
            title: m.title,
            description: m.description || '',
            durationHours: Number(m.durationHours) || 2,
            daysBeforeDue: Number(m.daysBeforeDue) || 3,
            completed: false,
            dateScheduled: '' // populated by parent scheduler
          }))
        }))
      };

      onUploadSuccess(processedCourse);
      // Reset upload state
      clearSelectedImage();
      setPastedText('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred. Please make sure you have standard connectivity and try again.');
    } finally {
      stopLoadingAnimation();
    }
  };

  return (
    <div id="syllabus-upload-container" className="bg-white border-4 border-emerald-100 rounded-[2.5rem] p-6 shadow-xl overflow-hidden relative text-slate-800">
      <div className="absolute top-0 right-0 p-8 opacity-[0.06] pointer-events-none">
        <Sparkles className="w-32 h-32 text-indigo-600" />
      </div>

      <div className="mb-6 relative z-10">
        <h2 id="upload-heading" className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
          Syllabus AI Extractor
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1 leading-relaxed">
          Upload a clear photograph, screenshot, or copy-paste text of your syllabus. Gemini AI will structure your deadlines and set up a customized study schedule.
        </p>
      </div>

      {isLoading ? (
        <div id="upload-loading-view" className="flex flex-col items-center justify-center py-10 px-4 relative z-10">
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-pulse" />
            </div>
          </div>
          
          <h3 className="text-base font-black text-slate-900 text-center mb-4">Analyzing your Syllabus...</h3>
          
          <div className="w-full max-w-md bg-slate-50 rounded-[1.5rem] p-5 border-2 border-slate-200 shadow-inner">
            <div className="flex flex-col gap-3">
              {LOADING_STEPS.map((step, idx) => {
                const isCompleted = idx < loadingStep;
                const isActive = idx === loadingStep;
                return (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    {isCompleted ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : isActive ? (
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex-shrink-0" />
                    )}
                    <span className={`transition-all duration-300 font-bold ${isCompleted ? 'text-slate-400 line-through' : isActive ? 'text-indigo-900 font-extrabold' : 'text-slate-400'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5 relative z-10">
          {/* Mode Selector */}
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl border-2 border-slate-200">
            <button
              id="mode-btn-image"
              onClick={() => { setTextMode(false); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${!textMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Upload className="w-4 h-4" />
              Syllabus Photo
            </button>
            <button
              id="mode-btn-text"
              onClick={() => { setTextMode(true); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${textMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <FileText className="w-4 h-4" />
              Paste Text
            </button>
          </div>

          {error && (
            <div id="upload-error-banner" className="bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs font-bold rounded-2xl p-4 flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {/* Area to upload/paste */}
          {!textMode ? (
            <div
              id="drag-drop-zone"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-4 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[190px] ${dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-slate-50/50'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/*"
                className="hidden"
              />

              {imagePreview ? (
                <div className="relative w-full max-w-[240px] rounded-[1.5rem] overflow-hidden group border-4 border-white shadow-md">
                  <img src={imagePreview} alt="Syllabus Preview" className="w-full h-32 object-cover" />
                  <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-xs font-black text-white">
                    Click to replace
                  </div>
                  <button
                    id="clear-image-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearSelectedImage();
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <span className="sr-only">Delete</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-slate-800 mb-3 transform -rotate-3 transition-transform">
                    <Upload className="w-6 h-6 text-indigo-500" />
                  </div>
                  <span className="text-sm font-black text-slate-800">
                    Drag and drop syllabus photo, or click to browse
                  </span>
                  <span className="text-xs text-slate-400 font-bold mt-1">
                    Supports JPG, PNG, WEBP files
                  </span>
                </>
              )}
            </div>
          ) : (
            <div id="text-paste-zone" className="relative">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your syllabus text, course schedule outline, weekly timeline, or deadline list here..."
                className="w-full h-44 bg-slate-50 border-2 border-slate-200 rounded-[1.5rem] p-4 text-slate-800 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white resize-none font-medium leading-relaxed"
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-black">
                {pastedText.length} characters
              </span>
            </div>
          )}

          {/* Analyze Button - Matches big green button in template */}
          <button
            id="analyze-syllabus-btn"
            onClick={handleAnalyze}
            disabled={(!base64Data && !pastedText.trim()) || isLoading}
            className={`w-full py-4 px-6 rounded-[2rem] text-sm font-black tracking-wider uppercase transition-all flex items-center justify-center gap-3 ${(!base64Data && !pastedText.trim()) || isLoading ? 'bg-slate-200 text-slate-400 border-4 border-slate-300 cursor-not-allowed shadow-none' : 'h-20 bg-emerald-400 hover:bg-emerald-500 rounded-[2rem] shadow-xl border-4 border-emerald-100 text-emerald-900 cursor-pointer active:scale-[0.98]'}`}
          >
            <Sparkles className="w-5 h-5 text-emerald-900" />
            Analyze Syllabus with Gemini
          </button>
        </div>
      )}
    </div>
  );
}
