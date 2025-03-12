
import React from 'react';
import Layout from '@/components/Layout';
import { NotesProvider } from '@/context/NotesContext';

const Index = () => {
  return (
    <NotesProvider>
      <Layout>
        <div></div>
      </Layout>
    </NotesProvider>
  );
};

export default Index;
