import React, { useState } from 'react';
import VerificationAssistant from './VerificationAssistant';
import { analyzeIntake } from './lib/api';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface CredentialsUploadProps {
  onPassportCreated?: () => void;
}

export default function CredentialsUpload({ onPassportCreated }: CredentialsUploadProps) {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'success' | 'chat'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [fileContext, setFileContext] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [loadingText, setLoadingText] = useState('Initializing AI...');
  
  const [missingReasoning, setMissingReasoning] = useState('');
  const [intakeSessionId, setIntakeSessionId] = useState('');
  const [createdPassportId, setCreatedPassportId] = useState('');

  const runVerification = async (params: {
    sourceType: 'pdf_text' | 'drive_link';
    content: string;
    fileName?: string;
  }) => {
    setLoadingText('Analyzing credentials...');
    setStatus('analyzing');

    try {
      const result = await analyzeIntake(params);

      if (result.status === 'verified') {
        setCreatedPassportId(result.passportId || '');
        setStatus('success');
      } else {
        setMissingReasoning(result.missingFieldsReasoning || 'Please provide the missing company details.');
        setIntakeSessionId(result.sessionId || '');
        setStatus('chat');
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An error occurred during analysis.';
      alert(`Verification failed: ${message}`);
      setStatus('idle');
    }
  };

  React.useEffect(() => {
    if (status !== 'analyzing') return;

    const texts = [
      'Analyzing...',
      'Thinking...',
      'Pondering...',
      'Extracting details...',
      'Almost there...'
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % texts.length;
      setLoadingText(texts[i]);
    }, 2000);

    return () => clearInterval(interval);
  }, [status]);

  const readPdfFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
    setStatus('analyzing');
    setLoadingText('Reading PDF document...');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item) => {
            if (typeof item === 'object' && item !== null && 'str' in item) {
              return String(item.str);
            }

            return '';
          })
          .join(' ');
        extractedText += pageText + '\n';
      }

      const context = `[Extracted from ${file.name}]:\n${extractedText}`;
      setFileContext(context);
      await runVerification({
        sourceType: 'pdf_text',
        content: context,
        fileName: file.name,
      });
    } catch (err) {
      console.error("PDF extraction error:", err);
      alert("Could not read the PDF file. Please ensure it is a valid text-searchable PDF.");
      setStatus('idle');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      await readPdfFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      await readPdfFile(file);
    }
  };

  const handleSubmit = async () => {
    const finalContext = linkInput ? `Google Drive Link Provided: ${linkInput}` : fileContext;
    if (!finalContext) {
      alert("Please upload a file or provide a link.");
      return;
    }

    await runVerification({
      sourceType: linkInput ? 'drive_link' : 'pdf_text',
      content: finalContext,
      fileName: fileName || linkInput || undefined,
    });
  };

  if (status === 'chat') {
    return (
      <VerificationAssistant 
        sessionId={intakeSessionId}
        initialMissingReasoning={missingReasoning}
        fileName={fileName || linkInput}
        fileSize={fileSize}
        onComplete={async (result) => {
          setCreatedPassportId(result.passportId || '');
          setStatus('analyzing');
          setStatus('success');
        }}
      />
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full max-w-2xl mx-auto mt-20 flex flex-col items-center font-sans bg-white p-12 rounded-3xl shadow-sm border border-emerald-100 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Verification Complete</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Your credentials have been analyzed, and a company passport has been created in Firestore.
        </p>
        {createdPassportId && (
          <p className="text-slate-400 text-xs mb-6 font-mono">Passport ID: {createdPassportId}</p>
        )}
        {onPassportCreated && (
          <button
            onClick={onPassportCreated}
            className="bg-[#3B4569] text-white px-8 py-3 rounded-xl font-semibold shadow-sm hover:bg-[#2D3552] transition-colors mb-3"
          >
            View Passport
          </button>
        )}
        <button 
          onClick={() => { setStatus('idle'); setLinkInput(''); setFileName(''); setFileContext(''); setCreatedPassportId(''); }}
          className="bg-white border border-slate-200 text-slate-700 px-8 py-3 rounded-xl font-semibold shadow-sm hover:bg-slate-50 transition-colors"
        >
          Upload Another
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 flex flex-col items-center font-sans relative">
      {/* Header text */}
      <h1 className="text-[#102341] text-[2.5rem] font-bold mb-3 tracking-tight">
        Welcome to Innoweb
      </h1>
      <p className="text-[#64748B] text-lg mb-12">
        Join the regional innovation ecosystem
      </p>

      {/* Main Card */}
      <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 mb-8 relative overflow-hidden">
        
        {status === 'analyzing' && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-20 flex flex-col items-center justify-center transition-all duration-300">
            <div className="relative w-16 h-16 mb-6">
              <div className="absolute inset-0 rounded-full border-[3px] border-slate-200"></div>
              <div className="absolute inset-0 rounded-full border-[3px] border-[#3B4569] border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#3B4569] rounded-full animate-ping"></div>
              </div>
            </div>
            <p className="text-[#3B4569] font-semibold text-lg animate-pulse tracking-wide">{loadingText}</p>
          </div>
        )}

        {/* Required Fields Info */}
        <div className="mb-8 bg-blue-50/50 border border-blue-100/50 rounded-xl p-5">
          <h3 className="text-blue-800 font-semibold text-sm mb-2 flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Required Information
          </h3>
          <p className="text-blue-700/80 text-xs mb-3">To successfully pass AI verification, the company profile must explicitly state:</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-blue-800 text-xs font-medium pl-1">
            <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400"></div> Company Name</li>
            <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400"></div> Company Type</li>
            <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400"></div> Primary Industry</li>
            <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400"></div> Target Markets</li>
            <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400"></div> Business Model</li>
            <li className="flex items-center gap-1.5"><div className="w-1 h-1 rounded-full bg-blue-400"></div> Capabilities & Needs</li>
          </ul>
        </div>

        {/* Upload Section */}
        <div className="mb-8 relative">
          <h2 className="text-[#1E293B] font-medium text-[1.05rem] mb-4">
            Upload company credentials
          </h2>
          
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl transition-colors py-12 px-6 flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${
              isDragging
                ? 'border-[#3B4569] bg-blue-50 shadow-[0_0_0_4px_rgba(59,69,105,0.08)]'
                : 'border-[#CBD5E1] bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
            
            {fileName ? (
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4 shadow-sm border border-emerald-100 group-hover:shadow-md transition-shadow">
                <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            ) : (
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow">
                <svg viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                  <path d="M21 15v4a2 2 0 0 1-2-2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
            )}
            
            {fileName ? (
              <>
                 <p className="text-[#0F172A] font-medium mb-1.5">{fileName}</p>
                 <p className="text-emerald-500 text-sm font-medium flex items-center gap-1">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Selected successfully
                 </p>
              </>
            ) : (
              <>
                <p className="text-[#0F172A] font-medium mb-1.5">
                  {isDragging ? 'Drop the PDF to upload' : 'Drop your PDF here or click to browse'}
                </p>
                <p className="text-[#94A3B8] text-sm">
                  Supports PDF files up to 10MB
                </p>
              </>
            )}
          </label>
        </div>

        {/* Link Section */}
        <div className="mb-8">
          <h2 className="text-[#1E293B] font-medium text-[1.05rem] mb-4">
            Or paste Google Drive link
          </h2>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </div>
            <input 
              type="text" 
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="https://drive.google.com/..." 
              className="w-full pl-11 pr-4 py-3.5 border border-[#E2E8F0] rounded-xl text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#3B4569]/20 focus:border-[#3B4569] transition-all bg-white"
            />
          </div>
          {linkInput && (
            <p className="text-amber-500 text-xs mt-2 flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              Please ensure the Google Drive link is set to "Anyone with the link can view".
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleSubmit}
          disabled={status === 'analyzing'}
          className="w-full bg-[#3B4569] hover:bg-[#2D3552] text-white font-semibold py-4 rounded-xl transition-colors shadow-sm active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          Submit for Review
        </button>
      </div>

      {/* Footer text */}
      <p className="text-[#64748B] text-sm">
        Your credentials will be verified by our AI system within 24 hours
      </p>
    </div>
  );
}
