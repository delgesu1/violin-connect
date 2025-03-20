import React, { useState, useEffect } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, 
  Calendar, 
  FileText, 
  Star, 
  Sparkles, 
  ArrowRight, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  Lightbulb, 
  Music,
  Search,
  ChevronLeft,
  ChevronRight,
  PenTool,
  X,
  Filter,
  Printer
} from 'lucide-react';

import PageHeader from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useDevFallbackUser } from "@/hooks/useDevFallbackUser";

// Import our hooks
import { 
  useJournalEntries, 
  useJournalEntryByDate, 
  useJournalEntry,
  useCreateJournalEntry, 
  useUpdateJournalEntry,
  useSearchJournalEntries,
  JournalEntry
} from '@/hooks/useJournal';

import {
  useJournalInsights,
  useGenerateJournalInsights
} from '@/hooks/useJournalInsights';

// Mock data for lessons and AI digest (will be replaced with real data later)
const mockLessonSummaries = [
  {
    id: '1',
    date: '2023-11-15',
    title: 'Beethoven Violin Concerto - First Movement',
    summary: 'Focused on the exposition section, particularly the double-stop passages. Intonation is improving, but the teacher emphasized the need for more fluid bow changes in the transitional passages. The rhythm became unstable in the development section.',
    practiceAdvice: 'Work with a metronome on the sixteenth-note passages at measure 127-142. Practice the octave scales slowly at first, gradually increasing tempo. For the cadenza, break down the arpeggios into smaller segments.'
  },
  {
    id: '2',
    date: '2023-11-08',
    title: 'Bach Partita No. 2 - Chaconne',
    summary: 'Made good progress on the opening theme. The teacher suggested more emphasis on the bass line in the polyphonic sections. Discussed baroque performance practice and articulation styles appropriate for Bach.',
    practiceAdvice: 'Practice bringing out the different voices separately before combining them. Use recordings by Hilary Hahn and Rachel Podger as reference points for articulation. Work on the dotted rhythms with various bowings.'
  },
  {
    id: '3',
    date: '2023-11-01',
    title: 'Technical Exercises - Scales and Etudes',
    summary: 'Reviewed G major and E minor three-octave scales. Vibrato is too wide in the higher positions. Intonation was secure in first position but needs attention in positions 3-5. Kreutzer Etude #8 was played with good rhythm but needs cleaner string crossings.',
    practiceAdvice: 'Practice scales with a drone for intonation. Work on narrower vibrato exercises, particularly in the upper registers. For string crossings, use open strings to isolate the right hand motion and ensure smoothness.'
  }
];

const mockYearSummary = {
  strengths: [
    'Remarkable progress in left-hand facility, particularly in fast passages',
    'Expressive vibrato in lyrical sections',
    'Strong rhythmic accuracy in complex meters'
  ],
  challenges: [
    'Maintaining consistent intonation across position changes',
    'Developing a more varied color palette through bow control',
    'Balancing technical precision with musical expression'
  ],
  focusAreas: [
    'Advanced bow techniques (spiccato, sautillé)',
    'Romantic repertoire interpretation',
    'Chamber music ensemble skills'
  ]
};

// Search Result interface
interface SearchResult {
  entryId: string;
  date: string;
  field: string;
  content: string;
  matchText: string;
  fieldLabel: string;
}

const initialEntry: Omit<JournalEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  date: format(new Date(), 'yyyy-MM-dd'),
  practice_goals: '',
  notes: '',
  went_well: '',
  beautified: '',
  frustrations: '',
  improvements: ''
};

// Helper function for safe date formatting
const formatSafeDate = (dateString: string | undefined, formatStr: string = 'MMMM d, yyyy') => {
  if (!dateString) return 'Loading...';
  
  // Try to parse as ISO date first
  try {
    const parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) {
      return format(parsedDate, formatStr);
    }
  } catch (e) {
    console.warn('Failed to parse date as ISO:', dateString);
  }
  
  // Add time component and try again
  try {
    const dateWithTime = dateString + 'T00:00:00';
    const date = new Date(dateWithTime);
    if (isValid(date)) {
      return format(date, formatStr);
    }
  } catch (e) {
    console.warn('Failed to parse date with added time component:', dateString);
  }
  
  // Last resort: try direct parsing
  try {
    const date = new Date(dateString);
    if (isValid(date)) {
      return format(date, formatStr);
    }
  } catch (e) {
    console.error('Failed to parse date by any method:', dateString);
  }
  
  return dateString; // Return original string if all parsing fails
};

