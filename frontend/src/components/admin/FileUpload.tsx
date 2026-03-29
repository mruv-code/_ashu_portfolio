import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon, Film } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FileUploadProps {
  label: string;
  value: string | File;
  onChange: (file: File | string) => void;
  accept?: string;
  type?: 'image' | 'video';
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  value, 
  onChange, 
  accept = "image/*", 
  type = 'image',
  className 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === 'string' && value) {
      setPreviewUrl(value);
    } else {
      setPreviewUrl(null);
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Log file info for debugging
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeKB: (file.size / 1024).toFixed(2)
    });

    // Validate file type
    if (type === 'image') {
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!validImageTypes.includes(file.type)) {
        console.error(`Invalid image type: ${file.type}. Accepted types: ${validImageTypes.join(', ')}`);
        alert(`Please upload a valid image format (JPG, PNG, GIF, WebP, SVG). You uploaded: ${file.type || 'unknown'}`);
        return;
      }
    } else if (type === 'video') {
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mpeg', 'video/quicktime'];
      if (!validVideoTypes.includes(file.type)) {
        console.error(`Invalid video type: ${file.type}. Accepted types: ${validVideoTypes.join(', ')}`);
        alert(`Please upload a valid video format (MP4, WebM, OGG, MPEG, MOV). You uploaded: ${file.type || 'unknown'}`);
        return;
      }
    }

    onChange(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-xs uppercase tracking-widest text-white/40">{label}</label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative w-full min-h-[120px] bg-white/5 border border-dashed border-white/10 rounded-lg cursor-pointer hover:border-gold/50 transition-all flex flex-col items-center justify-center p-4 group",
          value ? "border-solid border-gold/30" : ""
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />

        {value ? (
          <div className="w-full h-full flex flex-col items-center gap-4">
              {type === 'image' ? (
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black/40">
                  {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />}
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black/40 flex items-center justify-center">
                  {previewUrl && <video src={previewUrl} className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                     <Film size={32} className="text-gold" />
                  </div>
                </div>
              )}
            <div className="flex items-center gap-2 text-xs text-white/40 group-hover:text-gold transition-colors">
              <Upload size={14} />
              <span>Click to change file</span>
            </div>
            <button 
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 bg-black/60 text-white/60 hover:text-red-400 rounded-full backdrop-blur-sm transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-white/20 group-hover:text-gold/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
              {type === 'image' ? <ImageIcon size={24} /> : <Film size={24} />}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Click to upload {type}</p>
              <p className="text-[10px] uppercase tracking-wider mt-1">or drag and drop</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
