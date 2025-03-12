import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '@/context/NotesContext';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion, AnimatePresence } from 'framer-motion';
import AISuggestions from './AISuggestions';
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
  Image as ImageIcon,
  Minus,
  Check,
  Trash,
  Pin,
  Star,
  Tag as TagIcon,
  X,
  Folder as FolderIcon,
  Save,
  Undo,
  Redo,
  Sparkles,
  Bot,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

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
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showAI, setShowAI] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setHistory([selectedNote.content]);
      setHistoryIndex(0);
    } else {
      setTitle('');
      setContent('');
      setHistory([]);
      setHistoryIndex(-1);
    }
  }, [selectedNote]);

  useEffect(() => {
    if (selectedNote && (title !== selectedNote.title || content !== selectedNote.content)) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      const timer = setTimeout(() => {
        saveNote();
      }, 1000);
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [title, content]);

  useEffect(() => {
    if (content && historyIndex >= 0 && content !== history[historyIndex]) {
      const newHistory = [...history.slice(0, historyIndex + 1), content];
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [content]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const saveNote = () => {
    if (!selectedNote) return;
    
    setIsSaving(true);
    
    updateNote(selectedNote.id, {
      title,
      content,
    });
    
    setLastSaved(new Date());
    setIsSaving(false);
    
    toast({
      title: "Note saved",
      description: "Your note has been saved successfully.",
      duration: 2000,
    });
  };

  const handleDeleteNote = () => {
    if (!selectedNote) return;
    
    setIsDeleting(true);
    deleteNote(selectedNote.id);
    setIsDeleting(false);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    return `Last saved ${format(lastSaved, 'h:mm a')}`;
  };

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newContent);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const formatOptions = [
    {
      icon: Bold,
      title: 'Bold',
      onClick: () => insertText('**', '**'),
      shortcut: '⌘B',
    },
    {
      icon: Italic,
      title: 'Italic',
      onClick: () => insertText('*', '*'),
      shortcut: '⌘I',
    },
    {
      icon: Heading1,
      title: 'Heading 1',
      onClick: () => insertText('# '),
      shortcut: null,
    },
    {
      icon: Heading2,
      title: 'Heading 2',
      onClick: () => insertText('## '),
      shortcut: null,
    },
    {
      icon: List,
      title: 'Bullet List',
      onClick: () => insertText('- '),
      shortcut: null,
    },
    {
      icon: ListOrdered,
      title: 'Numbered List',
      onClick: () => insertText('1. '),
      shortcut: null,
    },
    {
      icon: Check,
      title: 'Checkbox',
      onClick: () => insertText('- [ ] '),
      shortcut: null,
    },
    {
      icon: Quote,
      title: 'Blockquote',
      onClick: () => insertText('> '),
      shortcut: null,
    },
    {
      icon: Code,
      title: 'Code Block',
      onClick: () => insertText('```\n', '\n```'),
      shortcut: null,
    },
    {
      icon: Link,
      title: 'Link',
      onClick: () => insertText('[', '](url)'),
      shortcut: null,
    },
    {
      icon: ImageIcon,
      title: 'Image',
      onClick: () => insertText('![alt text](', ')'),
      shortcut: null,
    },
    {
      icon: Minus,
      title: 'Divider',
      onClick: () => insertText('\n---\n'),
      shortcut: null,
    },
  ];

  const applySuggestion = (suggestion: string) => {
    if (!suggestion) return;
    setContent(content + ' ' + suggestion);
    
    toast({
      title: "AI suggestion applied",
      description: "The suggestion has been added to your note.",
      duration: 2000,
    });
    
    if (historyIndex >= 0) {
      const newContent = content + ' ' + suggestion;
      const newHistory = [...history.slice(0, historyIndex + 1), newContent];
      if (newHistory.length > 50) {
        newHistory.shift();
      }
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0", 
                    aiEnabled && "text-primary"
                  )}
                  onClick={() => setAiEnabled(!aiEnabled)}
                >
                  <Sparkles size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {aiEnabled ? "Disable AI assistant" : "Enable AI assistant"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
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
                  toast({
                    title: "Folder changed",
                    description: `Note moved to ${folders.find(f => f.id === value)?.name || 'All Notes'}`,
                    duration: 2000,
                  });
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
                        <motion.div 
                          key={tag.id} 
                          className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className={cn("w-2 h-2 rounded-full mr-1", tag.color)} />
                          <span>{tag.name}</span>
                          <button 
                            onClick={() => {
                              removeTagFromNote(selectedNote.id, tag.id);
                              toast({
                                title: "Tag removed",
                                description: `Tag "${tag.name}" removed from note`,
                                duration: 1500,
                              });
                            }}
                            className="ml-1 text-muted-foreground hover:text-foreground"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
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
                        <motion.button
                          key={tag.id}
                          className="flex items-center w-full text-left text-sm px-2 py-1 rounded hover:bg-muted"
                          onClick={() => {
                            addTagToNote(selectedNote.id, tag.id);
                            toast({
                              title: "Tag added",
                              description: `Tag "${tag.name}" added to note`,
                              duration: 1500,
                            });
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={cn("w-2 h-2 rounded-full mr-2", tag.color)} />
                          <span>{tag.name}</span>
                        </motion.button>
                      ))}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 w-8 p-0", selectedNote.isPinned && "text-yellow-500")}
                  onClick={() => togglePinNote(selectedNote.id)}
                >
                  {selectedNote.isPinned ? (
                    <Star size={16} fill="currentColor" />
                  ) : (
                    <Pin size={16} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {selectedNote.isPinned ? "Unpin note" : "Pin note"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={handleDeleteNote}
                  disabled={isDeleting}
                >
                  <Trash size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Delete note
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
              <div className="flex items-center py-1 overflow-x-auto scrollbar-none">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground"
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                      >
                        <Undo size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Undo</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground"
                        onClick={handleRedo}
                        disabled={historyIndex >= history.length - 1}
                      >
                        <Redo size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Redo</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <Separator orientation="vertical" className="h-6 mx-2" />
                
                {formatOptions.map((option, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={option.onClick}
                        >
                          <option.icon size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {option.title}
                        {option.shortcut && <span className="ml-2 text-xs opacity-70">{option.shortcut}</span>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <TabsContent value="write" className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note..."
              className="w-full h-full min-h-[calc(100vh-12rem)] p-4 resize-none bg-transparent border-none focus:outline-none font-mono"
            />
          </ScrollArea>
          
          {aiEnabled && <AISuggestions content={content} onApplySuggestion={applySuggestion} />}
        </TabsContent>
        
        <TabsContent value="preview" className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 prose dark:prose-invert prose-blue max-w-none">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content}
              </ReactMarkdown>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NoteEditor;
