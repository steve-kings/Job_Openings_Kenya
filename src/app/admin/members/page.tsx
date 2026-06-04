import { createClient } from '@/lib/supabase/server';
import { UserCheck, Mail, Calendar, ShieldCheck, User } from 'lucide-react';

export const revalidate = 0;

export default async function MembersPage() {
    const supabase = await createClient();

    // Fetch all members from profiles
    const { data: members, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching members:', error);
    }

    const totalMembers = members?.length || 0;
    const adminCount = members?.filter(m => m.role === 'admin').length || 0;

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5CB800] to-[#4A9900] flex items-center justify-center shadow-lg">
                            <UserCheck className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Registered Members</h1>
                            <p className="text-gray-500 text-sm mt-0.5">Manage and view all registered users and admins on Job Openings Kenya.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Registered Youth</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalMembers}</h3>
                    </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Active Administrators</p>
                        <h3 className="text-2xl font-bold text-gray-900">{adminCount}</h3>
                    </div>
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Full Name</th>
                                <th className="px-6 py-4">Email Address</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {!members || members.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No members found on the platform yet.
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                                                    {member.full_name?.charAt(0)?.toUpperCase() || member.email?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-gray-900">
                                                    {member.full_name || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail size={14} className="text-gray-400" />
                                                {member.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {member.role === 'admin' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100">
                                                    <ShieldCheck size={12} /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">
                                                    <User size={12} /> Student
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(member.created_at).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
