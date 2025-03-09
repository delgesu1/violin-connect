import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface FileUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  uploading?: boolean;
  dragActive?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  className,
  uploading = false,
  dragActive: externalDragActive,
  ...props
}) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Check file type
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const fileType = file.type;
      
      const matchesType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          const prefix = type.split('*')[0];
          return fileType.startsWith(prefix);
        }
        return type === fileType;
      });
      
      if (!matchesType) {
        setError(`File type ${fileType} is not supported`);
        return false;
      }
    }
    
    // Check file size
    if (file.size > maxSize) {
      setError(`File is too large (max ${maxSize / (1024 * 1024)}MB)`);
      return false;
    }
    
    setError(null);
    return true;
  }

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect, validateFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-all',
        (dragActive || externalDragActive) ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 bg-muted/20 hover:bg-muted/30',
        error && 'border-destructive border-opacity-50',
        className
      )}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={handleClick}
      {...props}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={accept}
      />
      
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-full p-3 bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          {uploading ? (
            <p className="text-sm text-muted-foreground">Uploading file...</p>
          ) : (
            <>
              <p className="font-medium">Drag & drop a file here, or click to select</p>
              <p className="text-sm text-muted-foreground mt-1">
                {accept === '*' ? 'All file types supported' : `Supports: ${accept}`}
              </p>
              <p className="text-sm text-muted-foreground">
                Max size: {maxSize / (1024 * 1024)}MB
              </p>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="absolute bottom-2 left-0 right-0 bg-destructive/10 text-destructive text-sm p-2 mx-2 rounded">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export interface SelectedFileProps {
  file: File;
  onRemove: () => void;
  className?: string;
}

export const SelectedFile: React.FC<SelectedFileProps> = ({
  file,
  onRemove,
  className
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn(
      'flex items-center p-3 border rounded-md bg-muted/20',
      className
    )}>
      <div className="mr-3 shrink-0">
        <FileText className="h-8 w-8 text-primary/70" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}; 