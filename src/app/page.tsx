"use client";

import { useState, useMemo, useEffect } from 'react';
import { useTasks } from '@/hooks/use-tasks';
import { AddTask } from '@/components/add-task';
import { TaskItem } from '@/components/task-item';
import { TaskFilter } from '@/lib/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle2, 
  ListTodo, 
  Sparkles, 
  Calendar, 
  Clock, 
  History,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Trash2,
  RefreshCcw
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getTodayStr, formatRemainingTime, formatDateLabel } from '@/lib/time-utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { 
    isLoaded, 
    addTask, 
    toggleTask, 
    deleteTask, 
    deleteDay, 
    clearAllData, 
    getTasksForDate, 
    getAllUniqueDates 
  } = useTasks();
  const { toast } = useToast();
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize selected date and mounting state
  useEffect(() => {
    setMounted(true);
    if (isLoaded && !selectedDate) {
      setSelectedDate(getTodayStr());
    }
  }, [isLoaded, selectedDate]);

  // Real-time clock and automatic day flip
  useEffect(() => {
    if (!mounted) return;

    const timer = setInterval(() => {
      const remaining = formatRemainingTime();
      setCurrentTime(remaining);
      
      const today = getTodayStr();
      // If midnight hits and we are looking at 'yesterday' (which just became today)
      // or if we were on today and it's now locked.
      if (remaining === "00:00:00" && selectedDate === today) {
        toast({
          title: "Day Protocol Updated",
          description: "Midnight reached. Transitioning to new current day.",
        });
        // Optionally force switch to new today
        setSelectedDate(getTodayStr());
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedDate, mounted, toast]);

  const allDates = useMemo(() => {
    if (!mounted || !isLoaded) return [];
    return getAllUniqueDates();
  }, [getAllUniqueDates, isLoaded, mounted]);
  
  const currentTasks = useMemo(() => {
    if (!selectedDate) return [];
    const tasks = getTasksForDate(selectedDate);
    switch (filter) {
      case 'active': return tasks.filter(t => !t.isCompleted);
      case 'completed': return tasks.filter(t => t.isCompleted);
      default: return tasks;
    }
  }, [selectedDate, filter, getTasksForDate]);

  const stats = useMemo(() => {
    if (!selectedDate) return { total: 0, active: 0, completed: 0, percentage: 0 };
    const tasks = getTasksForDate(selectedDate);
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    return {
      total,
      active: total - completed,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }, [selectedDate, getTasksForDate]);

  const historyStats = useMemo(() => {
    return allDates.map(date => {
      const tasks = getTasksForDate(date);
      const total = tasks.length;
      const completed = tasks.filter(t => t.isCompleted).length;
      return {
        date,
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
  }, [allDates, getTasksForDate]);

  const today = getTodayStr();
  const isTodaySelected = selectedDate === today;
  const isPastDay = selectedDate < today;
  const isExpired = currentTime === "00:00:00" && isTodaySelected;
  
  // Locked if it's a past day OR if it's today and the deadline passed
  const isLocked = isPastDay || (isTodaySelected && currentTime === "00:00:00");

  const handleDateNav = (direction: 'prev' | 'next') => {
    const currentIndex = allDates.indexOf(selectedDate);
    if (direction === 'prev' && currentIndex < allDates.length - 1) {
      setSelectedDate(allDates[currentIndex + 1]);
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedDate(allDates[currentIndex - 1]);
    }
  };

  const handleDeleteDay = (date: string) => {
    deleteDay(date);
    if (selectedDate === date) {
      setSelectedDate(getTodayStr());
    }
    toast({
      title: "History Cleared",
      description: `Data for ${date} has been removed.`,
    });
  };

  const handleClearAll = () => {
    clearAllData();
    setIsClearAlertOpen(false);
    setIsHistoryOpen(false);
    setSelectedDate(getTodayStr());
    toast({
      title: "Factory Reset Complete",
      description: "All application data has been cleared.",
      variant: "destructive",
    });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen pb-20 selection:bg-accent/30 flex flex-col items-center">
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,107,191,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(22,187,219,0.05),transparent_40%)] pointer-events-none" />

        <main className="w-full max-w-lg px-4 pt-8 md:pt-12 relative z-10">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <CheckCircle2 className="text-primary-foreground w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">TaskFlow</h1>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">Protocol: Midnight</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Sheet open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-primary/20 bg-card/50">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </Button>
                    </SheetTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Performance History</p>
                  </TooltipContent>
                </Tooltip>

                <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
                  <SheetHeader className="p-6 pb-2">
                    <SheetTitle className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Performance History
                    </SheetTitle>
                    <SheetDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Historical completion metrics
                    </SheetDescription>
                  </SheetHeader>
                  
                  <ScrollArea className="flex-1 px-6 pb-6">
                    <div className="space-y-3 mt-4">
                      {historyStats.map((day) => {
                        const dayTasks = getTasksForDate(day.date);
                        return (
                          <div key={day.date} className="relative group">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  onClick={() => {
                                    setSelectedDate(day.date);
                                    setIsHistoryOpen(false);
                                  }}
                                  className={`w-full text-left p-4 rounded-2xl border transition-all hover:border-primary/50 ${
                                    selectedDate === day.date ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card border-border/50'
                                  }`}
                                >
                                  <div className="flex justify-between items-start mb-2 pr-8">
                                    <div>
                                      <p className="font-bold text-sm">{formatDateLabel(day.date)}</p>
                                      <p className="text-[10px] font-medium text-muted-foreground font-mono">{day.date}</p>
                                      <p className="text-[10px] font-black text-muted-foreground uppercase mt-1">{day.total} Tasks Recorded</p>
                                    </div>
                                    <div className="text-right">
                                      <p className={`text-sm font-black ${day.percentage >= 80 ? 'text-green-600' : 'text-primary'}`}>
                                        {day.percentage}%
                                      </p>
                                    </div>
                                  </div>
                                  <Progress value={day.percentage} className="h-1.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="w-64 p-3 bg-card border-primary/20 shadow-xl">
                                <div className="space-y-2">
                                  <p className="text-[10px] font-bold uppercase text-primary border-b border-primary/10 pb-1">Day Preview • {day.date}</p>
                                  {dayTasks.length > 0 ? (
                                    <ul className="space-y-1.5">
                                      {dayTasks.slice(0, 5).map(task => (
                                        <li key={task.id} className="text-[11px] leading-tight flex items-start gap-2">
                                          <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${task.isCompleted ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                                          <span className={`line-clamp-2 ${task.isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                            {task.description}
                                          </span>
                                        </li>
                                      ))}
                                      {dayTasks.length > 5 && (
                                        <li className="text-[9px] text-muted-foreground font-bold uppercase pt-1">
                                          + {dayTasks.length - 5} more tasks
                                        </li>
                                      )}
                                    </ul>
                                  ) : (
                                    <p className="text-[10px] text-muted-foreground italic">No tasks recorded for this day.</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDay(day.date);
                                  }}
                                  className="absolute right-2 top-4 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>Delete History Record</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <SheetFooter className="p-6 pt-2 border-t mt-auto">
                    <AlertDialog open={isClearAlertOpen} onOpenChange={setIsClearAlertOpen}>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          className="w-full rounded-xl gap-2 font-bold uppercase tracking-wider text-[10px]"
                        >
                          <RefreshCcw className="w-4 h-4" />
                          Clear All History & Tasks
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your task history and current tasks from local storage.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleClearAll}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Yes, Clear Everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </SheetFooter>
                </SheetContent>
              </Sheet>

              {isTodaySelected && (
                <div className="text-right">
                  <div className={`flex items-center gap-1 font-mono font-bold text-lg ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                    <Clock className="w-4 h-4" />
                    {isExpired ? "00:00" : (currentTime || "00:00")}
                  </div>
                  <p className="text-[9px] uppercase tracking-tighter text-muted-foreground font-bold">
                    {isExpired ? "DEADLINE PASSED" : "REMAINING"}
                  </p>
                </div>
              )}
            </div>
          </header>

          <div className="flex items-center justify-between mb-6 bg-card/60 backdrop-blur-sm p-1.5 rounded-2xl border shadow-sm">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDateNav('prev')} 
                  disabled={allDates.indexOf(selectedDate) >= allDates.length - 1} 
                  className="rounded-xl h-10 w-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Previous Day</p>
              </TooltipContent>
            </Tooltip>

            <div className="flex flex-col items-center gap-0.5 px-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Calendar className="w-4 h-4 text-primary" />
                {formatDateLabel(selectedDate)}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{selectedDate}</span>
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDateNav('next')} 
                  disabled={allDates.indexOf(selectedDate) <= 0} 
                  className="rounded-xl h-10 w-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next Day</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {isExpired && isTodaySelected && (
            <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 animate-in fade-in slide-in-from-top-4 rounded-2xl">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-bold">Day Finalized</AlertTitle>
              <AlertDescription className="text-xs">
                Midnight deadline reached. Protocol transition in progress.
              </AlertDescription>
            </Alert>
          )}

          <section className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-card/50 backdrop-blur-sm border-none shadow-sm rounded-2xl">
              <CardContent className="p-4 text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Tasks</p>
                <p className="text-xl font-black">{isLoaded ? stats.total : '...'}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-none shadow-sm rounded-2xl">
              <CardContent className="p-4 text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Score</p>
                <p className="text-xl font-black text-primary">{isLoaded ? `${stats.percentage}%` : '...'}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-none shadow-sm rounded-2xl">
              <CardContent className="p-4 text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Done</p>
                <p className="text-xl font-black text-green-600">{isLoaded ? stats.completed : '...'}</p>
              </CardContent>
            </Card>
          </section>

          <section className="bg-card/80 backdrop-blur-md rounded-[2rem] p-5 md:p-6 shadow-xl shadow-foreground/5 border min-h-[50vh]">
            {!isLocked ? (
              <AddTask onAdd={(desc, cats) => addTask(desc, cats, selectedDate)} />
            ) : (
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 bg-muted/30 p-3 rounded-2xl border border-dashed">
                <History className="w-3 h-3" />
                {isExpired ? "Day Finalized • Record Locked" : "Historical Record • Read-Only"}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as TaskFilter)} className="w-auto">
                  <TabsList className="bg-muted/50 p-1 h-9 rounded-xl">
                    <TabsTrigger value="all" className="rounded-lg text-[10px] px-3 font-bold uppercase">All</TabsTrigger>
                    <TabsTrigger value="active" className="rounded-lg text-[10px] px-3 font-bold uppercase">Active</TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-lg text-[10px] px-3 font-bold uppercase">Done</TabsTrigger>
                  </TabsList>
                </Tabs>
                <span className="text-[10px] font-black text-muted-foreground uppercase">{currentTasks.length} ITEMS</span>
              </div>

              <div className="space-y-3">
                {!isLoaded ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                  ))
                ) : currentTasks.length > 0 ? (
                  currentTasks.map(task => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onToggle={toggleTask} 
                      onDelete={deleteTask}
                      isReadOnly={isLocked}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
                    <ListTodo className="w-10 h-10 text-muted-foreground" />
                    <div>
                      <h3 className="text-sm font-bold uppercase">Empty Log</h3>
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {!isLocked ? "Awaiting your input." : "No activity recorded."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="mt-8 flex flex-col items-center gap-4">
            <footer className="text-center text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
              <Sparkles className="w-3 h-3" />
              TaskFlow Protocol
            </footer>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}