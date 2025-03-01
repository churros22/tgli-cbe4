
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, Check, X, Calendar, User, ListTodo, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
}

interface TaskListProps {
  filter: string | null;
  onProgressUpdate?: (progress: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ filter, onProgressUpdate }) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isDueDateOpen, setIsDueDateOpen] = useState(false);
  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);

  // Calculate global progress and send it to parent component
  useEffect(() => {
    if (tasks.length === 0) return;
    
    const totalTasks = tasks.length;
    let progressSum = 0;
    
    tasks.forEach(task => {
      progressSum += task.progress || 0;
    });
    
    const calculatedProgress = Math.round(progressSum / totalTasks);
    
    if (onProgressUpdate) {
      onProgressUpdate(calculatedProgress);
    }
  }, [tasks, onProgressUpdate]);

  useEffect(() => {
    const fetchTasksFromGoogleSheets = async () => {
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
          // Transform the raw data into Task objects
          const fetchedTasks: Task[] = data.values.slice(1).map((row: string[]) => ({
            id: row[0] || String(Math.random()),
            title: row[1] || 'Untitled Task',
            completed: row[3] === 'completed',
            startDate: row[4] ? row[4] : format(new Date(), 'yyyy-MM-dd'),
            dueDate: row[4] || undefined,
            assignee: row[5] || undefined,
            progress: row[3] === 'completed' ? 100 : row[3] === 'in_progress' ? 50 : 0, // Calculate progress based on status
            status: row[3] || 'not_started',
            category: row[6] || undefined,
            parentId: row[0].includes('.') ? row[0].split('.')[0] : undefined
          }));
          
          setTasks(fetchedTasks);
        } else {
          // If no data is returned, set an empty array
          setTasks([]);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError('Failed to load tasks. Please try again later.');
        // Fallback to empty tasks array
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTasksFromGoogleSheets();
  }, []);

  // Filter tasks based on the selected filter
  const filteredTasks = tasks.filter(task => {
    if (!filter) return true;
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed || task.status === 'completed';
    if (filter === 'in_progress') return task.status === 'in_progress';
    if (filter === 'pending') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (!task.dueDate) return task.status === 'pending';
      try {
        const taskDueDate = new Date(task.dueDate);
        return task.status === 'pending' || (isValid(taskDueDate) && taskDueDate < today && !task.completed);
      } catch (e) {
        return task.status === 'pending';
      }
    }
    return true;
  });

  // Fix this method to properly handle new task creation and updates
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

    if (isEditDialogOpen) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === taskToEdit.id ? taskToEdit : task
      );
      setTasks(updatedTasks);
      toast({
        title: "Task updated",
        description: taskToEdit.title,
      });
      setIsEditDialogOpen(false);
    } else {
      // Add new task
      const newTask: Task = {
        id: String(Date.now()),
        title: taskToEdit.title,
        completed: false,
        startDate: taskToEdit.startDate || format(new Date(), 'yyyy-MM-dd'),
        dueDate: taskToEdit.dueDate,
        assignee: taskToEdit.assignee,
        progress: taskToEdit.progress || 0,
        status: taskToEdit.status || 'not_started',
        category: taskToEdit.category,
      };
      
      setTasks([...tasks, newTask]);
      toast({
        title: "Task added",
        description: newTask.title,
      });
      setIsAddDialogOpen(false);
    }
    
    setTaskToEdit(null);
    setStartDate(new Date());
    setDueDate(undefined);
  };

  const handleDelete = () => {
    if (!taskToDelete) return;
    
    // Save the task before deleting it
    setLastDeletedTask(taskToDelete);
    
    const updatedTasks = tasks.filter(task => task.id !== taskToDelete.id);
    setTasks(updatedTasks);
    
    toast({
      title: "Task deleted",
      description: taskToDelete.title,
      action: (
        <Button variant="outline" onClick={handleUndoDelete}>
          Annuler
        </Button>
      ),
    });
    
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  // Add this method to restore the last deleted task
  const handleUndoDelete = () => {
    if (!lastDeletedTask) return;
    
    setTasks(prev => [...prev, lastDeletedTask]);
    
    toast({
      title: "Task restored",
      description: lastDeletedTask.title,
    });
    
    setLastDeletedTask(null);
  };

  // Helper function for safe date formatting
  const formatDateSafely = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return '';
      return format(date, 'dd/MM/yyyy', { locale: fr });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={() => {
          setTaskToEdit({
            id: '',
            title: '',
            completed: false,
            startDate: format(new Date(), 'yyyy-MM-dd'),
            progress: 0,
            status: 'not_started',
          });
          setStartDate(new Date());
          setDueDate(undefined);
          setIsAddDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
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
        <div className="space-y-2">
          {filteredTasks.map(task => (
            <div 
              key={task.id}
              className={cn(
                "p-3 border rounded-lg flex items-center justify-between group hover:bg-accent/50 transition-colors",
                task.completed && "bg-muted"
              )}
            >
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={task.completed} 
                  onCheckedChange={(checked) => {
                    const updatedTasks = tasks.map(t => 
                      t.id === task.id ? { ...t, completed: !!checked, status: !!checked ? 'completed' : t.status } : t
                    );
                    setTasks(updatedTasks);
                    toast({
                      title: checked ? "Task completed" : "Task marked as incomplete",
                      description: task.title,
                    });
                  }}
                />
                <div>
                  <p className={cn(
                    "font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
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
                    <span className="flex items-center gap-1">
                      <ListTodo size={12} />
                      {task.progress}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setTaskToEdit(task);
                    setStartDate(task.startDate ? new Date(task.startDate) : new Date());
                    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
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
          ))}
        </div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
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
            <Button onClick={handleSaveTask}>
              Save
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
            <Button onClick={handleSaveTask}>
              Save
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
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
