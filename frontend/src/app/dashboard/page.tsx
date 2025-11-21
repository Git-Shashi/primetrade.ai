'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { TaskList } from '@/components/TaskList';
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { LogOut, Plus, ListTodo, Shield } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchStats();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data.tasks);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/tasks/stats');
      setStats(response.data.data.stats);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to fetch statistics',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleTaskCreated = () => {
    fetchTasks();
    fetchStats();
    setIsCreateOpen(false);
  };

  const handleTaskUpdated = () => {
    fetchTasks();
    fetchStats();
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ListTodo className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Todo App</h1>
              <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user.role === 'admin' && (
              <Button variant="outline" onClick={() => router.push('/admin')}>
                <Shield className="mr-2 h-4 w-4" />
                Admin Panel
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.byStatus?.pending || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.byStatus?.['in-progress'] || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.byStatus?.completed || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{tasks.length}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tasks Section */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>Manage your tasks</CardDescription>
              </div>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <p>Loading tasks...</p>
            ) : (
              <TaskList tasks={tasks} onTaskUpdated={handleTaskUpdated} />
            )}
          </CardContent>
        </Card>
      </main>

      <CreateTaskDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
