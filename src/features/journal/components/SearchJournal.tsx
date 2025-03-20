import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogClose,
  DialogTrigger
} from '@core/components/ui/overlays';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@core/components/ui/overlays';
import { 
  Button,
  Input,
  Checkbox
} from '@core/components/ui/inputs';
import { 
  Label,
  Badge
} from '@core/components/ui/data-display';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSearchJournalEntries } from '@/hooks/useJournal';

// Interfaces
interface SearchResult {
  entryId: string;
  date: string;
  field: string;
  content: string;
  matchText: string;
  fieldLabel: string;
}

interface SearchJournalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEntryClick: (entryId: string) => void;
}

// Field labels for display
const fieldLabels: Record<string, string> = {
  practice_goals: "Practice Goals",
  notes: "Notes",
  went_well: "What went well",
  beautified: "What I beautified",
  frustrations: "Frustrations",
  improvements: "Improvements"
};

/**
 * A search dialog component for searching journal entries
 */
export default function SearchJournal({ 
  isOpen, 
  onOpenChange,
  onEntryClick 
}: SearchJournalProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({
    goals: true,
    notes: true, 
    wentWell: true,
    beautified: true,
    frustrations: true,
    improvements: true
  });
  
  // Use the search journal hook
  const { 
    data: searchResults = [], 
    isLoading: searchLoading, 
    refetch: performSearch 
  } = useSearchJournalEntries(searchQuery, searchQuery.length >= 2);

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
    onEntryClick(entryId);
    onOpenChange(false);
  };

  // Process the search results based on filters
  const filteredResults = searchResults.filter(result => {
    if (result.field === 'practice_goals' && !searchFilters.goals) return false;
    if (result.field === 'notes' && !searchFilters.notes) return false;
    if (result.field === 'went_well' && !searchFilters.wentWell) return false;
    if (result.field === 'beautified' && !searchFilters.beautified) return false;
    if (result.field === 'frustrations' && !searchFilters.frustrations) return false;
    if (result.field === 'improvements' && !searchFilters.improvements) return false;
    return true;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-1"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search Journal</span>
        </Button>
      </DialogTrigger>
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
                        id="filter-went-well"
                        checked={searchFilters.wentWell}
                        onCheckedChange={(checked) => handleFilterChange('wentWell', checked as boolean)}
                      />
                      <Label htmlFor="filter-went-well">What Went Well</Label>
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
          
          <div className="flex-grow">
            <ScrollArea className="h-[60vh]">
              {searchQuery.length < 2 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Search className="h-12 w-12 mb-4 text-muted-foreground/70" />
                  <h3 className="text-lg font-medium">Type to Search</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    Enter at least 2 characters to search your journal entries
                  </p>
                </div>
              ) : searchLoading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <X className="h-12 w-12 mb-4 text-muted-foreground/70" />
                  <h3 className="text-lg font-medium">No Results Found</h3>
                  <p className="text-muted-foreground mt-1 max-w-md">
                    Try a different search term or adjust your filters
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-medium mb-4">{filteredResults.length} results</h3>
                  <div className="space-y-4">
                    {filteredResults.map((result, index) => {
                      // Get the date in readable format
                      const date = new Date(result.date);
                      const formattedDate = date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      
                      // Get the field content
                      const fieldLabel = result.fieldLabel || fieldLabels[result.field] || result.field;
                      const excerptField = result.content;
                      
                      return (
                        <div 
                          key={`${result.entryId}-${index}`}
                          className="p-4 border rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => handleSearchResultClick(result.entryId)}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{formattedDate}</h4>
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
        
        <div className="flex justify-end pt-2">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
} 