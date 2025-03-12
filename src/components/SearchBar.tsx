
import React, { useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNotes } from '@/context/NotesContext';

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useNotes();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus search bar when Cmd+K or Ctrl+K is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full bg-background transition-all duration-200 rounded-lg border border-border shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
        <Search size={16} />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search notes... (⌘K)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="block w-full bg-transparent pl-10 pr-3 py-2 border-none rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground"
        >
          <span className="text-xs bg-muted rounded-md px-1.5 py-0.5">ESC</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar;
