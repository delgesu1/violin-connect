import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Music, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarEventData } from './CalendarEvent';

interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEventData>) => void;
  event?: Partial<CalendarEventData>;
  type?: 'lesson' | 'performance' | 'rehearsal' | 'other';
}

const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  event,
  type = 'lesson'
}) => {
  // Initialize form state with existing event data or defaults
  const [formData, setFormData] = useState<Partial<CalendarEventData>>({
    title: event?.title || '',
    type: event?.type || type,
    startTime: event?.startTime || '09:00 AM',
    endTime: event?.endTime || '10:00 AM',
    location: event?.location || '',
    repertoire: event?.repertoire || '',
    ...event
  });
  
  const [date, setDate] = useState<Date>(new Date());
  
  // Event type colors
  const typeColors = {
    lesson: 'text-blue-500',
    performance: 'text-purple-500',
    rehearsal: 'text-amber-500',
    other: 'text-gray-500'
  };
  
  // Event type icons
  const TypeIcon = () => {
    switch (formData.type) {
      case 'lesson':
        return <User className={cn("h-5 w-5", typeColors.lesson)} />;
      case 'performance':
        return <Music className={cn("h-5 w-5", typeColors.performance)} />;
      case 'rehearsal':
        return <User className={cn("h-5 w-5", typeColors.rehearsal)} />;
      default:
        return <Clock className={cn("h-5 w-5", typeColors.other)} />;
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <TypeIcon />
            <DialogTitle>
              {event?.id ? 'Edit' : 'New'} {formData.type?.charAt(0).toUpperCase() + formData.type?.slice(1)}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="grid gap-4 py-3">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder={`e.g., ${formData.type === 'lesson' ? 'Lesson with Emma Thompson' : 
                formData.type === 'performance' ? 'Faculty Recital' :
                formData.type === 'rehearsal' ? 'Chamber Music Rehearsal' :
                'Meeting'}`}
              className="col-span-3"
            />
          </div>
          
          {/* Event Type */}
          <div className="grid gap-2">
            <Label>Event Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => handleSelectChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lesson">Lesson</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="rehearsal">Rehearsal</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Date and Time */}
          <div className="grid gap-2">
            <Label>Date & Time</Label>
            <div className="flex flex-col gap-3">
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "MMMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              {/* Time Selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime" className="text-xs text-gray-500 mb-1 block">Start Time</Label>
                  <Select 
                    value={formData.startTime} 
                    onValueChange={(value) => handleSelectChange('startTime', value)}
                  >
                    <SelectTrigger id="startTime">
                      <SelectValue placeholder="Start" />
                    </SelectTrigger>
                    <SelectContent>
                      {['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
                       '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', 
                       '6:00 PM', '7:00 PM', '8:00 PM'].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="endTime" className="text-xs text-gray-500 mb-1 block">End Time</Label>
                  <Select 
                    value={formData.endTime} 
                    onValueChange={(value) => handleSelectChange('endTime', value)}
                  >
                    <SelectTrigger id="endTime">
                      <SelectValue placeholder="End" />
                    </SelectTrigger>
                    <SelectContent>
                      {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', 
                       '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', 
                       '7:00 PM', '8:00 PM', '9:00 PM'].map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Studio A"
              className="col-span-3"
            />
          </div>
          
          {/* Repertoire (for lessons) */}
          {(formData.type === 'lesson' || formData.type === 'performance') && (
            <div className="grid gap-2">
              <Label htmlFor="repertoire">Repertoire</Label>
              <Textarea
                id="repertoire"
                name="repertoire"
                value={formData.repertoire}
                onChange={handleInputChange}
                placeholder="e.g., Bach Partita No. 2"
                className="col-span-3 min-h-[80px]"
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmit}
          >
            {event?.id ? 'Save Changes' : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarEventModal; 