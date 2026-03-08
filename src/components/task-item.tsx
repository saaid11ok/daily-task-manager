"use client";

import { Task } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, Tag, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export function TaskItem({ task, onToggle, onDelete, isReadOnly = false }: TaskItemProps) {
  return (
    <div className={cn(
      "group flex items-center gap-4 p-4 bg-card rounded-xl border transition-all hover:shadow-md",
      task.isCompleted && "opacity-60 bg-muted/30",
      isReadOnly && "bg-muted/10 cursor-default"
    )}>
      <Checkbox 
        checked={task.isCompleted} 
        onCheckedChange={() => !isReadOnly && onToggle(task.id)}
        disabled={isReadOnly}
        className={cn(
          "h-5 w-5 rounded-full border-2",
          isReadOnly && "cursor-default"
        )}
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium transition-all break-words",
          task.isCompleted && "line-through text-muted-foreground"
        )}>
          {task.description}
        </p>
        
        {task.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {task.categories.map(cat => (
              <Badge key={cat} variant="secondary" className="px-2 py-0 text-[10px] font-semibold tracking-wide uppercase flex items-center gap-1 bg-secondary/50 text-primary">
                <Tag className="w-2 h-2" />
                {cat}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {isReadOnly ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2">
                <Lock className="w-4 h-4 text-muted-foreground/40" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Record Locked</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(task.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete Task</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
