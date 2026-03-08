"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Loader2, X } from 'lucide-react';
import { aiTaskCategorization } from '@/ai/flows/ai-task-categorization';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddTaskProps {
  onAdd: (description: string, categories: string[]) => void;
}

export function AddTask({ onAdd }: AddTaskProps) {
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const { toast } = useToast();

  const handleSuggest = async () => {
    if (!description.trim()) {
      toast({
        title: "Missing description",
        description: "Please enter a task description first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsCategorizing(true);
    try {
      const result = await aiTaskCategorization({ taskDescription: description });
      setCategories(result.categories);
    } catch (error) {
      console.error(error);
      toast({
        title: "AI error",
        description: "Could not fetch AI suggestions right now.",
        variant: "destructive"
      });
    } finally {
      setIsCategorizing(false);
    }
  };

  const removeCategory = (cat: string) => {
    setCategories(prev => prev.filter(c => c !== cat));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    onAdd(description, categories);
    setDescription('');
    setCategories([]);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input 
            placeholder="What needs to be done?" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-12 pr-12 text-base rounded-xl border-2 focus-visible:ring-primary/20"
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSuggest}
                disabled={isCategorizing || !description.trim()}
                className="absolute right-1 top-1 h-10 w-10 text-accent hover:text-accent hover:bg-accent/10"
              >
                {isCategorizing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Suggest Categories (AI)</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="submit" className="h-12 px-6 rounded-xl font-semibold shadow-lg shadow-primary/20">
              <Plus className="h-5 w-5 mr-1" />
              Add
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save Task</p>
          </TooltipContent>
        </Tooltip>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
          <span className="text-xs font-medium text-muted-foreground self-center mr-1">Suggested:</span>
          {categories.map(cat => (
            <Badge key={cat} variant="secondary" className="pl-3 pr-1 py-1 gap-1 group hover:bg-secondary transition-colors">
              {cat}
              <button 
                onClick={() => removeCategory(cat)}
                className="hover:text-destructive p-0.5 rounded-full hover:bg-background transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
