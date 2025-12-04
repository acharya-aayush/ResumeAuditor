
import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, Type, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onTextChange: (text: string) => void;
  selectedFile: File | null;
  resumeText: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, onTextChange, selectedFile, resumeText }) => {
  const [activeTab, setActiveTab] = useState<'FILE' | 'TEXT'>('FILE');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError("INVALID FORMAT. PDF OR IMAGE REQUIRED.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("FILE TOO LARGE. MAX 5MB.");
      return;
    }
    setError(null);
    onFileSelect(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full mb-8">
      {/* Tabs */}
      <div className="flex border-b border-zinc-700 mb-0">
        <button
            onClick={() => setActiveTab('FILE')}
            className={`px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border-t border-l border-r ${
                activeTab === 'FILE' 
                ? 'bg-zinc-900 border-zinc-700 text-white border-b-black -mb-px' 
                : 'text-zinc-500 hover:text-white border-transparent'
            }`}
        >
            <ImageIcon size={14} /> Upload PDF/Image
        </button>
        <button
            onClick={() => setActiveTab('TEXT')}
            className={`px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border-t border-l border-r ${
                activeTab === 'TEXT' 
                ? 'bg-zinc-900 border-zinc-700 text-white border-b-black -mb-px' 
                : 'text-zinc-500 hover:text-white border-transparent'
            }`}
        >
            <Type size={14} /> Paste Text
        </button>
      </div>

      <div className="border border-zinc-700 bg-zinc-900/50 p-8 min-h-[300px] flex flex-col justify-center">
        {activeTab === 'FILE' ? (
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed p-12 transition-all duration-200 cursor-pointer group flex flex-col items-center justify-center h-64 w-full
                ${isDragging 
                    ? 'border-white bg-white/10' 
                    : selectedFile 
                    ? 'border-white bg-transparent' 
                    : 'border-zinc-700 hover:border-white bg-transparent'
                }`}
            >
                <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
                accept=".pdf,.png,.jpg,.jpeg"
                />
                
                <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
                {selectedFile ? (
                    <>
                    <div className="text-white">
                        <FileText size={48} strokeWidth={1} />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-serif font-bold text-white tracking-tight">File Loaded.</p>
                        <p className="text-xs text-muted mt-2 font-mono uppercase tracking-widest border border-zinc-700 px-2 py-1 inline-block">
                        {selectedFile.name}
                        </p>
                    </div>
                    </>
                ) : (
                    <>
                    <div className={`transition-colors ${isDragging ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`}>
                        <UploadCloud size={48} strokeWidth={1} />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-serif text-white group-hover:underline decoration-1 underline-offset-4">
                        Upload Resume
                        </p>
                        <p className="text-xs text-zinc-500 mt-2 font-mono uppercase tracking-wider">
                        Drag & Drop or Click • PDF/IMG
                        </p>
                    </div>
                    </>
                )}
                </div>
            </div>
        ) : (
            <div className="w-full h-64">
                <textarea 
                    className="w-full h-full bg-black border border-zinc-700 p-4 text-sm font-mono text-zinc-300 focus:border-white outline-none transition-all placeholder:text-zinc-700 resize-none"
                    placeholder="// PASTE YOUR RAW RESUME TEXT HERE..."
                    value={resumeText}
                    onChange={(e) => onTextChange(e.target.value)}
                />
            </div>
        )}

        {error && (
            <div className="mt-4 flex items-center justify-center text-red-500 text-xs font-mono border border-red-900 bg-red-950/20 p-3 uppercase tracking-widest">
            <AlertCircle size={14} className="mr-2" />
            {error}
            </div>
        )}
      </div>
    </div>
  );
};
