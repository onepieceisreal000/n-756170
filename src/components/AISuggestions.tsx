
import React from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { Button } from '@/components/ui/button';
import { Lightbulb, Check, Sparkles, X, Bot, Bug } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AISuggestionsProps {
  content: string;
  onApplySuggestion: (suggestion: string) => void;
}

const AISuggestions = ({ content, onApplySuggestion }: AISuggestionsProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { suggestion, grammarCheck, contentInsight, isLoading } = useAIAssistant({
    content,
    debounceMs: 1500,
  });

  const hasSuggestions = suggestion || grammarCheck || contentInsight;

  return (
    <div className="relative">
      {hasSuggestions && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "absolute bottom-4 right-4 rounded-full w-10 h-10 bg-primary/10 hover:bg-primary/20 transition-all z-10",
            isExpanded && "rotate-45 bg-primary/20"
          )}
        >
          {isExpanded ? <X size={20} /> : <Bot size={20} />}
        </Button>
      )}

      <AnimatePresence>
        {isExpanded && hasSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 20, height: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-16 right-4 w-80 rounded-lg glass-panel p-4 space-y-4 z-20 shadow-lg border border-primary/20"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm flex items-center">
                <Sparkles size={16} className="mr-2 text-primary" />
                AI Assistant
              </h3>
              {isLoading && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Thinking...
                </div>
              )}
            </div>

            {suggestion && (
              <div className="space-y-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Lightbulb size={14} className="mr-1" />
                  Suggestion
                </div>
                <div className="text-sm p-2 bg-primary/5 rounded">
                  {suggestion}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs" 
                  onClick={() => onApplySuggestion(suggestion)}
                >
                  <Check size={14} className="mr-1" />
                  Apply Suggestion
                </Button>
              </div>
            )}

            {grammarCheck && (
              <div className="space-y-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Bug size={14} className="mr-1" />
                  Grammar Feedback
                </div>
                <div className="text-sm p-2 bg-primary/5 rounded">
                  {grammarCheck}
                </div>
              </div>
            )}

            {contentInsight && (
              <div className="space-y-2">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Sparkles size={14} className="mr-1" />
                  Content Insight
                </div>
                <div className="text-sm p-2 bg-primary/5 rounded">
                  {contentInsight}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AISuggestions;
