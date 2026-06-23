# Job Openings Kenya

![Job Openings Kenya Logo](public/job_openings_kenya_logo.jpeg)

## 🌍 About Job Openings Kenya

Job Openings Kenya is a comprehensive digital platform dedicated to bridging the gap between young Kenyans and life-changing opportunities. We provide verified opportunities, skills training, and community support to empower the next generation of Kenyan leaders.

### Our Mission
To bridge the gap between young Africans and life-changing opportunities through verified information and skills training.

### Our Vision
A continent where every young person has access to the resources they need to build a dignified and prosperous future.

## ✨ Key Features

### 🎯 Opportunities Platform
- **Jobs**: Verified job opportunities for young professionals across Africa
- **Grants**: Funding opportunities for entrepreneurs and startups
- **Scholarships**: Educational opportunities to advance careers
- **Training Programs**: Entrepreneurship programs & online skill development

### 📚 Learning Management System (LMS)
- **Free Courses**: All courses are 100% free for African youth
- **Progress Tracking**: Real-time tracking of course completion
- **Certificates**: Automatic certificate generation upon course completion
- **Interactive Learning**: Video lessons, quizzes, and hands-on projects
- **Resource Downloads**: Downloadable course materials and resources

### 🏆 Certificate System
- **Automatic Generation**: Certificates are automatically generated when students complete all course lessons
- **Unique Certificate IDs**: Each certificate has a unique verification ID
- **Shareable**: Students can share their certificates via social media
- **Downloadable**: Certificates can be downloaded as images
- **Verification**: Public certificate verification system

### 📱 Community Features
- **WhatsApp Channel**: Daily opportunity drops and community updates
- **Blog**: Success stories, career tips, and community news
- **Contact System**: Web3Forms integration for seamless communication

### 👨‍💼 Admin Dashboard
- **Course Management**: Create, edit, and manage courses
- **Lesson Management**: Add video lessons, resources, and quizzes
- **User Management**: View and manage student enrollments
- **Opportunity Management**: Post jobs, grants, scholarships, and training programs
- **Blog Management**: Create and publish blog posts
- **Analytics**: Track platform usage and student progress

## 🎨 Design & Branding

### Job Openings Kenya Brand Colors
- **Primary Red**: `#1976D2` - Main brand color
- **Secondary Brown**: `#1565C0` - Supporting color
- **Accent Orange**: `#4CAF50` - Call-to-action and highlights
- **Success Green**: `#4CAF50` - Success states and positive actions

### Mobile Responsive
All pages are fully responsive and optimized for:
- 📱 Mobile devices (320px - 767px)
- 📱 Tablets (768px - 1023px)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + DaisyUI
- **Icons**: Lucide React + Font Awesome
- **State Management**: React Hooks

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Storage**: Supabase Storage (for course resources)
- **Real-time**: Supabase Realtime subscriptions

### Key Libraries
- `@supabase/ssr` - Server-side Supabase client
- `react-player` - Video player for course lessons
- `html2canvas` - Certificate image generation
- `lucide-react` - Modern icon library
- `@fortawesome/react-fontawesome` - Font Awesome icons

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/job-openings-kenya.git
cd job-openings-kenya
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Google OAuth (if using)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Database Setup
Run the database setup script in your Supabase SQL editor:

```bash
# The main setup file is: supabase-setup.sql
# This creates all necessary tables, RLS policies, and functions
```

### 5. Seed Data (Optional)
```bash
# Use supabase-seed.sql to add sample data
```

### 6. Run Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
job-openings-kenya/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── about/             # About page
│   │   ├── admin/             # Admin dashboard
│   │   ├── blog/              # Blog pages
│   │   ├── certificates/      # Certificate viewing
│   │   ├── contact/           # Contact page
│   │   ├── courses/           # Courses pages
│   │   ├── dashboard/         # Student dashboard
│   │   ├── jobs/              # Opportunities pages
│   │   ├── login/             # Authentication
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable React components
│   │   ├── Certificate.tsx    # Certificate component
│   │   ├── CourseThumbnailFallback.tsx
│   │   ├── Footer.tsx         # Site footer
│   │   ├── HeroSlider.tsx     # Home page slider
│   │   ├── JobsFilter.tsx     # Opportunities filter
│   │   ├── JobsHeroSlider.tsx # Jobs page slider
│   │   ├── Navbar.tsx         # Navigation bar
│   │   └── PartnersSection.tsx
│   └── lib/                   # Utility functions
│       ├── supabase/          # Supabase clients
│       │   ├── client.ts      # Client-side
│       │   └── server.ts      # Server-side
│       └── certificateUtils.ts # Certificate generation
├── public/
│   └── images/                # Static images
├── supabase-setup.sql         # Database schema
├── supabase-seed.sql          # Sample data
├── .env.local                 # Environment variables
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── package.json               # Dependencies
```

## 🗄️ Database Schema

### Core Tables
- **profiles**: User profiles and roles
- **courses**: Course information
- **modules**: Course modules
- **lessons**: Individual lessons
- **enrollments**: Student course enrollments
- **progress**: Lesson completion tracking
- **certificates**: Generated certificates
- **opportunities**: Jobs, grants, scholarships, training
- **blog_posts**: Blog articles

### Key Features
- **Row Level Security (RLS)**: All tables have RLS policies
- **Automatic Timestamps**: Created_at and updated_at fields
- **Cascading Deletes**: Proper foreign key relationships
- **Indexes**: Optimized for common queries

## 👥 User Roles

### Student (Default)
- Browse and enroll in courses
- Track progress and earn certificates
- View opportunities
- Access dashboard

### Admin
- All student permissions
- Create and manage courses
- Post opportunities
- Manage blog posts
- View analytics
- Manage users

### Creating an Admin
```sql
-- Update a user's role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

