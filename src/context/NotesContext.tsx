import React, { createContext, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Note, Folder, Tag, NoteStore } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface NotesContextProps {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  selectedNote: Note | null;
  selectedFolder: Folder | null;
  selectedTag: Tag | null;
  searchQuery: string;
  createNote: (folderId?: string | null) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id'>>) => void;
  deleteNote: (id: string) => void;
  selectNote: (id: string | null) => void;
  createFolder: (name: string, parentId?: string | null) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  selectFolder: (id: string | null) => void;
  createTag: (name: string, color?: string) => void;
  updateTag: (id: string, name: string, color: string) => void;
  deleteTag: (id: string) => void;
  selectTag: (id: string | null) => void;
  addTagToNote: (noteId: string, tagId: string) => void;
  removeTagFromNote: (noteId: string, tagId: string) => void;
  setSearchQuery: (query: string) => void;
  togglePinNote: (id: string) => void;
  getFilteredNotes: () => Note[];
  reorderFolders: (folderIds: string[]) => void;
  reorderTags: (tagIds: string[]) => void;
}

const defaultStore: NoteStore = {
  notes: [],
  folders: [
    {
      id: 'default',
      name: 'All Notes',
      parentId: null,
      createdAt: new Date().toISOString(),
    },
  ],
  tags: [],
  selectedNoteId: null,
  selectedFolderId: 'default',
  selectedTagId: null,
  searchQuery: '',
};

