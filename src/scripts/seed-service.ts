import { createClient } from '@supabase/supabase-js';
import { partners, opportunities, blogPosts } from '../lib/seed-data';

// Hardcoded for immediate seeding fix
const supabaseUrl = 'https://bmjrebjafjcvtfnxayhq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtanJlYmphZmpjdnRmbnhheWhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE3MzE4MywiZXhwIjoyMDc5NzQ5MTgzfQ.Ic0rooIXVsjxTCHxhwtTh64G0fibQtMybEepOPhMiw0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
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
            // Blog posts usually have unique slugs, so upsert might work if constraint exists.
            // But let's be safe and check.
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
    } catch (error: any) {
        console.error('Seed Error:', error.message);
        process.exit(1);
    }
}

seed();