## 🎓 Course Management

### Creating a Course (Admin)
1. Navigate to Admin Dashboard
2. Click "Create New Course"
3. Fill in course details:
   - Title, description, category
   - Level (Beginner/Intermediate/Advanced)
   - Duration
   - Thumbnail URL
4. Add modules and lessons
5. Upload resources (PDFs, documents)
6. Publish course

### Adding Lessons
- **Video Lessons**: Support for YouTube, Vimeo, and direct video URLs
- **Resources**: Upload PDFs, documents, and other materials
- **Quizzes**: Coming soon

## 📜 Certificate System

### How It Works
1. Student enrolls in a course
2. Completes all lessons in all modules
3. Certificate is automatically generated
4. Celebration modal appears
5. Certificate is saved to database
6. Student can view/download/share certificate

### Certificate Features
- Unique verification ID
- Student name and course name
- Completion date
- Job Openings Kenya branding and signatures
- Downloadable as image
- Shareable on social media
- Public verification page

## 🔐 Authentication

### Supported Methods
- **Email/Password**: Traditional authentication
- **Google OAuth**: One-click sign-in
- **Email Verification**: Optional email confirmation

### Password Requirements
- Minimum 6 characters
- No special requirements (user-friendly)

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Netlify
- AWS Amplify
- Railway
- Render

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 📞 Contact Information

### Job Openings Kenya Contact
- **Email**: info@jobopeningskenya.com
- **Phone**: +254 788 419 041
- **WhatsApp Channel**: [Join Here](https://whatsapp.com/channel/0029Vb5tFTSK0IBb2oi04V2b)

### Developer
- **Company**: Kings Creation
- **Website**: [kingscreation.co.ke](https://kingscreation.co.ke)
- **Phone**: +254 788 419 041
- **Email**: kingscreationagency635@gmail.com

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary software owned by Job Openings Kenya.

## 🙏 Acknowledgments

- **Job Openings Kenya Team**: For the vision and mission
- **Kings Creation**: For development and design
- **Supabase**: For the amazing backend platform
- **Next.js**: For the powerful React framework
- **Tailwind CSS**: For the utility-first CSS framework
- **DaisyUI**: For beautiful UI components

## 📊 Platform Statistics

- **5,000+ Youth**: Empowered across Africa
- **50+ Partners**: Building bridges with organizations
- **850+ Students**: Trained in high-demand skills
- **1,200+ Jobs**: Posted and verified
- **200+ Grants**: Funding opportunities shared
- **500+ Scholarships**: Educational opportunities
- **850+ Training Programs**: Skills development

## 🚀 Future Roadmap

### Phase 1 (Current)
- ✅ Core platform functionality
- ✅ LMS with certificate system
- ✅ Opportunities platform
- ✅ Blog and community features

### Phase 2 (Coming Soon)
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics dashboard
- 🔄 Mentorship matching system
- 🔄 Live webinars and events
- 🔄 Community forums
- 🔄 Job application tracking

### Phase 3 (Future)
- 📅 AI-powered opportunity matching
- 📅 Blockchain certificates
- 📅 Peer-to-peer learning
- 📅 Gamification and badges
- 📅 Multi-language support

## 🐛 Known Issues

None at the moment! Report issues on GitHub.

## 💡 Tips for Admins

### Best Practices
1. **Course Creation**: Use clear, descriptive titles
2. **Video URLs**: Test all video URLs before publishing
3. **Resources**: Keep file sizes under 10MB
4. **Thumbnails**: Use high-quality images (1200x630px recommended)
5. **Opportunities**: Update deadlines regularly
6. **Blog Posts**: Use engaging featured images

### Performance Tips
1. Optimize images before uploading
2. Use YouTube/Vimeo for video hosting
3. Keep course descriptions concise
4. Regular database maintenance

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Components](https://daisyui.com/components/)

---

**Built with ❤️ by Kings Creation for Job Openings Kenya**

*Empowering Africa's Youth, One Opportunity at a Time*
