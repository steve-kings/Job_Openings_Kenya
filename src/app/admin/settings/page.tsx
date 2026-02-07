'use client'

import { useState, useEffect } from 'react';
import { createAdminUser, getAdminUsers, updateAdminUser, deleteAdminUser, resetAdminPassword } from '@/app/actions/admin';
import { Settings, UserPlus, Mail, User, Shield, CheckCircle, AlertCircle, Edit, Trash2, Key, X } from 'lucide-react';

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
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to create admin user. Please try again.' 
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
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to update admin user.' 
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
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to delete admin user.' 
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
        } catch (error: any) {
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to reset password.' 
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
                    <div className="p-3 bg-[#C44536]/10 rounded-xl">
                        <Settings className="text-[#C44536]" size={32} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Admin Settings</h1>
                        <p className="text-gray-600 mt-1">Manage admin users and system configuration</p>
                    </div>
                </div>
            </div>

            {/* Global Message */}
            {message && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{message.text}</span>
                </div>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Add Admin User Form */}
                <div className="lg:col-span-1">
                    <div className="card bg-white shadow-xl border-l-4 border-[#C44536]">
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-[#C44536]/10 rounded-xl">
                                    <UserPlus className="text-[#C44536]" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Add Admin</h2>
                                    <p className="text-gray-600 text-sm">Create new admin account</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700 text-sm">Full Name</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            className="input input-sm input-bordered w-full pl-9 focus:border-[#C44536] focus:outline-none"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700 text-sm">Email</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            className="input input-sm input-bordered w-full pl-9 focus:border-[#C44536] focus:outline-none"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="admin@yena.org"
                                        />
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text font-semibold text-gray-700 text-sm">Password</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="input input-sm input-bordered w-full pl-9 focus:border-[#C44536] focus:outline-none"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Min. 6 characters"
                                        />
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    className="btn btn-sm bg-[#C44536] hover:bg-[#8B3A3A] text-white border-none w-full gap-2" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="loading loading-spinner loading-xs"></span>
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
                    <div className="card bg-white shadow-xl border-t-4 border-[#F39C12]">
                        <div className="card-body">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Users</h2>

                            {fetchingUsers ? (
                                <div className="text-center py-8">
                                    <span className="loading loading-spinner loading-lg text-[#C44536]"></span>
                                    <p className="text-gray-600 mt-2">Loading admin users...</p>
                                </div>
                            ) : adminUsers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <User className="mx-auto mb-2 opacity-30" size={40} />
                                    <p>No admin users found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table table-zebra">
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
                                                                className="btn btn-xs btn-ghost text-blue-600 hover:bg-blue-50"
                                                                title="Edit"
                                                            >
                                                                <Edit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setResetPasswordUser(user);
                                                                    setNewPassword('');
                                                                }}
                                                                className="btn btn-xs btn-ghost text-orange-600 hover:bg-orange-50"
                                                                title="Reset Password"
                                                            >
                                                                <Key size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(user)}
                                                                className="btn btn-xs btn-ghost text-red-600 hover:bg-red-50"
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
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Edit Admin User</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="input input-bordered focus:border-[#C44536] focus:outline-none"
                                    value={editFormData.full_name}
                                    onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">Email</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    className="input input-bordered focus:border-[#C44536] focus:outline-none"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn bg-[#C44536] hover:bg-[#8B3A3A] text-white border-none"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => setEditingUser(null)}></div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetPasswordUser && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">Reset Password</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Reset password for <strong>{resetPasswordUser.full_name}</strong> ({resetPasswordUser.email})
                        </p>
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold">New Password</span>
                                </label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="input input-bordered focus:border-[#C44536] focus:outline-none"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min. 6 characters)"
                                />
                            </div>

                            <div className="modal-action">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setResetPasswordUser(null);
                                        setNewPassword('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn bg-[#F39C12] hover:bg-[#D68910] text-white border-none"
                                    disabled={loading}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                    <div className="modal-backdrop" onClick={() => {
                        setResetPasswordUser(null);
                        setNewPassword('');
                    }}></div>
                </div>
            )}
        </div>
    );
}
