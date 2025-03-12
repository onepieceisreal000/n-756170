
export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface NoteStore {
  notes: Note[];
  folders: Folder[];
  tags: Tag[];
  selectedNoteId: string | null;
  selectedFolderId: string | null;
  selectedTagId: string | null;
  searchQuery: string;
}
