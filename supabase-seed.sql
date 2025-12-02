-- YENA Web Platform - Seed Data
-- Run this AFTER the main setup script in the Supabase SQL Editor

-- 1. Insert Partners
INSERT INTO partners (name, description, logo_url, website_url) VALUES
('Google Africa', 'Empowering African youth with digital skills and scholarships.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/2560px-Google_2015_logo.svg.png', 'https://africa.googleblog.com/'),
('British Council', 'Creating international opportunities for the people of the UK and other countries.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/British_Council_Logo.svg/1200px-British_Council_Logo.svg.png', 'https://www.britishcouncil.org/'),
('African Development Bank', 'Driving Africa''s economic development and social progress.', 'https://upload.wikimedia.org/wikipedia/en/thumb/3/38/African_Development_Bank_logo.svg/1200px-African_Development_Bank_logo.svg.png', 'https://www.afdb.org/'),
('Mastercard Foundation', 'Seeking a world where everyone has the opportunity to learn and prosper.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Mastercard_Foundation_Logo.png/800px-Mastercard_Foundation_Logo.png', 'https://mastercardfdn.org/'),
('Microsoft', 'Enabling digital transformation for the era of an intelligent cloud and an intelligent edge.', 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Microsoft_logo_%282012%29.svg/2560px-Microsoft_logo_%282012%29.svg.png', 'https://www.microsoft.com/africa');

-- 2. Insert Opportunities
INSERT INTO opportunities (title, type, company, location, description, short_description, requirements, responsibilities, benefits, deadline, apply_url, status, views) VALUES
('Software Developer Intern', 'Job', 'Tech Solutions Ltd', 'Nairobi, Kenya', 
 'We are seeking a passionate software developer intern to join our team. This is an excellent opportunity for recent graduates or final-year students to gain hands-on experience in full-stack web development. You will work closely with senior developers to build and maintain web applications using modern technologies.',
 'Join our team as a software developer intern and gain hands-on experience in full-stack web development.',
 ARRAY['Bachelor''s degree in Computer Science or related field', 'Proficiency in JavaScript, React, and Node.js', 'Strong problem-solving skills', 'Good communication and teamwork abilities'],
 ARRAY['Collaborate with senior developers on web applications', 'Write clean, maintainable code', 'Participate in code reviews and team meetings', 'Debug and troubleshoot existing applications'],
 ARRAY['Competitive stipend', 'Mentorship from experienced developers', 'Certificate of completion', 'Potential for full-time employment'],
 '2025-03-15', 'https://example.com/apply/software-intern', 'active', 125),

('Masters Scholarship 2025', 'Scholarship', 'British Council', 'UK (Remote)', 
 'Full scholarship for African students pursuing Masters degrees in the UK. Covers tuition, living expenses, and travel costs. This prestigious scholarship aims to support future leaders who will contribute to their home countries'' development.',
 'Full scholarship for African students pursuing Masters degrees in the UK, covering tuition and living expenses.',
 ARRAY['Bachelor''s degree with honors', 'Strong academic record', 'Leadership experience', 'Valid passport'],
 ARRAY['Maintain good academic standing', 'Participate in leadership workshops', 'Return to home country after studies'],
 ARRAY['Full tuition coverage', 'Living stipend', 'Travel allowance', 'Networking opportunities'],
 '2025-04-30', 'https://example.com/apply/uk-scholarship', 'active', 432),

('Agri-Business Grant', 'Grant', 'African Development Bank', 'Lagos, Nigeria', 
 'Grant funding for innovative agricultural businesses across Africa. Up to $50,000 available. We are looking for startups that are using technology to solve challenges in the agricultural value chain.',
 'Grant funding of up to $50,000 available for innovative agricultural businesses across Africa.',
 ARRAY['Registered business', 'Agricultural focus', 'Clear business plan', 'Impact metrics'],
 ARRAY['Submit quarterly progress reports', 'Attend mentorship sessions', 'Demonstrate impact'],
 ARRAY['Up to $50,000 funding', 'Business mentorship', 'Networking opportunities', 'Access to investor network'],
 '2025-02-20', 'https://example.com/apply/agri-grant', 'active', 89),

('Digital Marketing Bootcamp', 'Training', 'Google Africa', 'Online', 
 'Free 8-week intensive training in digital marketing, SEO, and social media management. Learn from industry experts and get certified by Google.',
 'Free 8-week intensive training in digital marketing, SEO, and social media management.',
 ARRAY['Basic internet skills', 'Commitment to complete the program', 'Access to a computer and internet'],
 ARRAY['Attend all live sessions', 'Complete weekly assignments', 'Participate in group projects'],
 ARRAY['Free certification', 'Career support', 'Real-world projects', 'Alumni network access'],
 '2025-05-20', 'https://example.com/apply/digital-marketing', 'active', 567),

('Data Analyst Position', 'Job', 'DataCorp Rwanda', 'Kigali, Rwanda', 
 'Looking for a data analyst to join our growing team. Work with big data and create insights that drive business decisions. You will be responsible for collecting, processing, and performing statistical analyses on large datasets.',
 'Join our growing team as a data analyst and work with big data to drive business decisions.',
 ARRAY['Bachelor''s in Statistics, Mathematics, or related field', 'Experience with Python, R, or SQL', 'Strong analytical skills'],
 ARRAY['Analyze large datasets', 'Create data visualizations', 'Present findings to stakeholders', 'Collaborate with cross-functional teams'],
 ARRAY['Competitive salary', 'Health insurance', 'Professional development', 'Remote work options'],
 '2025-03-25', 'https://example.com/apply/data-analyst', 'active', 210);

-- 3. Insert Courses & Modules & Lessons
WITH course1 AS (
  INSERT INTO courses (slug, title, description, category, level, duration, instructor, thumbnail_url, what_you_will_learn, status)
  VALUES ('full-stack-web-development', 'Full Stack Web Development', 
    'This comprehensive course will take you from zero to building production-ready web applications. You''ll learn HTML, CSS, JavaScript, React, Node.js, databases, and deployment strategies.',
    'Technology', 'Beginner to Intermediate', '12 weeks', 'Dr. Amara Okafor',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop',
    ARRAY['Build responsive websites with HTML, CSS, and JavaScript', 'Create interactive UIs with React', 'Develop RESTful APIs with Node.js and Express', 'Work with databases (PostgreSQL, MongoDB)', 'Deploy applications to production', 'Best practices in version control with Git'],
    'published')
  RETURNING id
),
module1 AS (
  INSERT INTO modules (course_id, title, description, order_index)
  SELECT id, 'Introduction to Web Development', 'Overview of web technologies and development environment setup', 1 FROM course1
  RETURNING id
)
INSERT INTO lessons (module_id, title, content, video_url, duration, order_index, resources)
SELECT id, 'How the Web Works', 'Understanding HTTP, Client-Server architecture, and DNS.', 'https://www.youtube.com/embed/hMXGhHNXl88', 15, 1, 
  '[{"title": "Web Architecture Diagram", "url": "https://example.com/web-arch.pdf", "type": "pdf"}]'::jsonb 
FROM module1;

-- Course 2
WITH course2 AS (
  INSERT INTO courses (slug, title, description, category, level, duration, instructor, thumbnail_url, what_you_will_learn, status)
  VALUES ('digital-marketing-essentials', 'Digital Marketing Essentials', 
    'Learn SEO, social media marketing, content strategy, and analytics to grow your brand online.',
    'Marketing', 'Beginner', '8 weeks', 'Sarah Mensah',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop',
    ARRAY['Search Engine Optimization (SEO)', 'Social Media Marketing', 'Content Strategy', 'Email Marketing', 'Analytics and Reporting'],
    'published')
  RETURNING id
)
INSERT INTO modules (course_id, title, description, order_index)
SELECT id, 'Introduction to Digital Marketing', 'Overview of digital channels and strategies', 1 FROM course2;

-- 4. Insert Blog Posts
INSERT INTO blog_posts (slug, title, excerpt, content, category, author_name, featured_image, status, views, published_at)
VALUES 
('how-jane-landed-her-dream-job', 'How Jane Landed Her Dream Job Through YENA', 
 'Jane''s journey from unemployment to becoming a software engineer at a leading tech company in Nairobi.',
 'Jane Kamau was struggling to find work after graduating with a degree in Computer Science. She discovered YENA through a friend and started browsing the daily opportunity drops. Within two weeks, she found a software developer internship that matched her skills perfectly. After applying through the platform and completing the interview process, she secured the position. Today, Jane is a full-time software engineer and credits YENA for giving her the visibility she needed to launch her career.',
 'Success Story', 'YENA Team',
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2088&auto=format&fit=crop',
 'published', 1234, NOW() - INTERVAL '7 days'),

('top-skills-2025', 'Top 10 Skills African Youth Need in 2025', 
 'The job market is evolving. Here are the most in-demand skills for the coming year.',
 'As we move into 2025, the global job market continues to evolve rapidly. For African youth looking to remain competitive, here are the top 10 skills you should focus on: 1. Digital Literacy, 2. Data Analysis, 3. Cloud Computing, 4. Digital Marketing, 5. Project Management, 6. Communication Skills, 7. Problem-Solving, 8. Adaptability, 9. Cybersecurity Awareness, 10. Entrepreneurship. Each of these skills opens doors to new opportunities and can be learned through YENA''s free training programs.',
 'Career Insights', 'Dr. Amara Okafor',
 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop',
 'published', 2567, NOW() - INTERVAL '9 days'),

('yena-reaches-5000-youth', 'YENA Reaches 5,000+ Youth Across Africa', 
 'A milestone celebration as we reflect on our impact and look forward to scaling our mission.',
 'We are thrilled to announce that YENA has now reached over 5,000 young people across the African continent! This incredible milestone represents thousands of opportunities shared, hundreds of courses completed, and countless lives changed. From our humble beginnings sharing job listings on WhatsApp, we have grown into a comprehensive platform connecting youth with jobs, grants, scholarships, and training. Thank you to our partners, our team, and most importantly, to the youth who trust us to guide their career journeys. Here''s to the next 5,000!',
 'Organization News', 'Stephen Kingori',
 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2069&auto=format&fit=crop',
 'published', 890, NOW() - INTERVAL '12 days'),

('scholarship-application-tips', '5 Tips for Winning Scholarships', 
 'Learn how to craft compelling applications that stand out from the crowd.',
 'Winning a scholarship can be life-changing, but the competition is fierce. Here are 5 proven tips to make your application stand out: 1. Start Early - Don''t wait until the deadline to begin. 2. Tailor Your Application - Customize each application to the specific scholarship. 3. Tell Your Story - Make your personal statement memorable and authentic. 4. Get Strong Recommendations - Choose referees who know you well and can speak to your strengths. 5. Proofread Everything - Grammar and spelling errors can disqualify otherwise strong applications. Follow these tips and increase your chances of success!',
 'How-To', 'YENA Team',
 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop',
 'published', 456, NOW() - INTERVAL '15 days');
