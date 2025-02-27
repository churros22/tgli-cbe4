
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, Check, X, Calendar, User, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import config from '@/config';

// Mock task data until Google Sheets integration is complete
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

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: '1', 
      title: 'Réviser le protocole de validation', 
      completed: true,
      startDate: '2023-12-13',
      dueDate: '2023-12-20', 
      assignee: 'Marc Dupont',
      progress: 100,
      status: 'completed',
      category: 'Documentation',
      parentId: undefined
    },
    { 
      id: '2', 
      title: 'Préparer l\'équipement de test', 
      completed: false,
      startDate: '2023-12-15',
      dueDate: '2023-12-28', 
      assignee: 'Lucie Martin',
      progress: 40,
      status: 'in_progress',
      category: 'Préparation',
      parentId: undefined
    },
    { 
      id: '3', 
      title: 'Planifier réunion d\'équipe', 
      completed: false,
      startDate: '2023-12-20',
      dueDate: '2024-01-05',
      assignee: 'Thomas Bernard',
      progress: 10,
      status: 'pending',
      category: 'Planification',
      parentId: undefined
    },
    { 
      id: '4', 
      title: 'Mettre à jour l\'évaluation des risques', 
      completed: false,
      startDate: '2023-12-22',
      dueDate: '2024-01-10',
      assignee: 'Sophie Moreau',
      progress: 0,
      status: 'pending',
      category: 'Gestion des risques',
      parentId: undefined
    },
  ]);
  
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  const { toast } = useToast();

  const handleAddTaskClick = () => {
    const newTaskTemplate: Task = {
      id: '',
      title: '',
      completed: false,
      startDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
      assignee: '',
      progress: 0,
      status: 'pending',
      category: 'Nouvelle tâche',
      parentId: undefined
    };
    
    setCurrentTask(newTaskTemplate);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = () => {
    if (!currentTask) return;
    
    // Make sure the task has a title
    if (!currentTask.title.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la tâche est requis.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentTask.id) {
      // Update existing task
      setTasks(
        tasks.map(task => 
          task.id === currentTask.id ? { ...currentTask } : task
        )
      );
      
      toast({
        title: config.tasks.messages.updateSuccess,
        description: currentTask.title,
      });
    } else {
      // Add new task
      const newTaskWithId = {
        ...currentTask,
        id: Date.now().toString(),
      };
      
      setTasks([...tasks, newTaskWithId]);
      
      toast({
        title: config.tasks.messages.addSuccess,
        description: newTaskWithId.title,
      });
    }
    
    setIsTaskDialogOpen(false);
    setCurrentTask(null);
    setNewTask('');
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map(task => {
        if (task.id === id) {
          const completed = !task.completed;
          return { 
            ...task, 
            completed,
            status: completed ? 'completed' : 'in_progress',
            progress: completed ? 100 : task.progress
          };
        }
        return task;
      })
    );
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    
    toast({
      title: config.tasks.messages.deleteSuccess,
    });
  };

  const handleEdit = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setCurrentTask({ ...task });
      setIsTaskDialogOpen(true);
    }
  };

  // Filter tasks that can be parents (to avoid circular relationships)
  const getPossibleParentTasks = (taskId?: string) => {
    return tasks.filter(task => task.id !== taskId && !hasTaskAsAncestor(task.id, taskId));
  };

  // Check if a task has another task as an ancestor to prevent circular relationships
  const hasTaskAsAncestor = (taskId: string, possibleAncestorId?: string): boolean => {
    if (!possibleAncestorId) return false;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.parentId) return false;
    
    if (task.parentId === possibleAncestorId) return true;
    
    return hasTaskAsAncestor(task.parentId, possibleAncestorId);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Button 
          onClick={handleAddTaskClick}
          className="h-10 rounded-xl flex items-center gap-2"
        >
          <PlusCircle size={16} />
          <span>{config.tasks.labels.add}</span>
        </Button>
      </div>
      
      <div className="space-y-1">
        {tasks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">{config.tasks.labels.noTasks}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:bg-secondary/50 group",
                task.completed && "bg-secondary/30"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => handleToggleComplete(task.id)}
                  id={`task-${task.id}`}
                />
                <div className="flex-1">
                  <label 
                    htmlFor={`task-${task.id}`}
                    className={cn(
                      "font-medium cursor-pointer",
                      task.completed && "line-through text-muted-foreground"
                    )}
                  >
                    {task.title}
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {task.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {task.category}
                      </span>
                    )}
                    {task.status && (
                      <span className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        task.status === 'completed' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                        task.status === 'in_progress' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                        task.status === 'pending' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                      )}>
                        {config.tasks.statuses.find(s => s.id === task.status)?.label || task.status}
                      </span>
                    )}
                    {task.assignee && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <User size={12} />
                        {task.assignee}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                    {task.parentId && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <ListTodo size={12} />
                        Sous-tâche
                      </span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="w-full mt-2 bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full",
                        task.status === 'completed' ? "bg-green-500" : "bg-blue-500"
                      )}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEdit(task.id)}
                >
                  <Edit size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(task.id)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Add/Edit Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {currentTask?.id ? config.tasks.labels.edit : config.tasks.labels.add}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                {config.tasks.labels.title}
              </Label>
              <Input
                id="title"
                value={currentTask?.title || ''}
                onChange={(e) => setCurrentTask(prev => prev ? {...prev, title: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                {config.tasks.labels.startDate}
              </Label>
              <Input
                id="startDate"
                value={currentTask?.startDate || ''}
                disabled
                className="col-span-3 bg-muted"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dueDate" className="text-right">
                {config.tasks.labels.dueDate}
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {currentTask?.dueDate ? (
                        formatDate(currentTask.dueDate)
                      ) : (
                        <span className="text-muted-foreground">Sélectionner une date</span>
                      )}
                      <Calendar className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={currentTask?.dueDate ? new Date(currentTask.dueDate) : undefined}
                      onSelect={(date) => setCurrentTask(prev => prev ? {...prev, dueDate: date ? format(date, 'yyyy-MM-dd') : undefined} : null)}
                      disabled={(date) => date < new Date(currentTask?.startDate || '')}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignee" className="text-right">
                {config.tasks.labels.assignee}
              </Label>
              <Input
                id="assignee"
                value={currentTask?.assignee || ''}
                onChange={(e) => setCurrentTask(prev => prev ? {...prev, assignee: e.target.value} : null)}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                {config.tasks.labels.status}
              </Label>
              <Select 
                value={currentTask?.status || 'pending'}
                onValueChange={(value) => setCurrentTask(prev => {
                  if (!prev) return null;
                  const newState = {...prev, status: value};
                  // Update completed state based on status
                  if (value === 'completed') {
                    newState.completed = true;
                    newState.progress = 100;
                  } else if (prev.status === 'completed') {
                    newState.completed = false;
                  }
                  return newState;
                })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un état" />
                </SelectTrigger>
                <SelectContent>
                  {config.tasks.statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="progress" className="text-right">
                {config.tasks.labels.progress}
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                <Slider
                  value={[currentTask?.progress || 0]}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                  onValueChange={(value) => setCurrentTask(prev => {
                    if (!prev) return null;
                    const newProgress = value[0];
                    const newState = {...prev, progress: newProgress};
                    // Update status and completed based on progress
                    if (newProgress === 100) {
                      newState.status = 'completed';
                      newState.completed = true;
                    } else if (newProgress > 0 && prev.status === 'pending') {
                      newState.status = 'in_progress';
                    } else if (newProgress === 0 && prev.status === 'in_progress') {
                      newState.status = 'pending';
                    }
                    return newState;
                  })}
                />
                <span className="w-12 text-right">{currentTask?.progress || 0}%</span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                {config.tasks.labels.category}
              </Label>
              <Select 
                value={currentTask?.category}
                onValueChange={(value) => setCurrentTask(prev => prev ? {...prev, category: value} : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {config.tasks.defaultCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="parentTask" className="text-right">
                {config.tasks.labels.parentTask}
              </Label>
              <Select 
                value={currentTask?.parentId}
                onValueChange={(value) => setCurrentTask(prev => prev ? {...prev, parentId: value === "none" ? undefined : value} : null)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Aucune tâche parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune tâche parent</SelectItem>
                  {getPossibleParentTasks(currentTask?.id).map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
              {config.tasks.labels.cancel}
            </Button>
            <Button onClick={handleSaveTask}>
              {config.tasks.labels.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
