"use client";

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/lib/types';
import { getTodayStr, getTomorrowStr } from '@/lib/time-utils';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('taskflow_v2_tasks');
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('taskflow_v2_tasks', JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const addTask = useCallback((description: string, categories: string[], date: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      description,
      categories,
      isCompleted: false,
      createdAt: Date.now(),
      date: date,
    };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== id) return task;
      
      const today = getTodayStr();
      // Allow toggling for today or future dates
      if (task.date < today) return task;
      
      return { ...task, isCompleted: !task.isCompleted };
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const deleteDay = useCallback((dateStr: string) => {
    setTasks(prev => prev.filter(task => task.date !== dateStr));
  }, []);

  const clearAllData = useCallback(() => {
    setTasks([]);
    localStorage.removeItem('taskflow_v2_tasks');
  }, []);

  const getTasksForDate = useCallback((dateStr: string) => {
    return tasks.filter(t => t.date === dateStr);
  }, [tasks]);

  const getAllUniqueDates = useCallback(() => {
    const dates = Array.from(new Set(tasks.map(t => t.date)));
    const today = getTodayStr();
    const tomorrow = getTomorrowStr();
    
    if (!dates.includes(today)) dates.push(today);
    if (!dates.includes(tomorrow)) dates.push(tomorrow);
    
    return dates.sort((a, b) => b.localeCompare(a));
  }, [tasks]);

  return {
    tasks,
    isLoaded,
    addTask,
    toggleTask,
    deleteTask,
    deleteDay,
    clearAllData,
    getTasksForDate,
    getAllUniqueDates
  };
}