// Define sample colors for tags
const tagColors = [
  'bg-blue-500',
  'bg-red-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const NotesContext = createContext<NotesContextProps | undefined>(undefined);

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [store, setStore] = useLocalStorage<NoteStore>('notes-app-store', defaultStore);
  const { toast } = useToast();

  // Helper function to get random color for tags
  const getRandomColor = () => {
    return tagColors[Math.floor(Math.random() * tagColors.length)];
  };

  const selectedNote = store.selectedNoteId
    ? store.notes.find((note) => note.id === store.selectedNoteId) ?? null
    : null;

  const selectedFolder = store.selectedFolderId
    ? store.folders.find((folder) => folder.id === store.selectedFolderId) ?? null
    : null;

  const selectedTag = store.selectedTagId
    ? store.tags.find((tag) => tag.id === store.selectedTagId) ?? null
    : null;

  // Create a new note
  const createNote = (folderId: string | null = store.selectedFolderId) => {
    const newNote: Note = {
      id: uuidv4(),
      title: 'Untitled Note',
      content: '',
      folderId,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
    };

    setStore({
      ...store,
      notes: [newNote, ...store.notes],
      selectedNoteId: newNote.id,
    });

    toast({
      title: 'Note created',
      description: 'New note has been created.',
      duration: 2000,
    });
  };

  // Update an existing note
  const updateNote = (id: string, updates: Partial<Omit<Note, 'id'>>) => {
    setStore({
      ...store,
      notes: store.notes.map((note) =>
        note.id === id
          ? {
              ...note,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : note
      ),
    });
  };

  // Delete a note
  const deleteNote = (id: string) => {
    setStore({
      ...store,
      notes: store.notes.filter((note) => note.id !== id),
      selectedNoteId: store.selectedNoteId === id ? null : store.selectedNoteId,
    });

    toast({
      title: 'Note deleted',
      description: 'The note has been deleted.',
      duration: 2000,
    });
  };

  // Select a note
  const selectNote = (id: string | null) => {
    setStore({
      ...store,
      selectedNoteId: id,
    });
  };

  // Create a new folder
  const createFolder = (name: string, parentId: string | null = null) => {
    const newFolder: Folder = {
      id: uuidv4(),
      name,
      parentId,
      createdAt: new Date().toISOString(),
    };

    setStore({
      ...store,
      folders: [...store.folders, newFolder],
    });

    toast({
      title: 'Folder created',
      description: `Folder "${name}" has been created.`,
      duration: 2000,
    });
  };

  // Update a folder
  const updateFolder = (id: string, name: string) => {
    setStore({
      ...store,
      folders: store.folders.map((folder) =>
        folder.id === id
          ? {
              ...folder,
              name,
            }
          : folder
      ),
    });
  };

  // Delete a folder and its notes
  const deleteFolder = (id: string) => {
    if (id === 'default') {
      toast({
        title: 'Cannot delete folder',
        description: 'The default folder cannot be deleted.',
        variant: 'destructive',
        duration: 2000,
      });
      return;
    }

    setStore({
      ...store,
      folders: store.folders.filter((folder) => folder.id !== id),
      notes: store.notes.map((note) =>
        note.folderId === id ? { ...note, folderId: 'default' } : note
      ),
      selectedFolderId: store.selectedFolderId === id ? 'default' : store.selectedFolderId,
    });

    toast({
      title: 'Folder deleted',
      description: 'The folder and its notes have been moved to All Notes.',
      duration: 2000,
    });
  };

  // Select a folder
  const selectFolder = (id: string | null) => {
    setStore({
      ...store,
      selectedFolderId: id || 'default',
      selectedTagId: null,
      selectedNoteId: null,
    });
  };

  // Create a new tag
  const createTag = (name: string, color: string = getRandomColor()) => {
    const newTag: Tag = {
      id: uuidv4(),
      name,
      color,
    };

    setStore({
      ...store,
      tags: [...store.tags, newTag],
    });

    toast({
      title: 'Tag created',
      description: `Tag "${name}" has been created.`,
      duration: 2000,
    });
  };

  // Update a tag
  const updateTag = (id: string, name: string, color: string) => {
    setStore({
      ...store,
      tags: store.tags.map((tag) =>
        tag.id === id
          ? {
              ...tag,
              name,
              color,
            }
          : tag
      ),
    });
  };

  // Delete a tag and remove it from notes
  const deleteTag = (id: string) => {
    setStore({
      ...store,
      tags: store.tags.filter((tag) => tag.id !== id),
      notes: store.notes.map((note) => ({
        ...note,
        tags: note.tags.filter((tagId) => tagId !== id),
      })),
      selectedTagId: store.selectedTagId === id ? null : store.selectedTagId,
    });

    toast({
      title: 'Tag deleted',
      description: 'The tag has been deleted from all notes.',
      duration: 2000,
    });
  };

  // Select a tag
  const selectTag = (id: string | null) => {
    setStore({
      ...store,
      selectedTagId: id,
      selectedFolderId: id ? null : store.selectedFolderId,
      selectedNoteId: null,
    });
  };

  // Add a tag to a note
  const addTagToNote = (noteId: string, tagId: string) => {
    setStore({
      ...store,
      notes: store.notes.map((note) =>
        note.id === noteId && !note.tags.includes(tagId)
          ? {
              ...note,
              tags: [...note.tags, tagId],
              updatedAt: new Date().toISOString(),
            }
          : note
      ),
    });
  };

  // Remove a tag from a note
  const removeTagFromNote = (noteId: string, tagId: string) => {
    setStore({
      ...store,
      notes: store.notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              tags: note.tags.filter((id) => id !== tagId),
              updatedAt: new Date().toISOString(),
            }
          : note
      ),
    });
  };

  // Set search query
  const setSearchQuery = (query: string) => {
    setStore({
      ...store,
      searchQuery: query,
    });
  };

  // Toggle pin status of a note
  const togglePinNote = (id: string) => {
    setStore({
      ...store,
      notes: store.notes.map((note) =>
        note.id === id
          ? {
              ...note,
              isPinned: !note.isPinned,
              updatedAt: new Date().toISOString(),
            }
          : note
      ),
    });
  };

  // Reorder folders
  const reorderFolders = (folderIds: string[]) => {
    // Get the default folder and user folders
    const defaultFolder = store.folders.find(folder => folder.id === 'default');
    const userFolders = store.folders.filter(folder => folder.id !== 'default');
    
    // Create a new array with the reordered folders
    const orderedFolders = folderIds.map(
      id => userFolders.find(folder => folder.id === id)
    ).filter(Boolean) as Folder[];
    
    // Make sure the default folder is always first
    const newFolders = defaultFolder 
      ? [defaultFolder, ...orderedFolders]
      : orderedFolders;
    
    setStore({
      ...store,
      folders: newFolders
    });
  };

  // Reorder tags
  const reorderTags = (tagIds: string[]) => {
    // Create a new array with the reordered tags
    const orderedTags = tagIds.map(
      id => store.tags.find(tag => tag.id === id)
    ).filter(Boolean) as Tag[];
    
    setStore({
      ...store,
      tags: orderedTags
    });
  };

  // Get filtered notes based on selected folder, tag, and search query
  const getFilteredNotes = () => {
    let filteredNotes = store.notes;

    // Filter by folder
    if (store.selectedFolderId) {
      filteredNotes = filteredNotes.filter(
        (note) => note.folderId === store.selectedFolderId
      );
    }

    // Filter by tag
    if (store.selectedTagId) {
      filteredNotes = filteredNotes.filter((note) =>
        note.tags.includes(store.selectedTagId!)
      );
    }

    // Filter by search query
    if (store.searchQuery) {
      const query = store.searchQuery.toLowerCase();
      filteredNotes = filteredNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
      );
    }

    // Sort by pinned status and then by updatedAt date
    return filteredNotes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  };

  // Initialize with some sample data if empty
  useEffect(() => {
    if (store.notes.length === 0 && store.folders.length === 1) {
      const sampleTag1: Tag = {
        id: uuidv4(),
        name: 'Important',
        color: 'bg-red-500',
      };

      const sampleTag2: Tag = {
        id: uuidv4(),
        name: 'Work',
        color: 'bg-blue-500',
      };

      const sampleTag3: Tag = {
        id: uuidv4(),
        name: 'Personal',
        color: 'bg-green-500',
      };

      const workFolder: Folder = {
        id: uuidv4(),
        name: 'Work',
        parentId: null,
        createdAt: new Date().toISOString(),
      };

      const personalFolder: Folder = {
        id: uuidv4(),
        name: 'Personal',
        parentId: null,
        createdAt: new Date().toISOString(),
      };

      const welcomeNote: Note = {
        id: uuidv4(),
        title: 'Welcome to Notes App',
        content: `# Welcome to Notes App! 🎉

This is a markdown-based note-taking application. Here are some features:

## Features

- **Folders**: Organize your notes in folders
- **Tags**: Add tags to your notes for easy filtering
- **Markdown Support**: Write your notes in markdown format
- **Search**: Find your notes quickly

## Markdown Examples

### Text Formatting

You can write in **bold** or *italic* or ~~strikethrough~~.

### Lists

- Item 1
- Item 2
  - Nested item

1. Ordered item 1
2. Ordered item 2

### Code

Inline \`code\` looks like this.

\`\`\`javascript
// Code block
function hello() {
  console.log("Hello World!");
}
\`\`\`

### Links and Images

[Link text](https://example.com)

Enjoy using Notes App!
`,
        folderId: 'default',
        tags: [sampleTag1.id, sampleTag3.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: true,
      };

      const workNote: Note = {
        id: uuidv4(),
        title: 'Work Project Ideas',
        content: `# Project Ideas

## Web Application
- Implement new dashboard
- Add dark mode support
- Optimize for mobile devices

## API Integrations
- Connect with payment services
- Implement OAuth2
- Add webhooks support

## Future Features
- Real-time collaboration
- Export to multiple formats
- Version history
`,
        folderId: workFolder.id,
        tags: [sampleTag2.id],
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        isPinned: false,
      };

      const todoNote: Note = {
        id: uuidv4(),
        title: 'Personal Todo',
        content: `# Todo List

- [x] Buy groceries
- [ ] Call mom
- [ ] Schedule dentist appointment
- [x] Pay bills
- [ ] Plan weekend trip
- [ ] Fix the leaky faucet
`,
        folderId: personalFolder.id,
        tags: [sampleTag3.id],
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        isPinned: false,
      };

      setStore({
        ...store,
        folders: [...store.folders, workFolder, personalFolder],
        tags: [sampleTag1, sampleTag2, sampleTag3],
        notes: [welcomeNote, workNote, todoNote],
        selectedNoteId: welcomeNote.id,
      });
    }
  }, []);

  return (
    <NotesContext.Provider
      value={{
        notes: store.notes,
        folders: store.folders,
        tags: store.tags,
        selectedNote,
        selectedFolder,
        selectedTag,
        searchQuery: store.searchQuery,
        createNote,
        updateNote,
        deleteNote,
        selectNote,
        createFolder,
        updateFolder,
        deleteFolder,
        selectFolder,
        createTag,
        updateTag,
        deleteTag,
        selectTag,
        addTagToNote,
        removeTagFromNote,
        setSearchQuery,
        togglePinNote,
        getFilteredNotes,
        reorderFolders,
        reorderTags,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
