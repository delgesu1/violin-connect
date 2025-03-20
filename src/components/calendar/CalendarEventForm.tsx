import React, { useState } from 'react';
import { useCreateCalendarEvent, useUpdateCalendarEvent, useCreateLessonWithEvent } from '@/hooks/useCalendarEvents';
import { Calendar as CalendarIcon, Clock, MapPin, Info, User, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useStudents } from '@/hooks/useStudents';
import { CalendarEvent } from '@/types/schema_extensions';

const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  event_type: z.enum(['lesson', 'performance', 'rehearsal', 'other']),
  event_date: z.date({
    required_error: 'Please select a date',
  }),
  start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in 24-hour format (HH:MM)'),
  end_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in 24-hour format (HH:MM)').optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  student_id: z.string().optional(),
  lesson_notes: z.string().optional()
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface CalendarEventFormProps {
  event?: CalendarEvent;
  onSubmitSuccess: () => void;
  defaultDate?: Date;
}

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({ event, onSubmitSuccess, defaultDate = new Date() }) => {
  const { toast } = useToast();
  const { mutate: createEvent, isPending: isCreating } = useCreateCalendarEvent();
  const { mutate: updateEvent, isPending: isUpdating } = useUpdateCalendarEvent();
  const { mutate: createLessonWithEvent, isPending: isCreatingLesson } = useCreateLessonWithEvent();
  const { data: students = [], isLoading: studentsLoading } = useStudents();
  
  // Set up form with default values
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event
      ? {
          title: event.title,
          event_type: event.event_type as any,
          event_date: new Date(event.event_date),
          start_time: event.start_time,
          end_time: event.end_time || undefined,
          location: event.location || undefined,
          description: event.description || undefined,
          student_id: event.student_id || undefined,
          lesson_notes: undefined
        }
      : {
          title: '',
          event_type: 'lesson',
          event_date: defaultDate,
          start_time: format(new Date().setMinutes(0, 0, 0), 'HH:mm'),
          end_time: format(new Date(new Date().setHours(new Date().getHours() + 1, 0, 0, 0)), 'HH:mm'),
          location: '',
          description: '',
          student_id: undefined,
          lesson_notes: ''
        }
  });
  
  const eventType = form.watch('event_type');
  const isLesson = eventType === 'lesson';
  
  const onSubmit = (values: EventFormValues) => {
    const formattedDate = format(values.event_date, 'yyyy-MM-dd');
    
    if (isLesson) {
      // If it's a lesson and has a student, create both a lesson and an event
      if (values.student_id) {
        createLessonWithEvent({
          lessonData: {
            student_id: values.student_id,
            notes: values.lesson_notes,
            summary: values.description
          },
          eventData: {
            title: values.title,
            event_date: formattedDate,
            start_time: values.start_time,
            end_time: values.end_time,
            location: values.location,
            description: values.description
          }
        }, {
          onSuccess: () => {
            toast({
              title: 'Lesson scheduled',
              description: `Lesson has been scheduled for ${format(values.event_date, 'MMMM d, yyyy')}`
            });
            onSubmitSuccess();
          },
          onError: (error) => {
            console.error('Error creating lesson with event:', error);
            toast({
              title: 'Error',
              description: 'There was a problem scheduling the lesson. Please try again.',
              variant: 'destructive'
            });
          }
        });
      } else {
        toast({
          title: 'Student required',
          description: 'Please select a student for the lesson.',
          variant: 'destructive'
        });
      }
    } else {
      // Regular event (non-lesson)
      const eventData = {
        title: values.title,
        event_type: values.event_type,
        event_date: formattedDate,
        start_time: values.start_time,
        end_time: values.end_time,
        location: values.location,
        description: values.description,
        student_id: null,
        lesson_id: null
      };
      
      if (event?.id) {
        // Update existing event
        updateEvent({
          id: event.id,
          updates: eventData
        }, {
          onSuccess: () => {
            toast({
              title: 'Event updated',
              description: `Event has been updated for ${format(values.event_date, 'MMMM d, yyyy')}`
            });
            onSubmitSuccess();
          },
          onError: (error) => {
            console.error('Error updating event:', error);
            toast({
              title: 'Error',
              description: 'There was a problem updating the event. Please try again.',
              variant: 'destructive'
            });
          }
        });
      } else {
        // Create new event
        createEvent(eventData, {
          onSuccess: () => {
            toast({
              title: 'Event created',
              description: `Event has been scheduled for ${format(values.event_date, 'MMMM d, yyyy')}`
            });
            onSubmitSuccess();
          },
          onError: (error) => {
            console.error('Error creating event:', error);
            toast({
              title: 'Error',
              description: 'There was a problem creating the event. Please try again.',
              variant: 'destructive'
            });
          }
        });
      }
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="event_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="rehearsal">Rehearsal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="event_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Event location" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isLesson && (
          <FormField
            control={form.control}
            name="student_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {studentsLoading ? (
                      <SelectItem value="loading" disabled>Loading students...</SelectItem>
                    ) : students.length === 0 ? (
                      <SelectItem value="none" disabled>No students found</SelectItem>
                    ) : (
                      students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name={isLesson ? "lesson_notes" : "description"}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{isLesson ? "Lesson Notes" : "Description"}</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder={isLesson ? "Enter lesson notes here..." : "Enter description here..."}
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button
          type="submit"
          disabled={isCreating || isUpdating || isCreatingLesson}
          className="w-full"
        >
          {event ? 'Update Event' : 'Create Event'}
        </Button>
      </form>
    </Form>
  );
};

export default CalendarEventForm; 