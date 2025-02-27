
import React, { useState } from 'react';
import { PlusCircle, Trash2, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock task data until Google Sheets integration is complete
interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  category?: string;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: '1', 
      title: 'Review validation protocol', 
      completed: true, 
      dueDate: '2023-12-20', 
      category: 'Documentation' 
    },
    { 
      id: '2', 
      title: 'Prepare test equipment', 
      completed: false, 
      dueDate: '2023-12-28', 
      category: 'Preparation' 
    },
    { 
      id: '3', 
      title: 'Schedule team meeting', 
      completed: false, 
      dueDate: '2024-01-05', 
      category: 'Planning' 
    },
    { 
      id: '4', 
      title: 'Update risk assessment', 
      completed: false, 
      dueDate: '2024-01-10', 
      category: 'Risk Management' 
    },
  ]);
  
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const { toast } = useToast();

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      completed: false,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      category: 'New Task'
    };
    
    setTasks([...tasks, task]);
    setNewTask('');
    
    toast({
      title: "Task added",
      description: "Your new task has been added to the list.",
    });
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    
    toast({
      title: "Task deleted",
      description: "The task has been removed from your list.",
    });
  };

  const handleEdit = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditingTask(id);
      setEditValue(task.title);
    }
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) return;
    
    setTasks(
      tasks.map(task => 
        task.id === id ? { ...task, title: editValue.trim() } : task
      )
    );
    
    setEditingTask(null);
    setEditValue('');
    
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditValue('');
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 h-10 rounded-xl"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <Button 
          onClick={handleAddTask}
          className="h-10 rounded-xl flex items-center gap-2"
          disabled={!newTask.trim()}
        >
          <PlusCircle size={16} />
          <span>Add Task</span>
        </Button>
      </div>
      
      <div className="space-y-1">
        {tasks.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No tasks yet. Add your first task above.</p>
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
              {editingTask === task.id ? (
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox 
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task.id)}
                    disabled
                  />
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1"
                    autoFocus
                  />
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleSaveEdit(task.id)}
                    >
                      <Check size={16} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={handleCancelEdit}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
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
                      <div className="flex items-center gap-2 mt-1">
                        {task.category && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                            {task.category}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
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
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
