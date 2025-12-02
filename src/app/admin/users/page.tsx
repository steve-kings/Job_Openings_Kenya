'use client'

import { useState } from 'react';
import { Search, UserCheck, UserX, Mail, Calendar } from 'lucide-react';

export default function AdminUsersPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Mock Data
    const users = [
        { id: 1, name: 'Jane Doe', email: 'jane@example.com', role: 'Student', coursesEnrolled: 3, progress: 65, joined: '2024-10-15', status: 'Active' },
        { id: 2, name: 'John Smith', email: 'john@example.com', role: 'Student', coursesEnrolled: 2, progress: 80, joined: '2024-11-01', status: 'Active' },
        { id: 3, name: 'Mary Johnson', email: 'mary@example.com', role: 'Student', coursesEnrolled: 4, progress: 45, joined: '2024-09-20', status: 'Active' },
        { id: 4, name: 'David Brown', email: 'david@example.com', role: 'Admin', coursesEnrolled: 0, progress: 0, joined: '2024-08-10', status: 'Active' },
        { id: 5, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Student', coursesEnrolled: 1, progress: 20, joined: '2024-11-12', status: 'Inactive' },
    ];

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'Active').length;
    const totalEnrollments = users.reduce((sum, u) => sum + u.coursesEnrolled, 0);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-primary mb-2">User Management</h1>
                <p className="text-gray-600">View and manage registered users and their learning progress</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                                <p className="text-3xl font-bold">{totalUsers}</p>
                            </div>
                            <UserCheck className="text-primary w-10 h-10" />
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Active Users</p>
                                <p className="text-3xl font-bold">{activeUsers}</p>
                            </div>
                            <UserCheck className="text-success w-10 h-10" />
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Total Enrollments</p>
                                <p className="text-3xl font-bold">{totalEnrollments}</p>
                            </div>
                            <Calendar className="text-accent w-10 h-10" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card bg-base-100 shadow-md mb-6">
                <div className="card-body">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="form-control flex-1">
                            <div className="input-group">
                                <span className="bg-base-200">
                                    <Search size={20} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    className="input input-bordered w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <select
                            className="select select-bordered w-full md:w-auto"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option>All</option>
                            <option>Active</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Courses</th>
                                    <th>Avg Progress</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="font-medium">{user.name}</td>
                                        <td className="text-sm flex items-center gap-2">
                                            <Mail size={14} className="text-gray-500" />
                                            {user.email}
                                        </td>
                                        <td>
                                            <span className={`badge badge-sm ${user.role === 'Admin' ? 'badge-primary' : 'badge-secondary'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="text-sm">{user.coursesEnrolled}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <progress
                                                    className="progress progress-primary w-20"
                                                    value={user.progress}
                                                    max="100"
                                                ></progress>
                                                <span className="text-xs">{user.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="text-sm text-gray-600">{user.joined}</td>
                                        <td>
                                            <span className={`badge badge-sm ${user.status === 'Active' ? 'badge-success' : 'badge-error'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No users found matching your criteria.</p>
                        </div>
                    )}

                    <div className="flex justify-between items-center mt-6">
                        <p className="text-sm text-gray-600">Showing {filteredUsers.length} of {totalUsers} users</p>
                        <div className="btn-group">
                            <button className="btn btn-sm">«</button>
                            <button className="btn btn-sm btn-active">1</button>
                            <button className="btn btn-sm">2</button>
                            <button className="btn btn-sm">»</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
