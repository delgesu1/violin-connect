import React, { useState } from 'react';
import { useAddRepertoireFile } from '@/hooks/useRepertoireAttachments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, File, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@clerk/clerk-react';
import { clerkIdToUuid } from '@/lib/auth-utils';

interface RepertoireFileUploaderProps {
  masterPieceId: string;
  onUploadComplete: () => void;
}

const RepertoireFileUploader: React.FC<RepertoireFileUploaderProps> = ({ masterPieceId, onUploadComplete }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { userId } = useAuth();
  const { mutate: addFile, isPending } = useAddRepertoireFile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setDescription('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId || !masterPieceId) {
      toast({
        title: 'Error',
        description: 'Please select a file and try again.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setUploading(true);

      // Generate a unique file name to avoid collisions
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `repertoire/${masterPieceId}/${fileName}`;
      
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('files')
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath);
      
      // Add file record to the database
      addFile({
        master_piece_id: masterPieceId,
        file_name: selectedFile.name,
        file_url: publicUrlData.publicUrl,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        description: description || null,
        uploaded_at: new Date().toISOString()
      }, {
        onSuccess: () => {
          toast({
            title: 'File uploaded',
            description: 'Your file has been successfully attached to this piece.'
          });
          clearSelection();
          onUploadComplete();
        },
        onError: (error) => {
          console.error('Error adding file to database:', error);
          toast({
            title: 'Upload failed',
            description: 'There was an error adding the file to the database.',
            variant: 'destructive'
          });
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your file.',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Attach File</CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedFile ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
            <Input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileChange}
            />
            <Label 
              htmlFor="file-upload" 
              className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
            >
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm font-medium">Click to select a file</span>
              <span className="text-xs text-gray-500 mt-1">PDF, audio, video, or other files</span>
            </Label>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-sm line-clamp-1">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={clearSelection}
                disabled={uploading || isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="description" className="text-sm">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter a description for this file"
                className="mt-1"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading || isPending}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploading || isPending}
        >
          {(uploading || isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Upload File
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RepertoireFileUploader; 