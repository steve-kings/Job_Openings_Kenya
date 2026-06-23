import { createClient } from '@supabase/supabase-js';
import { partners, opportunities, blogPosts } from '../lib/seed-data';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function seed() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('ERROR: Missing environment variables.');
        console.error('Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    console.log('Starting seed process...');

    try {
        // 1. Seed Partners
        console.log('Seeding Partners...');
        for (const partner of partners) {
            const { data: existing } = await supabase
                .from('partners')
                .select('id')
                .eq('name', partner.name)
                .single();

            if (!existing) {
                const { error } = await supabase.from('partners').insert(partner);
                if (error) console.error(`Error inserting partner ${partner.name}:`, error.message);
                else console.log(`Inserted partner: ${partner.name}`);
            } else {
                console.log(`Partner already exists: ${partner.name}`);
            }
        }

        // 2. Seed Opportunities
        console.log('Seeding Opportunities...');

        // Try to get a user to assign as owner
        const { data: users } = await supabase.auth.admin.listUsers();
        const systemUserId = users.users[0]?.id;

        if (!systemUserId) {
            console.warn('No users found. Opportunities will be created without a specific owner.');
        }

        for (const opp of opportunities) {
            const { data: existing } = await supabase
                .from('opportunities')
                .select('id')
                .eq('title', opp.title)
                .single();

            if (!existing) {
                const oppWithUser = { ...opp, created_by: systemUserId };
                const { error } = await supabase.from('opportunities').insert(oppWithUser);
                if (error) console.error(`Error inserting opportunity ${opp.title}:`, error.message);
                else console.log(`Inserted opportunity: ${opp.title}`);
            } else {
                console.log(`Opportunity already exists: ${opp.title}`);
            }
        }

        // 3. Seed Blog Posts
        console.log('Seeding Blog Posts...');
        for (const post of blogPosts) {
            const { data: existing } = await supabase
                .from('blog_posts')
                .select('id')
                .eq('slug', post.slug)
                .single();

            if (!existing) {
                const postWithUser = { ...post, author_id: systemUserId };
                const { error } = await supabase.from('blog_posts').insert(postWithUser);
                if (error) console.error(`Error inserting blog post ${post.title}:`, error.message);
                else console.log(`Inserted blog post: ${post.title}`);
            } else {
                console.log(`Blog post already exists: ${post.title}`);
            }
        }

        console.log('Database seeded successfully!');
    } catch (error: unknown) {
        console.error('Seed Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

seed();
