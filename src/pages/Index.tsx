
import React from 'react';
import Layout from '@/components/Layout';
import { NotesProvider } from '@/context/NotesContext';
import { ThemeProvider } from '@/components/ThemeProvider';

const Index = () => {
  return (
    <ThemeProvider>
      <NotesProvider>
        <Layout />
      </NotesProvider>
    </ThemeProvider>
  );
};

export default Index;