// Helper function to safely get field values
const safeFieldValue = (entry: any, field: string): string => {
  if (!entry) return '';
  
  // If entry is an array, get the first item
  const entryObj = Array.isArray(entry) ? entry[0] : entry;
  
  // Try direct access
  if (entryObj && entryObj[field] !== null && entryObj[field] !== undefined) {
    return entryObj[field] as string;
  }
  
  return '';
};

const Journal: React.FC = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useDevFallbackUser();
  const isDevelopmentMode = import.meta.env.VITE_DEV_MODE === 'true';
  
  // Form state for the current entry
  const [currentEntryForm, setCurrentEntryForm] = useState(initialEntry);
  
  // Search state
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    goals: true,
    notes: true, 
    wentWell: true,
    beautified: true,
    frustrations: true,
    improvements: true
  });
  
  // Use our new hooks
  const { data: journalEntries = [], isLoading: entriesLoading, error: entriesError } = useJournalEntries();
  const { data: todaysEntry, isLoading: todayLoading } = useJournalEntryByDate(new Date());
  const { data: selectedEntry, isLoading: selectedEntryLoading } = useJournalEntry(selectedEntryId);
  const { mutate: createEntry } = useCreateJournalEntry();
  const { mutate: updateEntry } = useUpdateJournalEntry();
  const { 
    data: searchResults = [], 
    isLoading: searchLoading, 
    refetch: performSearch 
  } = useSearchJournalEntries(searchQuery, searchQuery.length >= 2);

  // Get journal insights for analytics tab
  const { data: journalInsights, isLoading: insightsLoading } = useJournalInsights();
  const generateInsights = useGenerateJournalInsights();

  // Add debugging logs
  useEffect(() => {
    console.log('Current user:', user);
    console.log('Journal entries loaded:', !entriesLoading);
    console.log('Journal entries count:', journalEntries.length);
    console.log('Journal entries error:', entriesError);
    
    // Log development mode status
    console.log(`Running in ${isDevelopmentMode ? 'DEVELOPMENT' : 'PRODUCTION'} mode`);
    
    if (entriesError) {
      console.error('Error details:', entriesError);
    }
  }, [user, journalEntries, entriesLoading, entriesError, isDevelopmentMode]);

  // Initialize the form with today's entry if it exists
  useEffect(() => {
    if (todaysEntry) {
      setCurrentEntryForm({
        date: todaysEntry.date,
        practice_goals: todaysEntry.practice_goals || '',
        notes: todaysEntry.notes || '',
        went_well: todaysEntry.went_well || '',
        beautified: todaysEntry.beautified || '',
        frustrations: todaysEntry.frustrations || '',
        improvements: todaysEntry.improvements || ''
      });
    } else {
      setCurrentEntryForm(initialEntry);
    }
  }, [todaysEntry]);

  // Field labels for display
  const fieldLabels = {
    practice_goals: "Practice Goals",
    notes: "Notes",
    went_well: "What went well",
    beautified: "What I beautified",
    frustrations: "Frustrations",
    improvements: "Improvements"
  };

  // Handle form input changes
  const handleInputChange = (field: keyof typeof initialEntry, value: string) => {
    setCurrentEntryForm({
      ...currentEntryForm,
      [field]: value
    });
  };

  // Handle form submission
  const handleSubmitEntry = () => {
    if (!user) {
      console.error('No user available. Cannot submit journal entry.');
      toast({
        title: "Error",
        description: "You must be logged in to save a journal entry.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Submitting journal entry with user ID:', user.id);
    console.log('Entry data:', currentEntryForm);
    setIsSubmitting(true);
    
    // We no longer need to explicitly set user_id as the hook handles that
    const entryData = {
      ...currentEntryForm
    };
    
    if (todaysEntry) {
      console.log('Updating existing journal entry:', todaysEntry.id);
      // Update existing entry
      updateEntry(
        { 
          id: todaysEntry.id, 
          entry: entryData 
        },
        {
          onSuccess: (data) => {
            console.log('Journal entry updated successfully:', data);
            setIsSubmitting(false);
            toast({
              title: "Journal Updated",
              description: "Your journal entry has been saved.",
            });
          },
          onError: (error) => {
            console.error('Error updating journal entry:', error);
            setIsSubmitting(false);
            toast({
              title: "Error",
              description: "Failed to save journal entry: " + (error instanceof Error ? error.message : String(error)),
              variant: "destructive"
            });
          }
        }
      );
    } else {
      console.log('Creating new journal entry');
      // Create new entry
      createEntry(
        entryData,
        {
          onSuccess: (data) => {
            console.log('Journal entry created successfully:', data);
            setIsSubmitting(false);
            toast({
              title: "Journal Entry Saved",
              description: "Your journal entry has been created.",
            });
          },
          onError: (error) => {
            console.error('Error creating journal entry:', error);
            setIsSubmitting(false);
            toast({
              title: "Error",
              description: "Failed to create journal entry: " + (error instanceof Error ? error.message : String(error)),
              variant: "destructive"
            });
          }
        }
      );
    }
  };

  // View a previous entry
  const viewPreviousEntry = (id: string) => {
    setSelectedEntryId(id);
    setActiveTab('previous');
  };

  // Handle search query change
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    // The search will be triggered automatically based on the enabled condition
  };

  // Handle filter change
  const handleFilterChange = (field: string, checked: boolean) => {
    setSearchFilters({
      ...searchFilters,
      [field]: checked
    });
  };

  // Handle search result click
  const handleSearchResultClick = (entryId: string) => {
    setSelectedEntryId(entryId);
    setActiveTab('previous');
    setSearchDialogOpen(false);
  };

  // Export to PDF
  const exportToPDF = () => {
    // This would be implemented with a PDF library in a real app
    alert("Export to PDF functionality would be implemented here");
  };

  return (
    <div className="container max-w-5xl mx-auto">
      <PageHeader
        title="Practice Journal"
        description="Record your practice sessions and track your progress"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => setSearchDialogOpen(true)}
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search Journal</span>
          </Button>

          <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
            <DialogContent className="max-w-2xl h-[80vh]">
              <DialogHeader>
                <DialogTitle>Search Journal</DialogTitle>
                <DialogDescription>
                  Search through your past journal entries
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search your journal entries..."
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => handleSearchQueryChange(e.target.value)}
                  />
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium text-sm">Filter Search Fields</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-goals"
                              checked={searchFilters.goals}
                              onCheckedChange={(checked) => handleFilterChange('goals', checked as boolean)}
                            />
                            <Label htmlFor="filter-goals">Practice Goals</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-notes"
                              checked={searchFilters.notes}
                              onCheckedChange={(checked) => handleFilterChange('notes', checked as boolean)}
                            />
                            <Label htmlFor="filter-notes">Notes</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-wentWell"
                              checked={searchFilters.wentWell}
                              onCheckedChange={(checked) => handleFilterChange('wentWell', checked as boolean)}
                            />
                            <Label htmlFor="filter-wentWell">What Went Well</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-beautified"
                              checked={searchFilters.beautified}
                              onCheckedChange={(checked) => handleFilterChange('beautified', checked as boolean)}
                            />
                            <Label htmlFor="filter-beautified">What I Beautified</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-frustrations"
                              checked={searchFilters.frustrations}
                              onCheckedChange={(checked) => handleFilterChange('frustrations', checked as boolean)}
                            />
                            <Label htmlFor="filter-frustrations">Frustrations</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-improvements"
                              checked={searchFilters.improvements}
                              onCheckedChange={(checked) => handleFilterChange('improvements', checked as boolean)}
                            />
                            <Label htmlFor="filter-improvements">Improvements</Label>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              
                <div className="flex-1 overflow-hidden relative">
                  <ScrollArea className="h-[60vh] w-full rounded-md">
                    {searchLoading ? (
                      <div className="py-10 text-center text-gray-500">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p>Searching...</p>
                      </div>
                    ) : searchQuery.length <= 1 ? (
                      <div className="py-10 text-center text-gray-500">
                        <Search className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p>Enter at least 2 characters to search</p>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="py-10 text-center text-gray-500">
                        <FileText className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                        <p>No results found for "{searchQuery}"</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-gray-500 px-3 pb-2">
                          {searchResults.length} result{searchResults.length === 1 ? '' : 's'} found
                        </div>
                        <div className="divide-y">
                          {searchResults.map((result, index) => {
                            // Find the first non-empty field for excerpt display
                            const excerptField = 
                              result.practice_goals || 
                              result.notes || 
                              result.went_well || 
                              result.beautified || 
                              result.frustrations || 
                              result.improvements || 
                              '';
                            
                            // Determine which field has content for the badge
                            let fieldLabel = "Journal Entry";
                            if (result.practice_goals) fieldLabel = "Practice Goals";
                            else if (result.notes) fieldLabel = "Notes";
                            else if (result.went_well) fieldLabel = "What Went Well";
                            else if (result.beautified) fieldLabel = "What I Beautified";
                            else if (result.frustrations) fieldLabel = "Frustrations";
                            else if (result.improvements) fieldLabel = "Improvements";
                            
                            // Ensure result has a valid id
                            if (!result.id) {
                              console.error("Search result missing ID:", result);
                              return null;
                            }
                            
                            return (
                              <div 
                                key={`${result.id}-${index}`}
                                className="p-3 hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleSearchResultClick(result.id)}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">
                                    {formatSafeDate(result.date)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {fieldLabel}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {excerptField.substring(0, 100)}...
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-4">
          <TabsTrigger value="today">Today's Practice</TabsTrigger>
          <TabsTrigger value="previous">Previous Entries</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Today's Practice Tab */}
        <TabsContent value="today" className="space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Today's Practice Session</h2>
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  onClick={handleSubmitEntry} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Saving...
                    </>
                  ) : todaysEntry ? "Update Entry" : "Save Entry"}
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Practice Goals */}
              <Card className="border-blue-200 transition-all duration-300 hover:border-blue-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <Star className="w-4 h-4 text-blue-600" />
                    Today's Practice Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-24 transition-all duration-300 focus:border-blue-400"
                    value={currentEntryForm.practice_goals}
                    onChange={(e) => handleInputChange('practice_goals', e.target.value)}
                    placeholder="What do you want to achieve in today's practice?"
                  />
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border-gray-200 transition-all duration-300 hover:border-gray-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    Practice Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-24 transition-all duration-300 focus:border-gray-400"
                    value={currentEntryForm.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Notes about today's practice session"
                  />
                </CardContent>
              </Card>

              {/* What Went Well */}
              <Card className="border-green-200 transition-all duration-300 hover:border-green-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-green-600" />
                    What went well today?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-24 transition-all duration-300 focus:border-green-400"
                    value={currentEntryForm.went_well}
                    onChange={(e) => handleInputChange('went_well', e.target.value)}
                    placeholder="What aspects of your practice were successful?"
                  />
                </CardContent>
              </Card>
              
              {/* What I Beautified */}
              <Card className="border-purple-200 transition-all duration-300 hover:border-purple-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-purple-600" />
                    What did I worked hard to beautify today?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-24 transition-all duration-300 focus:border-purple-400"
                    value={currentEntryForm.beautified}
                    onChange={(e) => handleInputChange('beautified', e.target.value)}
                    placeholder="What did you focus on making more beautiful in your playing?"
                  />
                </CardContent>
              </Card>

              {/* Frustrations */}
              <Card className="border-amber-200 transition-all duration-300 hover:border-amber-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <ThumbsDown className="w-4 h-4 text-amber-600" />
                    What frustrates me and why?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-24 transition-all duration-300 focus:border-amber-400"
                    value={currentEntryForm.frustrations}
                    onChange={(e) => handleInputChange('frustrations', e.target.value)}
                    placeholder="What challenges did you face today?"
                  />
                </CardContent>
              </Card>

              {/* Improvements for Tomorrow */}
              <Card className="border-blue-200 transition-all duration-300 hover:border-blue-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    What can I improve tomorrow?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-24 transition-all duration-300 focus:border-blue-400"
                    value={currentEntryForm.improvements}
                    onChange={(e) => handleInputChange('improvements', e.target.value)}
                    placeholder="What will you focus on improving next time?"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Previous Entries Tab */}
        <TabsContent value="previous" className="space-y-6">
          <div className="space-y-6">
            {selectedEntryId ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedEntryId(null)}
                    className="flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back to entries
                  </Button>
                  
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Entry from {selectedEntry && selectedEntry.date ? formatSafeDate(selectedEntry.date, 'EEEE, MMMM d, yyyy') : 'Loading...'}
                    {isDevelopmentMode && selectedEntry && selectedEntry._source && (
                      <Badge variant={
                        selectedEntry._source === 'database' ? 'default' :
                        selectedEntry._source.includes('cached') ? 'secondary' :
                        'outline'
                      } className="text-xs">
                        {selectedEntry._source}
                      </Badge>
                    )}
                  </h3>
                  
                  <Button variant="outline" onClick={exportToPDF}>
                    <Printer className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                {/* Display selected entry */}
                {!selectedEntry ? (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading journal entry...</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                    >
                      <div className="border-b p-6">
                        <div className="flex items-center gap-3 mb-1">
                          <Calendar className="h-5 w-5 text-primary" />
                          <h3 className="text-xl font-medium">
                            {selectedEntry && selectedEntry.date ? 
                              formatSafeDate(selectedEntry.date, 'EEEE, MMMM d, yyyy') : 
                              'Loading...'}
                          </h3>
                          {isDevelopmentMode && selectedEntry && selectedEntry._source && (
                            <Badge variant={
                              selectedEntry._source === 'database' ? 'default' :
                              selectedEntry._source.includes('cached') ? 'secondary' :
                              'outline'
                            } className="text-xs">
                              {selectedEntry._source}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-8">
                        {/* Direct rendering of journal entry content */}
                        {selectedEntry && (
                          <>
                            {selectedEntry.practice_goals && (
                              <div key="practice_goals" className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Star className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <h4 className="font-medium text-blue-900">Practice Goals</h4>
                                </div>
                                <div className="pl-6 border-l-2 border-blue-100">
                                  <p className="text-gray-700 leading-relaxed">{selectedEntry.practice_goals}</p>
                                </div>
                              </div>
                            )}

                            {selectedEntry.notes && (
                              <div key="notes" className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                  <h4 className="font-medium text-gray-900">Practice Notes</h4>
                                </div>
                                <div className="pl-6 border-l-2 border-gray-100">
                                  <p className="text-gray-700 leading-relaxed">{selectedEntry.notes}</p>
                                </div>
                              </div>
                            )}

                            {selectedEntry.went_well && (
                              <div key="went_well" className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <ThumbsUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <h4 className="font-medium text-green-900">What Went Well</h4>
                                </div>
                                <div className="pl-6 border-l-2 border-green-100">
                                  <p className="text-gray-700 leading-relaxed">{selectedEntry.went_well}</p>
                                </div>
                              </div>
                            )}

                            {selectedEntry.beautified && (
                              <div key="beautified" className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <PenTool className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                  <h4 className="font-medium text-purple-900">What I Worked Hard to Beautify</h4>
                                </div>
                                <div className="pl-6 border-l-2 border-purple-100">
                                  <p className="text-gray-700 leading-relaxed">{selectedEntry.beautified}</p>
                                </div>
                              </div>
                            )}

                            {selectedEntry.frustrations && (
                              <div key="frustrations" className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <ThumbsDown className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                  <h4 className="font-medium text-amber-900">What Frustrated Me</h4>
                                </div>
                                <div className="pl-6 border-l-2 border-amber-100">
                                  <p className="text-gray-700 leading-relaxed">{selectedEntry.frustrations}</p>
                                </div>
                              </div>
                            )}

                            {selectedEntry.improvements && (
                              <div key="improvements" className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <ArrowRight className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  <h4 className="font-medium text-blue-900">What I Can Improve Tomorrow</h4>
                                </div>
                                <div className="pl-6 border-l-2 border-blue-100">
                                  <p className="text-gray-700 leading-relaxed">{selectedEntry.improvements}</p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* If no fields found, show a message */}
                        {selectedEntry && 
                         !selectedEntry.practice_goals && 
                         !selectedEntry.notes && 
                         !selectedEntry.went_well && 
                         !selectedEntry.beautified && 
                         !selectedEntry.frustrations && 
                         !selectedEntry.improvements && (
                          <div className="text-center py-4 text-gray-500">
                            <p>This journal entry appears to be empty.</p>
                          </div>
                        )}
                      </div>
                      
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.7 }}
                        className="border-t p-6 bg-gray-50 flex justify-end"
                      >
                        <Button variant="outline" size="sm" onClick={exportToPDF} className="flex items-center gap-2">
                          <Printer className="w-4 h-4" />
                          Export as PDF
                        </Button>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Previous Practice Entries</h2>
                </div>
                
                {entriesLoading ? (
                  <div className="text-center py-10">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p>Loading journal entries...</p>
                  </div>
                ) : journalEntries.length === 0 ? (
                  <div className="text-center py-10 border rounded-lg bg-gray-50">
                    <Book className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No journal entries yet</h3>
                    <p className="text-gray-500 mb-4">Start recording your practice sessions</p>
                    <div className="space-y-2">
                      <Button onClick={() => setActiveTab('today')}>Create Your First Entry</Button>
                      <p className="text-xs text-gray-400 mt-4">
                        If you're seeing this in development mode, this could be because the journal_entries table
                        hasn't been populated yet or there's a configuration issue with the database connection.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {journalEntries.map((entry) => {
                      // Find the first non-empty field for excerpt
                      const contentPreview = 
                        entry.practice_goals || 
                        entry.notes || 
                        entry.went_well || 
                        entry.beautified || 
                        entry.frustrations || 
                        entry.improvements || 
                        'No details recorded';
                      
                      return (
                        <Card 
                          key={entry.id}
                          className="cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-sm"
                          onClick={() => viewPreviousEntry(entry.id)}
                        >
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {formatSafeDate(entry.date)}
                                  </span>
                                  {isDevelopmentMode && entry._source && (
                                    <Badge variant={
                                      entry._source === 'database' ? 'default' :
                                      entry._source.includes('cached') ? 'secondary' :
                                      'outline'
                                    } className="text-xs">
                                      {entry._source}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{contentPreview}</p>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Practice Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Entries this month</span>
                      <span className="font-medium">{journalEntries.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Practice streak</span>
                      <span className="font-medium">3 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Total entries</span>
                      <span className="font-medium">{journalEntries.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-green-600" />
                    Your Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {insightsLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : journalInsights?.strengths && journalInsights.strengths.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {journalInsights.strengths.map((item, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-green-500">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No strengths identified yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => generateInsights.mutate()}
                        disabled={generateInsights.isPending}
                      >
                        {generateInsights.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>Generate Insights</>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Challenges to Address
                </CardTitle>
                <CardDescription>
                  Areas that need attention based on your practice journal entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {insightsLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : journalInsights?.challenges && journalInsights.challenges.length > 0 ? (
                  <ul className="space-y-3">
                    {journalInsights.challenges.map((challenge, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <p>{challenge}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No challenges identified yet</p>
                    {!journalInsights?.strengths || journalInsights.strengths.length === 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => generateInsights.mutate()}
                        disabled={generateInsights.isPending}
                      >
                        {generateInsights.isPending ? (
                          <>
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>Generate Insights</>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Music className="w-5 h-5 text-primary" />
                  Recent Lesson Summaries
                </CardTitle>
                <CardDescription>
                  Key takeaways from your recent lessons
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockLessonSummaries.map((lesson) => (
                    <div key={lesson.id} className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-base">{lesson.title}</h3>
                        <Badge variant="outline">
                          {formatSafeDate(lesson.date)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{lesson.summary}</p>
                      <div className="bg-amber-50 border border-amber-100 rounded-md p-3">
                        <p className="text-xs text-amber-800 font-medium mb-1">Practice Advice:</p>
                        <p className="text-xs text-amber-700">{lesson.practiceAdvice}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Journal; 