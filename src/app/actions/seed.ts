'use server'

import { createClient } from '@/lib/supabase/server';
import { partners, opportunities, blogPosts } from '@/lib/seed-data';

export async function seedDatabase() {
    const supabase = await createClient();

    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'You must be logged in to seed the database.' };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { success: false, message: 'Only admins can seed the database.' };
    }

    try {
        // 1. Seed Partners
        const { error: partnersError } = await supabase
            .from('partners')
            .upsert(partners, { onConflict: 'name', ignoreDuplicates: true });

        if (partnersError) throw new Error(`Partners Error: ${partnersError.message}`);

        // 2. Seed Opportunities
        // We need to add created_by to opportunities
        const opportunitiesWithUser = opportunities.map(opp => ({
            ...opp,
            created_by: user.id
        }));

        const { error: oppsError } = await supabase
            .from('opportunities')
            .upsert(opportunitiesWithUser, { onConflict: 'title', ignoreDuplicates: true });

        if (oppsError) throw new Error(`Opportunities Error: ${oppsError.message}`);

        // 3. Seed Blog Posts
        const blogPostsWithUser = blogPosts.map(post => ({
            ...post,
            author_id: user.id
        }));

        const { error: blogError } = await supabase
            .from('blog_posts')
            .upsert(blogPostsWithUser, { onConflict: 'slug', ignoreDuplicates: true });

        if (blogError) throw new Error(`Blog Posts Error: ${blogError.message}`);

        return { success: true, message: 'Database seeded successfully!' };
    } catch (error: any) {
        console.error('Seed Error:', error);
        return { success: false, message: error.message };
    }
}
