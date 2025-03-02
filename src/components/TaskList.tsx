
import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Trash2, Edit, Check, X, Calendar, User, ListTodo, AlertTriangle, FileText, File, ArrowUpDown, Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isValid, parseISO, isBefore, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import config from '@/config';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  startDate: string;
  dueDate?: string;
  assignee?: string;
  progress: number;
  status: string;
  category?: string;
  parentId?: string;
  isPhase?: boolean;
  subtasks?: Task[];
}

interface TaskListProps {
  filter: string | null;
  onProgressUpdate?: (progress: number) => void;
  onTasksLoaded?: (tasks: Task[]) => void;
  view?: 'list' | 'kanban' | 'calendar';
}

const TaskList: React.FC<TaskListProps> = ({ 
  filter, 
  onProgressUpdate, 
  onTasksLoaded,
  view = 'list'
}) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isDueDateOpen, setIsDueDateOpen] = useState(false);
  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);
  const [hierarchicalTasks, setHierarchicalTasks] = useState<Task[]>([]);
  const [kanbanColumns, setKanbanColumns] = useState<{[key: string]: Task[]}>({});
  const [selectedBatchItems, setSelectedBatchItems] = useState<string[]>([]);
  const [batchAction, setBatchAction] = useState<string>('status');
  const [batchValue, setBatchValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isGoogleSheetsInitialized, setIsGoogleSheetsInitialized] = useState(false);

  // Function to build hierarchical task structure
  const buildHierarchy = useCallback((taskList: Task[]) => {
    const taskMap: { [key: string]: Task } = {};
    const rootTasks: Task[] = [];
    
    // First pass: add all tasks to the map
    taskList.forEach(task => {
      // Create a copy with subtasks array
      const taskWithSubtasks = { ...task, subtasks: [] as Task[] };
      
      // Mark tasks with numeric IDs (1, 2, 3) as phases
      if (/^\d+$/.test(task.id) && !task.id.includes('.')) {
        taskWithSubtasks.isPhase = true;
      }
      
      taskMap[task.id] = taskWithSubtasks;
    });
    
    // Second pass: build the hierarchy
    Object.values(taskMap).forEach(task => {
      // If task has a parentId and the parent exists in our map
      if (task.parentId && taskMap[task.parentId]) {
        if (!taskMap[task.parentId].subtasks) {
          taskMap[task.parentId].subtasks = [];
        }
        taskMap[task.parentId].subtasks!.push(task);
      } 
      // If task has no parent or parent doesn't exist, it's a root task
      else if (!task.parentId || !taskMap[task.parentId]) {
        rootTasks.push(task);
      }
    });
    
    // Sort root tasks by ID
    rootTasks.sort((a, b) => {
      // Convert IDs to numbers for numeric sorting
      const idA = parseFloat(a.id.split('.')[0]);
      const idB = parseFloat(b.id.split('.')[0]);
      return idA - idB;
    });
    
    // For each root task, sort its subtasks
    rootTasks.forEach(task => {
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.sort((a, b) => {
          // Get the full ID for proper sorting (e.g., 1.1, 1.2, 1.10)
          return a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' });
        });
      }
    });
    
    return rootTasks;
  }, []);

  // Function to build Kanban view columns
  const buildKanbanColumns = useCallback((taskList: Task[]) => {
    const columns: {[key: string]: Task[]} = {
      not_started: [],
      in_progress: [],
      completed: [],
      pending: []
    };
    
    // Flatten the hierarchical structure for kanban view
    const flattenTasks = (tasks: Task[]): Task[] => {
      return tasks.reduce((acc, task) => {
        acc.push(task);
        if (task.subtasks && task.subtasks.length > 0) {
          acc.push(...flattenTasks(task.subtasks));
        }
        return acc;
      }, [] as Task[]);
    };
    
    const allTasks = flattenTasks(taskList);
    
    // Fill columns based on task status
    allTasks.forEach(task => {
      if (columns[task.status]) {
        columns[task.status].push(task);
      } else {
        columns.not_started.push(task);
      }
    });
    
    return columns;
  }, []);

  // Helper function to find a task by ID in the hierarchical structure
  const findTaskById = (tasks: Task[], id: string): Task | null => {
    for (const task of tasks) {
      if (task.id === id) return task;
      if (task.subtasks && task.subtasks.length > 0) {
        const found = findTaskById(task.subtasks, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Calculate global progress considering only leaf tasks
  useEffect(() => {
    if (hierarchicalTasks.length === 0) return;
    
    // Helper function to get all leaf tasks
    const getLeafTasks = (tasks: Task[]): Task[] => {
      return tasks.reduce((acc, task) => {
        if (!task.subtasks || task.subtasks.length === 0) {
          acc.push(task);
        } else {
          acc.push(...getLeafTasks(task.subtasks));
        }
        return acc;
      }, [] as Task[]);
    };
    
    const leafTasks = getLeafTasks(hierarchicalTasks);
    
    if (leafTasks.length === 0) return;
    
    const totalTasks = leafTasks.length;
    let progressSum = 0;
    
    leafTasks.forEach(task => {
      progressSum += task.progress || 0;
    });
    
    const calculatedProgress = Math.round(progressSum / totalTasks);
    
    if (onProgressUpdate) {
      onProgressUpdate(calculatedProgress);
    }
  }, [hierarchicalTasks, onProgressUpdate]);

  // Google Sheets API interaction
  const fetchTasksFromGoogleSheets = useCallback(async () => {
    try {
      setLoading(true);
      // Construct the Google Sheets API URL with your API key and spreadsheet ID
      const apiKey = config.googleSheets.apiKey;
      const sheetId = config.googleSheets.tasksSheet.spreadsheetId;
      const range = config.googleSheets.tasksSheet.range; // Use range from config
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks from Google Sheets');
      }
      
      const data = await response.json();
      
      // Process the data from Google Sheets
      if (data && data.values && data.values.length > 0) {
        // Extract headers from the first row
        const headers = data.values[0];
        
        // Transform the raw data into Task objects
        const fetchedTasks: Task[] = data.values.slice(1).map((row: string[]) => {
          const task: Task = {
            id: row[0] || String(Math.random()),
            title: row[1] || 'Untitled Task',
            completed: row[3] === 'completed',
            startDate: row[4] ? row[4] : format(new Date(), 'yyyy-MM-dd'),
            dueDate: row[5] || undefined,
            assignee: row[6] || undefined,
            progress: row[3] === 'completed' ? 100 : row[3] === 'in_progress' ? 50 : 0,
            status: row[3] || 'not_started',
            category: row[7] || undefined,
            parentId: row[0].includes('.') ? row[0].split('.')[0] : undefined
          };
          
          return task;
        });
        
        setTasks(fetchedTasks);
        
        // Build hierarchical structure
        const hierarchical = buildHierarchy(fetchedTasks);
        setHierarchicalTasks(hierarchical);
        
        // Build Kanban columns
        setKanbanColumns(buildKanbanColumns(hierarchical));
        
        // Call onTasksLoaded callback if provided
        if (onTasksLoaded) {
          onTasksLoaded(fetchedTasks);
        }

        setIsGoogleSheetsInitialized(true);
      } else {
        // If no data is returned, set an empty array
        setTasks([]);
        setHierarchicalTasks([]);
        setKanbanColumns({
          not_started: [],
          in_progress: [],
          completed: [],
          pending: []
        });
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again later.');
      // Fallback to empty tasks array
      setTasks([]);
      setHierarchicalTasks([]);
    } finally {
      setLoading(false);
    }
  }, [buildHierarchy, buildKanbanColumns, onTasksLoaded]);
  
  // Update Google Sheets with changes
  const updateGoogleSheets = async (updatedTasks: Task[]) => {
    try {
      setIsSaving(true);
      
      // Convert tasks to the format expected by Google Sheets
      const values = updatedTasks.map(task => [
        task.id,
        task.title,
        '', // Placeholder for column C
        task.status,
        task.startDate,
        task.dueDate || '',
        task.assignee || '',
        task.category || ''
      ]);
      
      // Prepend header row
      values.unshift([
        'ID', 'Title', 'Description', 'Status', 'Start Date', 'Due Date', 'Assignee', 'Category'
      ]);
      
      // Construct the Google Sheets API URL
      const apiKey = config.googleSheets.apiKey;
      const sheetId = config.googleSheets.tasksSheet.spreadsheetId;
      const range = config.googleSheets.tasksSheet.range;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW&key=${apiKey}`;
      
      // Use the appropriate API endpoint to update values
      // Note: In a real application, you would need proper OAuth2 authentication
      // This is a simplified example that assumes the sheet is publicly editable
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          values
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update Google Sheets');
      }
      
      toast({
        title: "Changes saved",
        description: "Your changes have been synchronized with Google Sheets.",
      });
      
    } catch (error) {
      console.error('Error updating Google Sheets:', error);
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: "Could not save changes to Google Sheets. Please try again later.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchTasksFromGoogleSheets();
    
    // Set up polling for real-time updates (every 60 seconds)
    const intervalId = setInterval(() => {
      if (!isSaving) { // Only poll if not in the middle of saving
        fetchTasksFromGoogleSheets();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchTasksFromGoogleSheets, isSaving]);

  // Filter tasks based on the selected filter
  const applyFilters = useCallback((taskList: Task[]) => {
    if (!filter) return taskList;
    
    // Helper function to check if a task or any of its subtasks match the filter
    const taskMatchesFilter = (task: Task): boolean => {
      const matchesDirectly = (() => {
        if (filter === 'all') return true;
        if (filter === 'completed') return task.completed || task.status === 'completed';
        if (filter === 'in_progress') return task.status === 'in_progress';
        if (filter === 'pending') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (!task.dueDate) return task.status === 'pending';
          try {
            const taskDueDate = parseISO(task.dueDate);
            return task.status === 'pending' || (isValid(taskDueDate) && isBefore(taskDueDate, today) && !task.completed);
          } catch (e) {
            return task.status === 'pending';
          }
        }
        return true;
      })();
      
      // If the task matches directly, return true
      if (matchesDirectly) return true;
      
      // If any subtask matches, return true
      if (task.subtasks && task.subtasks.length > 0) {
        for (const subtask of task.subtasks) {
          if (taskMatchesFilter(subtask)) return true;
        }
      }
      
      return false;
    };
    
    // Filter the task list recursively
    const filterTasksRecursive = (tasks: Task[]): Task[] => {
      return tasks
        .filter(taskMatchesFilter)
        .map(task => ({
          ...task,
          subtasks: task.subtasks ? filterTasksRecursive(task.subtasks) : []
        }));
    };
    
    return filterTasksRecursive(taskList);
  }, [filter]);

  // Apply filters to hierarchical tasks
  const filteredTasks = applyFilters(hierarchicalTasks);

  // Apply filters to kanban columns
  useEffect(() => {
    if (hierarchicalTasks.length > 0) {
      setKanbanColumns(buildKanbanColumns(filteredTasks));
    }
  }, [filteredTasks, buildKanbanColumns, hierarchicalTasks.length]);

  // Save task function with support for both new and existing tasks
  const handleSaveTask = () => {
    if (!taskToEdit) {
      console.error("Task to edit is null");
      return;
    }
    
    if (!taskToEdit.title) {
      toast({
        variant: "destructive",
        title: "Title is required",
        description: "Please provide a title for the task",
      });
      return;
    }

    setIsSaving(true);

    if (isEditDialogOpen) {
      // Helper function to update a task in the hierarchical structure
      const updateTaskInHierarchy = (tasks: Task[], taskId: string, updatedTask: Task): Task[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            return { ...updatedTask, subtasks: task.subtasks };
          }
          if (task.subtasks && task.subtasks.length > 0) {
            return {
              ...task,
              subtasks: updateTaskInHierarchy(task.subtasks, taskId, updatedTask)
            };
          }
          return task;
        });
      };

      // Update task in hierarchical structure
      const updatedHierarchy = updateTaskInHierarchy(hierarchicalTasks, taskToEdit.id, taskToEdit);
      setHierarchicalTasks(updatedHierarchy);
      
      // Also update the flat list for other operations
      const updatedTasks = tasks.map(task => 
        task.id === taskToEdit.id ? taskToEdit : task
      );
      setTasks(updatedTasks);
      
      // Sync with Google Sheets
      if (isGoogleSheetsInitialized) {
        updateGoogleSheets(updatedTasks);
      }
      
      toast({
        title: "Task updated",
        description: taskToEdit.title,
      });
      setIsEditDialogOpen(false);
    } else {
      // Generate new ID based on parent selection
      let newId = String(hierarchicalTasks.length + 1);
      
      // If a parent is selected, use parent.id + '.' + (number of existing subtasks + 1)
      if (taskToEdit.parentId) {
        const parent = findTaskById(hierarchicalTasks, taskToEdit.parentId);
        if (parent) {
          const subtaskCount = parent.subtasks ? parent.subtasks.length : 0;
          newId = `${parent.id}.${subtaskCount + 1}`;
        }
      }
      
      // Create new task
      const newTask: Task = {
        ...taskToEdit,
        id: newId,
        completed: false,
        startDate: taskToEdit.startDate || format(new Date(), 'yyyy-MM-dd'),
        progress: taskToEdit.progress || 0,
        status: taskToEdit.status || 'not_started',
      };
      
      // Helper function to add a task to the hierarchy
      const addTaskToHierarchy = (tasks: Task[], parentId: string | undefined, task: Task): Task[] => {
        if (!parentId) {
          // Add as root task
          return [...tasks, task];
        }
        
        return tasks.map(existingTask => {
          if (existingTask.id === parentId) {
            return {
              ...existingTask,
              subtasks: [...(existingTask.subtasks || []), task]
            };
          }
          if (existingTask.subtasks && existingTask.subtasks.length > 0) {
            return {
              ...existingTask,
              subtasks: addTaskToHierarchy(existingTask.subtasks, parentId, task)
            };
          }
          return existingTask;
        });
      };
      
      // Add task to hierarchy
      const updatedHierarchy = addTaskToHierarchy(hierarchicalTasks, newTask.parentId, newTask);
      setHierarchicalTasks(updatedHierarchy);
      
      // Also update the flat list
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      
      // Sync with Google Sheets
      if (isGoogleSheetsInitialized) {
        updateGoogleSheets(updatedTasks);
      }
      
      toast({
        title: "Task added",
        description: newTask.title,
      });
      setIsAddDialogOpen(false);
    }
    
    setTaskToEdit(null);
    setStartDate(new Date());
    setDueDate(undefined);
    setIsSaving(false);
  };

  // Delete task
  const handleDelete = () => {
    if (!taskToDelete) return;
    
    // Save the task before deleting it
    setLastDeletedTask(taskToDelete);
    
    setIsSaving(true);
    
    // Helper function to remove a task from the hierarchy
    const removeTaskFromHierarchy = (tasks: Task[], taskId: string): Task[] => {
      return tasks.filter(task => task.id !== taskId)
        .map(task => ({
          ...task,
          subtasks: task.subtasks ? removeTaskFromHierarchy(task.subtasks, taskId) : []
        }));
    };
    
    // Remove task from hierarchy
    const updatedHierarchy = removeTaskFromHierarchy(hierarchicalTasks, taskToDelete.id);
    setHierarchicalTasks(updatedHierarchy);
    
    // Also update the flat list
    const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
    setTasks(updatedTasks);
    
    // Sync with Google Sheets
    if (isGoogleSheetsInitialized) {
      updateGoogleSheets(updatedTasks);
    }
    
    toast({
      title: "Task deleted",
      description: taskToDelete.title,
      action: (
        <Button variant="outline" onClick={handleUndoDelete}>
          Undo
        </Button>
      ),
    });
    
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
    setIsSaving(false);
  };

  // Undo delete
  const handleUndoDelete = () => {
    if (!lastDeletedTask) return;
    
    setIsSaving(true);
    
    // Helper function to add a task back to the hierarchy
    const addTaskToHierarchy = (tasks: Task[], task: Task): Task[] => {
      if (!task.parentId) {
        return [...tasks, task];
      }
      
      return tasks.map(existingTask => {
        if (existingTask.id === task.parentId) {
          return {
            ...existingTask,
            subtasks: [...(existingTask.subtasks || []), task]
          };
        }
        if (existingTask.subtasks && existingTask.subtasks.length > 0) {
          return {
            ...existingTask,
            subtasks: addTaskToHierarchy(existingTask.subtasks, task)
          };
        }
        return existingTask;
      });
    };
    
    // Add task back to hierarchy
    const updatedHierarchy = addTaskToHierarchy(hierarchicalTasks, lastDeletedTask);
    setHierarchicalTasks(updatedHierarchy);
    
    // Also update the flat list
    const updatedTasks = [...tasks, lastDeletedTask];
    setTasks(updatedTasks);
    
    // Sync with Google Sheets
    if (isGoogleSheetsInitialized) {
      updateGoogleSheets(updatedTasks);
    }
    
    toast({
      title: "Task restored",
      description: lastDeletedTask.title,
    });
    
    setLastDeletedTask(null);
    setIsSaving(false);
  };

  // Batch operations
  const handleBatchOperation = () => {
    if (selectedBatchItems.length === 0) {
      toast({
        variant: "destructive",
        title: "No tasks selected",
        description: "Please select at least one task to perform batch operations.",
      });
      return;
    }
    
    setIsSaving(true);
    
    // Helper function to update tasks in the hierarchy
    const updateTasksInHierarchy = (tasks: Task[], taskIds: string[], updateFn: (task: Task) => Task): Task[] => {
      return tasks.map(task => {
        // Apply update if this task is in the selected list
        if (taskIds.includes(task.id)) {
          return updateFn(task);
        }
        
        // Recursively update subtasks
        if (task.subtasks && task.subtasks.length > 0) {
          return {
            ...task,
            subtasks: updateTasksInHierarchy(task.subtasks, taskIds, updateFn)
          };
        }
        
        return task;
      });
    };
    
    // Create update function based on batch action
    const updateFunction = (task: Task): Task => {
      switch (batchAction) {
        case 'status':
          return { 
            ...task, 
            status: batchValue,
            completed: batchValue === 'completed',
            progress: batchValue === 'completed' ? 100 : batchValue === 'in_progress' ? 50 : 0
          };
        case 'assignee':
          return { ...task, assignee: batchValue };
        case 'category':
          return { ...task, category: batchValue };
        default:
          return task;
      }
    };
    
    // Update tasks in hierarchy
    const updatedHierarchy = updateTasksInHierarchy(hierarchicalTasks, selectedBatchItems, updateFunction);
    setHierarchicalTasks(updatedHierarchy);
    
    // Also update the flat list
    const updatedTasks = tasks.map(task => 
      selectedBatchItems.includes(task.id) ? updateFunction(task) : task
    );
    setTasks(updatedTasks);
    
    // Sync with Google Sheets
    if (isGoogleSheetsInitialized) {
      updateGoogleSheets(updatedTasks);
    }
    
    toast({
      title: "Batch update complete",
      description: `Updated ${selectedBatchItems.length} tasks.`,
    });
    
    setIsBatchDialogOpen(false);
    setSelectedBatchItems([]);
    setBatchAction('status');
    setBatchValue('');
    setIsSaving(false);
  };

  // Helper function for safe date formatting
  const formatDateSafely = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return '';
      return format(date, 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  // Helper function to check if a task is overdue
  const isTaskOverdue = (task: Task) => {
    if (!task.dueDate || task.completed || task.status === 'completed') return false;
    
    try {
      const dueDate = parseISO(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return isValid(dueDate) && isBefore(dueDate, today);
    } catch (e) {
      return false;
    }
  };

  // Helper function to check if a task is due soon (within 3 days)
  const isTaskDueSoon = (task: Task) => {
    if (!task.dueDate || task.completed || task.status === 'completed') return false;
    
    try {
      const dueDate = parseISO(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const threeDaysFromNow = addDays(today, 3);
      
      return isValid(dueDate) && 
             !isBefore(dueDate, today) && 
             isBefore(dueDate, threeDaysFromNow);
    } catch (e) {
      return false;
    }
  };

  // Render individual task item
  const renderTaskItem = (task: Task, depth = 0) => {
    const isOverdue = isTaskOverdue(task);
    const isDueSoon = isTaskDueSoon(task);
    
    return (
      <div key={task.id} className="mb-2">
        <div 
          className={cn(
            "p-3 border rounded-lg flex items-center justify-between group transition-colors",
            task.completed && "bg-muted",
            task.isPhase && "border-primary-400 bg-primary-50 dark:bg-primary-950",
            isOverdue && !task.completed && "border-destructive border-l-4",
            isDueSoon && !task.completed && !isOverdue && "border-orange-400 border-l-4",
            depth > 0 && `ml-${depth * 4}`
          )}
        >
          <div className="flex items-center gap-3 flex-1">
            {!task.isPhase && (
              <Checkbox 
                checked={task.completed} 
                onCheckedChange={(checked) => {
                  // Helper function to update task and its subtasks
                  const updateTaskAndSubtasks = (taskToUpdate: Task, isCompleted: boolean): Task => {
                    return {
                      ...taskToUpdate,
                      completed: isCompleted,
                      status: isCompleted ? 'completed' : 'in_progress',
                      progress: isCompleted ? 100 : 50,
                      subtasks: taskToUpdate.subtasks 
                        ? taskToUpdate.subtasks.map(st => updateTaskAndSubtasks(st, isCompleted))
                        : []
                    };
                  };

                  // Update the hierarchical structure
                  const updatedHierarchy = hierarchicalTasks.map(t => 
                    t.id === task.id 
                      ? updateTaskAndSubtasks(t, !!checked)
                      : t.subtasks && t.subtasks.some(st => st.id === task.id)
                        ? { ...t, subtasks: t.subtasks.map(st => st.id === task.id ? updateTaskAndSubtasks(st, !!checked) : st) }
                        : t
                  );
                  
                  setHierarchicalTasks(updatedHierarchy);
                  
                  // Also update the flat list
                  const updatedTasks = tasks.map(t => 
                    t.id === task.id 
                      ? { ...t, completed: !!checked, status: !!checked ? 'completed' : 'in_progress', progress: !!checked ? 100 : 50 }
                      : t
                  );
                  setTasks(updatedTasks);
                  
                  // Sync with Google Sheets
                  if (isGoogleSheetsInitialized) {
                    updateGoogleSheets(updatedTasks);
                  }
                  
                  toast({
                    title: checked ? "Task completed" : "Task marked as incomplete",
                    description: task.title,
                  });
                }}
              />
            )}
            <div className="flex-1">
              <div className="flex items-center">
                <p className={cn(
                  "font-medium flex items-center",
                  task.completed && "line-through text-muted-foreground",
                  task.isPhase && "text-lg"
                )}>
                  {task.isPhase && <Badge variant="outline" className="mr-2">{task.id}</Badge>}
                  {task.title}
                  {isOverdue && !task.completed && (
                    <Badge variant="destructive" className="ml-2">Overdue</Badge>
                  )}
                  {isDueSoon && !task.completed && !isOverdue && (
                    <Badge variant="outline" className="ml-2 border-orange-400 text-orange-500">Due soon</Badge>
                  )}
                </p>
              </div>
              <div className="flex items-center flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                {task.dueDate && (
                  <span className={cn(
                    "flex items-center gap-1",
                    isOverdue && !task.completed && "text-destructive font-medium"
                  )}>
                    <Calendar size={12} />
                    {formatDateSafely(task.dueDate)}
                  </span>
                )}
                {task.assignee && (
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {task.assignee}
                  </span>
                )}
                {task.category && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {task.category}
                  </Badge>
                )}
                <span className="flex items-center gap-1">
                  <ListTodo size={12} />
                  {task.progress}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center">
              {/* Batch selection checkbox */}
              <Checkbox 
                className="mx-2"
                checked={selectedBatchItems.includes(task.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBatchItems(prev => [...prev, task.id]);
                  } else {
                    setSelectedBatchItems(prev => prev.filter(id => id !== task.id));
                  }
                }}
              />
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setTaskToEdit(task);
                    setStartDate(task.startDate ? parseISO(task.startDate) : new Date());
                    setDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setTaskToDelete(task);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Render subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className={cn("pl-4 mt-2 space-y-2", depth > 0 && `ml-${depth * 4}`)}>
            {task.subtasks.map(subtask => renderTaskItem(subtask, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Render task in Kanban view
  const renderKanbanTask = (task: Task) => {
    const isOverdue = isTaskOverdue(task);
    const isDueSoon = isTaskDueSoon(task);
    
    return (
      <div 
        key={task.id} 
        className={cn(
          "p-3 border rounded-lg mb-2 group hover:shadow-md transition-all",
          task.completed && "bg-muted",
          isOverdue && !task.completed && "border-destructive border-l-4",
          isDueSoon && !task.completed && !isOverdue && "border-orange-400 border-l-4"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {task.isPhase && <Badge variant="outline" className="mr-2">{task.id}</Badge>}
            <h4 className={cn(
              "font-medium",
              task.completed && "line-through text-muted-foreground"
            )}>
              {task.title}
            </h4>
          </div>
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setTaskToEdit(task);
                setStartDate(task.startDate ? parseISO(task.startDate) : new Date());
                setDueDate(task.dueDate ? parseISO(task.dueDate) : undefined);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit size={14} />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {task.dueDate && (
            <span className={cn(
              "text-xs flex items-center gap-1",
              isOverdue && !task.completed && "text-destructive font-medium"
            )}>
              <Calendar size={10} />
              {formatDateSafely(task.dueDate)}
            </span>
          )}
          {task.assignee && (
            <span className="text-xs flex items-center gap-1 text-muted-foreground">
              <User size={10} />
              {task.assignee}
            </span>
          )}
        </div>
        
        {task.category && (
          <Badge variant="secondary" className="mt-2 text-xs font-normal">
            {task.category}
          </Badge>
        )}
        
        <div className="mt-2 pt-2 border-t flex justify-between items-center">
          <span className="text-xs text-muted-foreground">ID: {task.id}</span>
          <span className="text-xs font-medium">{task.progress}%</span>
        </div>
      </div>
    );
  };

  // Render Calendar view (simplified)
  const renderCalendarView = () => {
    return (
      <div className="border rounded-md p-4 bg-card text-card-foreground">
        <div className="text-center">
          <h3 className="text-lg font-medium">Calendar View</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Calendar view is coming soon. For now, please use the List or Kanban view.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <div className="flex items-center gap-2">
          {selectedBatchItems.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setIsBatchDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Copy size={14} />
              Batch Actions ({selectedBatchItems.length})
            </Button>
          )}
          <Button onClick={() => {
            setTaskToEdit({
              id: '',
              title: '',
              completed: false,
              startDate: format(new Date(), 'yyyy-MM-dd'),
              progress: 0,
              status: 'not_started',
              parentId: undefined,
            });
            setStartDate(new Date());
            setDueDate(undefined);
            setIsAddDialogOpen(true);
          }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>
      
      {loading && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Loading tasks...</p>
        </div>
      )}
      
      {!loading && error && (
        <div className="py-8 text-center">
          <p className="text-destructive">{error}</p>
        </div>
      )}
      
      {!loading && !error && filteredTasks.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No tasks found. Add your first task using the button above.</p>
        </div>
      )}
      
      {!loading && !error && filteredTasks.length > 0 && (
        <>
          {view === 'list' && (
            <div className="space-y-2">
              {filteredTasks.map(task => renderTaskItem(task))}
            </div>
          )}
          
          {view === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(kanbanColumns).map(([status, columnTasks]) => (
                <div key={status} className="space-y-2">
                  <div className="bg-accent/30 p-3 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center justify-between">
                      {status === 'not_started' && 'Not Started'}
                      {status === 'in_progress' && 'In Progress'}
                      {status === 'completed' && 'Completed'}
                      {status === 'pending' && 'Pending'}
                      <Badge variant="outline">{columnTasks.length}</Badge>
                    </h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto p-1">
                      {columnTasks.map(renderKanbanTask)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {view === 'calendar' && renderCalendarView()}
        </>
      )}

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="parent">Parent Task</Label>
              <Select
                value={taskToEdit?.parentId || ''}
                onValueChange={(value) => setTaskToEdit(prev => prev ? { ...prev, parentId: value || undefined } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent task (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No parent (top level)</SelectItem>
                  {tasks.filter(t => !t.parentId).map(task => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.id}: {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={taskToEdit?.title || ''}
                onChange={(e) => setTaskToEdit(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: fr }) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setTaskToEdit(prev => prev ? { ...prev, startDate: date ? format(date, 'yyyy-MM-dd') : '' } : null);
                      setIsStartDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP', { locale: fr }) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setTaskToEdit(prev => prev ? { ...prev, dueDate: date ? format(date, 'yyyy-MM-dd') : undefined } : null);
                      setIsDueDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Input
                id="assignee"
                placeholder="Who is responsible for this task?"
                value={taskToEdit?.assignee || ''}
                onChange={(e) => setTaskToEdit(prev => prev ? { ...prev, assignee: e.target.value } : null)}
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label htmlFor="progress">Progress</Label>
                <span className="text-sm text-muted-foreground">{taskToEdit?.progress || 0}%</span>
              </div>
              <Slider
                id="progress"
                min={0}
                max={100}
                step={5}
                value={[taskToEdit?.progress || 0]}
                onValueChange={(value) => setTaskToEdit(prev => prev ? { ...prev, progress: value[0] } : null)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={taskToEdit?.status || 'not_started'}
                onValueChange={(value) => setTaskToEdit(prev => prev ? { ...prev, status: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="Category (e.g., Documentation, Planning)"
                value={taskToEdit?.category || ''}
                onChange={(e) => setTaskToEdit(prev => prev ? { ...prev, category: e.target.value } : null)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                setTaskToEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTask} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Enter task title"
                value={taskToEdit?.title || ''}
                onChange={(e) => setTaskToEdit(prev => prev ? { ...prev, title: e.target.value } : null)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: fr }) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setTaskToEdit(prev => prev ? { ...prev, startDate: date ? format(date, 'yyyy-MM-dd') : '' } : null);
                      setIsStartDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP', { locale: fr }) : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setTaskToEdit(prev => prev ? { ...prev, dueDate: date ? format(date, 'yyyy-MM-dd') : undefined } : null);
                      setIsDueDateOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-assignee">Assignee</Label>
              <Input
                id="edit-assignee"
                placeholder="Who is responsible for this task?"
                value={taskToEdit?.assignee || ''}
                onChange={(e) => setTaskToEdit(prev => prev ? { ...prev, assignee: e.target.value } : null)}
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between">
                <Label htmlFor="edit-progress">Progress</Label>
                <span className="text-sm text-muted-foreground">{taskToEdit?.progress || 0}%</span>
              </div>
              <Slider
                id="edit-progress"
                min={0}
                max={100}
                step={5}
                value={[taskToEdit?.progress || 0]}
                onValueChange={(value) => setTaskToEdit(prev => prev ? { ...prev, progress: value[0] } : null)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={taskToEdit?.status || 'not_started'}
                onValueChange={(value) => setTaskToEdit(prev => prev ? { ...prev, status: value } : null)}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                placeholder="Category (e.g., Documentation, Planning)"
                value={taskToEdit?.category || ''}
                onChange={(e) => setTaskToEdit(prev => prev ? { ...prev, category: e.target.value } : null)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEditDialogOpen(false);
                setTaskToEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTask} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {taskToDelete && (
            <div className="py-4">
              <div className="p-3 rounded-md border bg-muted/50">
                <h4 className="font-medium">{taskToDelete.title}</h4>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {taskToDelete.category && (
                    <span>{taskToDelete.category}</span>
                  )}
                  {taskToDelete.assignee && (
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {taskToDelete.assignee}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Batch Action Dialog */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Batch Actions</DialogTitle>
            <DialogDescription>
              Apply changes to {selectedBatchItems.length} selected tasks.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="batch-action">Action</Label>
              <Select
                value={batchAction}
                onValueChange={setBatchAction}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="status">Change Status</SelectItem>
                  <SelectItem value="assignee">Change Assignee</SelectItem>
                  <SelectItem value="category">Change Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {batchAction === 'status' && (
              <div className="grid gap-2">
                <Label htmlFor="batch-status">Status</Label>
                <Select
                  value={batchValue}
                  onValueChange={setBatchValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {batchAction === 'assignee' && (
              <div className="grid gap-2">
                <Label htmlFor="batch-assignee">Assignee</Label>
                <Input
                  id="batch-assignee"
                  placeholder="Assignee name"
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                />
              </div>
            )}
            
            {batchAction === 'category' && (
              <div className="grid gap-2">
                <Label htmlFor="batch-category">Category</Label>
                <Input
                  id="batch-category"
                  placeholder="Category name"
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsBatchDialogOpen(false);
                setSelectedBatchItems([]);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBatchOperation}
              disabled={isSaving || !batchValue}
            >
              {isSaving ? 'Applying...' : 'Apply to Selected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
