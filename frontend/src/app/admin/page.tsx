'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, CheckCircle, Clock, Shield, UserX, ListTodo, ArrowLeft, Mail, Calendar, X } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface Stats {
  users: {
    total: number;
    admins: number;
    regularUsers: number;
    recentSignups: number;
  };
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  overview: {
    totalUsers: number;
    totalTasks: number;
    completionRate: string;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to access this page',
        variant: 'destructive',
      });
    }
  }, [user, loading, router, toast]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user, searchTerm, roleFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [usersData, statsData] = await Promise.all([
        adminApi.getUsers({ 
          search: searchTerm || undefined, 
          role: roleFilter !== 'all' ? roleFilter : undefined 
        }),
        adminApi.getStats(),
      ]);

      setUsers(usersData.data);
      setStats(statsData.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      toast({
        title: 'Success',
        description: `User role updated to ${newRole}`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This will delete the user and all their tasks.')) {
      return;
    }

    try {
      await adminApi.deleteUser(userId);
      toast({
        title: 'Success',
        description: 'User deleted successfully',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleViewUserTasks = async (userId: string) => {
    try {
      setLoadingTasks(true);
      setSelectedUserId(userId);
      const response = await adminApi.getTasksByUser(userId);
      setUserTasks(response.data.tasks);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch user tasks',
        variant: 'destructive',
      });
    } finally {
      setLoadingTasks(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">Manage users and monitor platform activity</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.total}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.users.recentSignups} new this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tasks.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.overview.completionRate}% completion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tasks.pending}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.tasks.inProgress} in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users.admins}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.users.regularUsers} regular users
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management - Card View */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Click on any user card to view their todos</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex gap-4 mb-6">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Cards Grid */}
            {isLoading ? (
              <p className="text-center py-8">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-center py-8">No users found</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((u) => (
                  <Card 
                    key={u._id}
                    className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
                    onClick={() => handleViewUserTasks(u._id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{u.name}</CardTitle>
                            <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="mt-1">
                              {u.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{u.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                        <Select
                          value={u.role}
                          onValueChange={(value) => handleRoleChange(u._id, value as 'user' | 'admin')}
                          disabled={u._id === user?._id}
                        >
                          <SelectTrigger className="flex-1 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(u._id);
                          }}
                          disabled={u._id === user?._id}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Tasks View */}
        {selectedUserId && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{users.find(u => u._id === selectedUserId)?.name}'s Todos</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3" />
                      {users.find(u => u._id === selectedUserId)?.email}
                    </CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedUserId(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingTasks ? (
                <p className="text-center py-8">Loading tasks...</p>
              ) : userTasks.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No tasks found for this user</p>
              ) : (
                <div className="space-y-4">
                  {userTasks.map((task) => (
                    <div key={task._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg">{task.title}</h3>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                        {task.dueDate && (
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
