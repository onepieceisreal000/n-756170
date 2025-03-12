
import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '@/context/NotesContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Code,
  Link,
  Image,
  Minus,
  Check,
  Trash,
  Pin,
  Star,
  Tag as TagIcon,
  X,
  Folder as FolderIcon,
  Save,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

const NoteEditor = () => {
  const { 
    selectedNote, 
    updateNote, 
    deleteNote, 
    folders, 
    tags, 
    addTagToNote, 
    removeTagFromNote,
    togglePinNote,
  } = useNotes();
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load note data when a note is selected
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
    } else {
      setTitle('');
      setContent('');
    }
  }, [selectedNote]);

  // Auto-save functionality
  useEffect(() => {
    if (selectedNote && (title !== selectedNote.title || content !== selectedNote.content)) {
      // Clear any existing timer
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      // Set a new timer for auto-save
      const timer = setTimeout(() => {
        saveNote();
      }, 1000); // Auto-save after 1 second of inactivity
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [title, content]);

  // Save the note
  const saveNote = () => {
    if (!selectedNote) return;
    
    setIsSaving(true);
    
    // Update the note
    updateNote(selectedNote.id, {
      title,
      content,
    });
    
    setLastSaved(new Date());
    setIsSaving(false);
  };

  // Handle the deletion of a note
  const handleDeleteNote = () => {
    if (!selectedNote) return;
    
    setIsDeleting(true);
    deleteNote(selectedNote.id);
    setIsDeleting(false);
  };

  // Format the last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return `Last saved ${format(lastSaved, 'h:mm a')}`;
  };

  // Insert text into the content at the current cursor position
  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newContent);
    
    // Focus back on the textarea and set the cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  // Formatting options
  const formatOptions = [
    {
      icon: Bold,
      title: 'Bold',
      onClick: () => insertText('**', '**'),
    },
    {
      icon: Italic,
      title: 'Italic',
      onClick: () => insertText('*', '*'),
    },
    {
      icon: Heading1,
      title: 'Heading 1',
      onClick: () => insertText('# '),
    },
    {
      icon: Heading2,
      title: 'Heading 2',
      onClick: () => insertText('## '),
    },
    {
      icon: List,
      title: 'Bullet List',
      onClick: () => insertText('- '),
    },
    {
      icon: ListOrdered,
      title: 'Numbered List',
      onClick: () => insertText('1. '),
    },
    {
      icon: Check,
      title: 'Checkbox',
      onClick: () => insertText('- [ ] '),
    },
    {
      icon: Quote,
      title: 'Blockquote',
      onClick: () => insertText('> '),
    },
    {
      icon: Code,
      title: 'Code Block',
      onClick: () => insertText('```\n', '\n```'),
    },
    {
      icon: Link,
      title: 'Link',
      onClick: () => insertText('[', '](url)'),
    },
    {
      icon: Image,
      title: 'Image',
      onClick: () => insertText('![alt text](', ')'),
    },
    {
      icon: Minus,
      title: 'Divider',
      onClick: () => insertText('\n---\n'),
    },
  ];

  // If no note is selected, display an empty state
  if (!selectedNote) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-background">
        <div className="text-center space-y-3 max-w-md mx-auto">
          <div className="text-5xl animate-float">📝</div>
          <h2 className="text-2xl font-bold">No Note Selected</h2>
          <p className="text-muted-foreground">
            Select a note from the list or create a new one to start writing.
          </p>
        </div>
      </div>
    );
  }

  // Render the Markdown content
  const renderMarkdown = () => {
    // Use a simple Markdown parser - in a real app, you'd use a library like marked or remark
    // For this example, we'll just wrap the content in a div with the prose class for styling
    return (
      <div className="prose p-4" dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }} />
    );
  };

  // A very simple Markdown parser (in a real app, use a proper library)
  const simpleMarkdownToHtml = (text: string) => {
    // Handle code blocks
    text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle headings
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    
    // Handle bold and italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle links
    text = text.replace(/\[([^\[]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
    
    // Handle images
    text = text.replace(/!\[([^\[]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');
    
    // Handle lists
    text = text.replace(/^\s*- \[ \] (.*$)/gm, '<div class="flex items-start"><input type="checkbox" class="mt-1 mr-2" disabled /> <div>$1</div></div>');
    text = text.replace(/^\s*- \[x\] (.*$)/gm, '<div class="flex items-start"><input type="checkbox" class="mt-1 mr-2" checked disabled /> <div>$1</div></div>');
    text = text.replace(/^\s*- (.*$)/gm, '<li>$1</li>');
    text = text.replace(/^\s*\d+\. (.*$)/gm, '<li>$1</li>');
    
    // Wrap lists
    text = text.replace(/<li>(.*?)<\/li>/g, function(match) {
      if (match.indexOf('<input type="checkbox"') !== -1) {
        return match;
      }
      return '<ul>' + match + '</ul>';
    }).replace(/<\/ul><ul>/g, '');
    
    // Handle blockquotes
    text = text.replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Handle horizontal rules
    text = text.replace(/^\s*---\s*$/gm, '<hr />');
    
    // Handle paragraphs
    text = text.replace(/^(?!<[a-z])(.*$)/gm, function(match) {
      if (match.trim() === '') return '';
      return '<p>' + match + '</p>';
    });
    
    return text;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Note"
            className="w-full text-xl font-semibold bg-transparent border-none focus:outline-none"
          />
          <div className="text-xs text-muted-foreground flex items-center mt-1">
            {lastSaved && (
              <>
                <Save size={12} className="mr-1" />
                <span>{formatLastSaved()}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Move to folder dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <FolderIcon size={16} className="mr-1" />
                <span className="max-w-24 truncate">
                  {folders.find(f => f.id === selectedNote.folderId)?.name || 'All Notes'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <Select
                value={selectedNote.folderId || 'default'}
                onValueChange={(value) => {
                  updateNote(selectedNote.id, { folderId: value === 'default' ? null : value });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">All Notes</SelectItem>
                  {folders
                    .filter(folder => folder.id !== 'default')
                    .map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </PopoverContent>
          </Popover>

          {/* Tags dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <TagIcon size={16} className="mr-1" />
                <span>Tags</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-2">
                <div className="text-sm font-medium">Note tags</div>
                {selectedNote.tags.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-1">No tags assigned</div>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {selectedNote.tags.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <div 
                          key={tag.id} 
                          className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                        >
                          <div className={cn("w-2 h-2 rounded-full mr-1", tag.color)} />
                          <span>{tag.name}</span>
                          <button 
                            onClick={() => removeTagFromNote(selectedNote.id, tag.id)}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <Separator className="my-2" />
                <div className="text-sm font-medium">Add tags</div>
                {tags.length === 0 ? (
                  <div className="text-xs text-muted-foreground py-1">No tags available</div>
                ) : (
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {tags
                      .filter(tag => !selectedNote.tags.includes(tag.id))
                      .map(tag => (
                        <button
                          key={tag.id}
                          className="flex items-center w-full text-left text-sm px-2 py-1 rounded hover:bg-muted"
                          onClick={() => addTagToNote(selectedNote.id, tag.id)}
                        >
                          <div className={cn("w-2 h-2 rounded-full mr-2", tag.color)} />
                          <span>{tag.name}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Pin button */}
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", selectedNote.isPinned && "text-yellow-500")}
            onClick={() => togglePinNote(selectedNote.id)}
            title={selectedNote.isPinned ? "Unpin note" : "Pin note"}
          >
            {selectedNote.isPinned ? (
              <Star size={16} fill="currentColor" />
            ) : (
              <Pin size={16} />
            )}
          </Button>
          
          {/* Delete button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={handleDeleteNote}
            disabled={isDeleting}
            title="Delete note"
          >
            <Trash size={16} />
          </Button>
        </div>
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'write' | 'preview')}
        className="flex-1 flex flex-col"
      >
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-4">
            <TabsList>
              <TabsTrigger value="write">Write</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            
            {activeTab === 'write' && (
              <div className="flex items-center py-1">
                {formatOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={option.onClick}
                    title={option.title}
                  >
                    <option.icon size={16} />
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <TabsContent value="write" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="w-full h-full min-h-[calc(100vh-12rem)] p-4 resize-none bg-transparent border-none focus:outline-none font-mono"
            />
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {renderMarkdown()}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NoteEditor;
