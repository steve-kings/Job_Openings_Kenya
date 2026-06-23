'use client'

import { useState, useEffect } from 'react';
import { createAdminUser, getAdminUsers, updateAdminUser, deleteAdminUser, resetAdminPassword } from '@/app/actions/admin';
import { Settings, UserPlus, Mail, User, Shield, CheckCircle, AlertCircle, Edit, Trash2, Key } from 'lucide-react';

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: string;
    created_at: string;
}

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [fetchingUsers, setFetchingUsers] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);
    const [newPassword, setNewPassword] = useState('');
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: ''
    });

    const [editFormData, setEditFormData] = useState({
        full_name: '',
        email: ''
    });

    useEffect(() => {
        fetchAdminUsers();
    }, []);

    const fetchAdminUsers = async () => {
        setFetchingUsers(true);
        const result = await getAdminUsers();
        if (result.success) {
            setAdminUsers(result.data);
        }
        setFetchingUsers(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const result = await createAdminUser(
                formData.email,
                formData.password,
                formData.full_name
            );

            if (result.success) {
                setMessage({ 
                    type: 'success', 
                    text: result.message 
                });
                
                // Reset form
                setFormData({ email: '', password: '', full_name: '' });
                
                // Refresh admin users list
                fetchAdminUsers();
            } else {
                setMessage({ 
                    type: 'error', 
                    text: result.message 
                });
            }
        } catch (error: unknown) {
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'Failed to create admin user. Please try again.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user: AdminUser) => {
        setEditingUser(user);
        setEditFormData({
            full_name: user.full_name,
            email: user.email
        });
        setMessage(null);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setLoading(true);
        setMessage(null);

        try {
            const result = await updateAdminUser(
                editingUser.id,
                editFormData.full_name,
                editFormData.email
            );

            if (result.success) {
                setMessage({ 
                    type: 'success', 
                    text: result.message 
                });
                setEditingUser(null);
                fetchAdminUsers();
            } else {
                setMessage({ 
                    type: 'error', 
                    text: result.message 
                });
            }
        } catch (error: unknown) {
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'Failed to update admin user.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (user: AdminUser) => {
        if (!confirm(`Are you sure you want to delete admin user "${user.full_name}" (${user.email})? This action cannot be undone.`)) {
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const result = await deleteAdminUser(user.id);

            if (result.success) {
                setMessage({ 
                    type: 'success', 
                    text: result.message 
                });
                fetchAdminUsers();
            } else {
                setMessage({ 
                    type: 'error', 
                    text: result.message 
                });
            }
        } catch (error: unknown) {
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'Failed to delete admin user.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetPasswordUser) return;

        setLoading(true);
        setMessage(null);

        try {
            const result = await resetAdminPassword(resetPasswordUser.id, newPassword);

            if (result.success) {
                setMessage({ 
                    type: 'success', 
                    text: result.message 
                });
                setResetPasswordUser(null);
                setNewPassword('');
            } else {
                setMessage({ 
                    type: 'error', 
                    text: result.message 
                });
            }
        } catch (error: unknown) {
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'Failed to reset password.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#5CB800]/10 rounded-xl">
                        <Settings className="text-[#5CB800]" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Admin Settings</h1>
                        <p className="text-gray-600 mt-1">Manage admin users and system configuration</p>
                    </div>
                </div>
            </div>

            {/* Global Message */}
            {message && (
                <div className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-semibold">{message.text}</span>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Add Admin User Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-[#5CB800]">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-[#5CB800]/10 rounded-xl">
                                    <UserPlus className="text-[#5CB800]" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Add Admin</h2>
                                    <p className="text-gray-600 text-sm">Create new admin account</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        <span>Full Name</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-9 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#5CB800] focus:outline-none focus:ring-1 focus:ring-[#5CB800]"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        <span>Email</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-9 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#5CB800] focus:outline-none focus:ring-1 focus:ring-[#5CB800]"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="admin@Job Openings Kenya.org"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        <span>Password</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="w-full pl-9 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#5CB800] focus:outline-none focus:ring-1 focus:ring-[#5CB800]"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Min. 6 characters"
                                        />
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-[#5CB800] hover:bg-[#4A9900] text-white font-semibold text-sm transition-colors" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus size={16} />
                                            Create Admin
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Admin Users List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm border-t-4 border-t-[#5CB800]">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Users</h2>

                            {fetchingUsers ? (
                                <div className="text-center py-8">
                                    <div className="w-6 h-6 border-4 border-[#5CB800] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-gray-600 mt-2">Loading admin users...</p>
                                </div>
                            ) : adminUsers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <User className="mx-auto mb-2 opacity-30" size={40} />
                                    <p>No admin users found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Created</th>
                                                <th className="text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {adminUsers.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="font-semibold">{user.full_name}</td>
                                                    <td className="text-sm text-gray-600">{user.email}</td>
                                                    <td className="text-sm text-gray-500">
                                                        {new Date(user.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td>
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleEdit(user)}
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setResetPasswordUser(user);
                                                                    setNewPassword('');
                                                                }}
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                                                                title="Reset Password"
                                                            >
                                                                <Key size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user)}
                                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                                                title="Delete"
                                                                disabled={loading}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="font-bold text-lg mb-4">Edit Admin User</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">
                                    <span>Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#5CB800] focus:outline-none focus:ring-1 focus:ring-[#5CB800]"
                                    value={editFormData.full_name}
                                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">
                                    <span>Email</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#5CB800] focus:outline-none focus:ring-1 focus:ring-[#5CB800]"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors"
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#5CB800] hover:bg-[#4A9900] text-white font-semibold text-sm transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetPasswordUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="font-bold text-lg mb-4">Reset Password</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Reset password for <strong>{resetPasswordUser.full_name}</strong> ({resetPasswordUser.email})
                        </p>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-semibold text-gray-700">
                                    <span>New Password</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-[#5CB800] focus:outline-none focus:ring-1 focus:ring-[#5CB800]"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min. 6 characters)"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded-lg text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors"
                                    onClick={() => {
                                        setResetPasswordUser(null);
                                        setNewPassword('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#5CB800] hover:bg-[#D68910] text-white font-semibold text-sm transition-colors disabled:opacity-50"
                                    disabled={loading}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
