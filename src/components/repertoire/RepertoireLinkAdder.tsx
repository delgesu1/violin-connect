import React, { useState } from 'react';
import { useAddRepertoireLink } from '@/hooks/useRepertoireAttachments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Link, Youtube, FileText, Music, ExternalLink } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RepertoireLinkAdderProps {
  masterPieceId: string;
  onLinkAdded: () => void;
}

type LinkType = 'youtube' | 'article' | 'score' | 'recording' | 'other';

const RepertoireLinkAdder: React.FC<RepertoireLinkAdderProps> = ({ masterPieceId, onLinkAdded }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [linkType, setLinkType] = useState<LinkType>('youtube');
  const { toast } = useToast();
  const { mutate: addLink, isPending } = useAddRepertoireLink();

  const getLinkIcon = (type: LinkType) => {
    switch (type) {
      case 'youtube':
        return <Youtube className="h-5 w-5 text-red-500" />;
      case 'article':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'score':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'recording':
        return <Music className="h-5 w-5 text-green-500" />;
      default:
        return <ExternalLink className="h-5 w-5 text-gray-500" />;
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setDescription('');
    setLinkType('youtube');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !title) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a title and URL.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Basic URL validation
      new URL(url);
    } catch (err) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL including http:// or https://',
        variant: 'destructive'
      });
      return;
    }
    
    // Generate thumbnail for YouTube videos
    let thumbnailUrl = null;
    if (linkType === 'youtube') {
      try {
        const videoId = new URL(url).searchParams.get('v');
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
      } catch (error) {
        // If we can't parse the video ID, just continue without a thumbnail
        console.error('Could not parse YouTube video ID:', error);
      }
    }
    
    addLink({
      master_piece_id: masterPieceId,
      title,
      url,
      link_type: linkType,
      description: description || null,
      thumbnail_url: thumbnailUrl
    }, {
      onSuccess: () => {
        toast({
          title: 'Link added',
          description: 'Your link has been added to this piece.'
        });
        resetForm();
        onLinkAdded();
      },
      onError: (error) => {
        console.error('Error adding link:', error);
        toast({
          title: 'Error',
          description: 'There was a problem adding your link. Please try again.',
          variant: 'destructive'
        });
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Add Link</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="link-type">Link Type</Label>
            <Select
              value={linkType}
              onValueChange={(value) => setLinkType(value as LinkType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select link type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">
                  <div className="flex items-center gap-2">
                    <Youtube className="h-4 w-4 text-red-500" />
                    <span>YouTube Video</span>
                  </div>
                </SelectItem>
                <SelectItem value="article">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>Article</span>
                  </div>
                </SelectItem>
                <SelectItem value="score">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-500" />
                    <span>Score</span>
                  </div>
                </SelectItem>
                <SelectItem value="recording">
                  <div className="flex items-center gap-2">
                    <Music className="h-4 w-4 text-green-500" />
                    <span>Recording</span>
                  </div>
                </SelectItem>
                <SelectItem value="other">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                    <span>Other Link</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for this link"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter a description for this link"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!url || !title || isPending}
        >
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Add Link
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RepertoireLinkAdder; 