
import React from 'react';
import { useNotes } from '@/context/NotesContext';
import { cn } from '@/lib/utils';
import { Pin, Clock, Tag, Star } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import SearchBar from './SearchBar';
import { format } from 'date-fns';

const NoteList = () => {
  const { 
    getFilteredNotes, 
    selectNote, 
    selectedNote, 
    selectedFolder, 
    selectedTag,
    togglePinNote,
    tags
  } = useNotes();

  const notes = getFilteredNotes();

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  // Extract a preview from the content (ignore markdown syntax)
  const getContentPreview = (content: string) => {
    // Remove markdown headings
    const withoutHeadings = content.replace(/^#+\s+.+$/gm, '');
    // Remove other markdown syntax
    const withoutMarkdown = withoutHeadings.replace(/(\*\*|__|\*|_|~~|`|#|\[|\]|\(|\)|>)/g, '');
    // Get first 120 characters
    return withoutMarkdown.trim().substring(0, 120) + (withoutMarkdown.length > 120 ? '...' : '');
  };

  // Get tags for a note
  const getNoteTags = (noteTags: string[]) => {
    return tags.filter(tag => noteTags.includes(tag.id));
  };

  return (
    <div className="h-full flex flex-col border-r border-border bg-background">
      <div className="flex flex-col p-4 gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {selectedFolder ? selectedFolder.name : selectedTag ? `#${selectedTag.name}` : 'All Notes'}
          </h2>
          <div className="text-sm text-muted-foreground">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
        <SearchBar />
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="text-lg font-medium mb-1">No notes found</h3>
            <p className="text-sm text-muted-foreground">
              {selectedFolder && selectedFolder.id !== 'default'
                ? `This folder is empty. Create a new note to get started.`
                : selectedTag
                ? `No notes with this tag. Add the tag to some notes.`
                : `Create a new note to get started.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notes.map((note) => (
              <div
                key={note.id}
                className={cn(
                  "group relative transition-colors duration-100 hover:bg-muted/50",
                  selectedNote?.id === note.id && "bg-muted"
                )}
              >
                <button
                  className="w-full text-left p-4 focus:outline-none"
                  onClick={() => selectNote(note.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate pr-4">{note.title}</h3>
                      <div className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {getContentPreview(note.content)}
                      </div>
                      <div className="mt-2 flex items-center text-xs text-muted-foreground">
                        <Clock size={12} className="mr-1" />
                        <span>{formatDate(note.updatedAt)}</span>
                        
                        {note.tags.length > 0 && (
                          <div className="ml-2 flex items-center">
                            <Tag size={12} className="mr-1" />
                            <div className="flex space-x-1">
                              {getNoteTags(note.tags).map((tag) => (
                                <div 
                                  key={tag.id} 
                                  className="flex items-center"
                                >
                                  <div className={cn("w-2 h-2 rounded-full", tag.color)} />
                                  <span className="ml-1 truncate">{tag.name}</span>
                                </div>
                              )).slice(0, 2)}
                              {note.tags.length > 2 && (
                                <span>+{note.tags.length - 2}</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
                
                {/* Pin button */}
                <button
                  className={cn(
                    "absolute top-4 right-4 p-1 rounded-full transition-opacity",
                    note.isPinned ? "opacity-100 text-yellow-500" : "opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinNote(note.id);
                  }}
                  title={note.isPinned ? "Unpin note" : "Pin note"}
                >
                  {note.isPinned ? <Star size={16} fill="currentColor" /> : <Pin size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NoteList;
