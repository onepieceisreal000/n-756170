
import { useEffect, useState } from 'react';
import { getSuggestions, checkGrammar, analyzeContent } from '@/services/geminiAI';
import { useDebounce } from '@/hooks/useDebounce';

interface UseAIAssistantProps {
  content: string;
  debounceMs?: number;
}

export const useAIAssistant = ({ content, debounceMs = 1000 }: UseAIAssistantProps) => {
  const [suggestion, setSuggestion] = useState<string>('');
  const [grammarCheck, setGrammarCheck] = useState<string>('');
  const [contentInsight, setContentInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debouncedContent = useDebounce(content, debounceMs);
  
  // Get suggestions when content changes
  useEffect(() => {
    const fetchSuggestion = async () => {
      if (!debouncedContent || debouncedContent.length < 50) {
        setSuggestion('');
        return;
      }
      
      try {
        setIsLoading(true);
        const result = await getSuggestions(debouncedContent);
        setSuggestion(result);
      } catch (err) {
        setError('Failed to get suggestions');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestion();
  }, [debouncedContent]);
  
  // Check grammar when a paragraph is completed (detected by line breaks)
  useEffect(() => {
    const paragraphs = debouncedContent.split('\n\n');
    const lastParagraph = paragraphs[paragraphs.length - 1];
    
    const checkLastParagraphGrammar = async () => {
      if (!lastParagraph || lastParagraph.length < 20) {
        setGrammarCheck('');
        return;
      }
      
      try {
        const result = await checkGrammar(lastParagraph);
        setGrammarCheck(result);
      } catch (err) {
        console.error(err);
      }
    };
    
    checkLastParagraphGrammar();
  }, [debouncedContent]);
  
  // Analyze content for insights periodically
  useEffect(() => {
    if (!debouncedContent || debouncedContent.length < 100) {
      setContentInsight('');
      return;
    }
    
    const analyzeNoteContent = async () => {
      try {
        const result = await analyzeContent(debouncedContent);
        setContentInsight(result);
      } catch (err) {
        console.error(err);
      }
    };
    
    analyzeNoteContent();
  }, [debouncedContent]);
  
  return {
    suggestion,
    grammarCheck,
    contentInsight,
    isLoading,
    error,
  };
};
