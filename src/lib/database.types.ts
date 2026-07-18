// ============================================================
// Database TypeScript Types
// Manually maintained — keep in sync with live Supabase schema.
// Last synced: 2026-06-23
// ============================================================

/**
 * Represents the roles a user can have in the system.
 * Matches the live profiles_role_check constraint.
 */
export type UserRole = 'admin' | 'employer' | 'student';

/**
 * Profile record (extends Supabase auth.users).
 */
export interface Profile {
    id: string;
    role: UserRole;
    email: string | null;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
    headline: string | null;
    location: string | null;
    website: string | null;
    skills: string[] | null;
    education: string | null;
    experience: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
    is_public: boolean;
    open_to_work: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Opportunity type — either a Job or Training.
 */
export type OpportunityType = 'Job' | 'Training';

/**
 * Opportunity status.
 */
export type OpportunityStatus = 'active' | 'inactive' | 'closed' | 'draft' | 'expired';

/**
 * Opportunity record — a job listing or training program.
 */
export interface Opportunity {
    id: string;
    title: string;
    type: OpportunityType;
    company: string;
    location: string | null;
    description: string | null;
    short_description: string | null;
    requirements: string[] | null;
    responsibilities: string[] | null;
    benefits: string[] | null;
    deadline: string | null;
    apply_url: string | null;
    status: OpportunityStatus;
    views: number;
    salary_min: number | null;
    salary_max: number | null;
    salary_currency: string | null;
    thumbnail_url: string | null;
    source: string | null;
    source_job_id: string | null;
    source_url: string | null;
    scraped_at: string | null;
    last_seen_at: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Partner organization.
 */
export interface Partner {
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    website_url: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Blog post status.
 */
export type BlogPostStatus = 'draft' | 'published' | 'archived';

/**
 * Blog post record.
 */
export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string | null;
    category: string | null;
    author_name: string | null;
    author_id: string | null;
    featured_image: string | null;
    status: BlogPostStatus;
    views: number;
    created_at: string;
    updated_at: string;
}

/**
 * Subscriber status.
 */
export type SubscriberStatus = 'active' | 'unsubscribed';

/**
 * Newsletter subscriber.
 */
export interface Subscriber {
    id: string;
    email: string;
    status: SubscriberStatus;
    interests: Record<string, unknown> | null;
    created_at: string;
}

/**
 * Application status.
 */
export type ApplicationStatus = 'applied' | 'saved' | 'interviewing' | 'offered' | 'rejected';

/**
 * Job application record.
 */
export interface Application {
    id: string;
    user_id: string;
    opportunity_id: string;
    status: ApplicationStatus;
    notes: string | null;
    applied_at: string;
    updated_at: string;
}

/**
 * Scheduled email status.
 */
export type ScheduledEmailStatus = 'pending' | 'sent' | 'failed';

/**
 * Scheduled email record.
 */
export interface ScheduledEmail {
    id: string;
    subject: string;
    html_content: string;
    send_at: string;
    status: ScheduledEmailStatus;
    sent_at: string | null;
    recipient_count: number;
    created_at: string;
}

/**
 * Testimonial status.
 */
export type TestimonialStatus = 'pending' | 'approved' | 'rejected';

/**
 * Testimonial record.
 */
export interface Testimonial {
    id: string;
    name: string;
    role: string | null;
    company: string | null;
    content: string;
    avatar_url: string | null;
    featured: boolean;
    status: TestimonialStatus;
    created_at: string;
}

/**
 * Saved search record.
 */
export interface SavedSearch {
    id: string;
    user_id: string;
    name: string | null;
    query: string;
    filters: Record<string, unknown> | null;
    created_at: string;
}

// ── Employer Portal ──────────────────────────────────────────

/**
 * Employer job submission status.
 */
export type EmployerSubmissionStatus = 'pending' | 'approved' | 'rejected';

/**
 * Job type for employer submissions.
 */
export type EmployerJobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship' | 'Remote';

/**
 * Employer job submission record.
 */
export interface EmployerJobSubmission {
    id: string;
    employer_id: string;
    job_title: string;
    company_name: string;
    contact_email: string;
    job_type: EmployerJobType;
    location: string;
    deadline: string | null;
    short_description: string | null;
    description: string;
    requirements: string | null;
    apply_url: string;
    logo_url: string | null;
    status: EmployerSubmissionStatus;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

// ── Forum ────────────────────────────────────────────────────

/**
 * Forum category.
 */
export interface ForumCategory {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
    thread_count: number;
    created_at: string;
}

/**
 * Forum thread.
 */
export interface ForumThread {
    id: string;
    title: string;
    content: string;
    user_id: string;
    category_id: string | null;
    upvotes: number;
    views: number;
    comment_count: number;
    is_pinned: boolean;
    is_locked: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Forum comment.
 */
export interface ForumComment {
    id: string;
    thread_id: string;
    user_id: string;
    content: string;
    upvotes: number;
    parent_id: string | null;
    created_at: string;
}

/**
 * Vote type.
 */
export type VoteType = 'up' | 'down';

/**
 * Forum vote (one vote per user per thread or comment).
 */
export interface ForumVote {
    id: string;
    user_id: string;
    thread_id: string | null;
    comment_id: string | null;
    vote_type: VoteType;
    created_at: string;
}

// ── Courses & Learning ─────────────────────────────────────

/**
 * Course level.
 */
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Course status.
 */
export type CourseStatus = 'draft' | 'published';

/**
 * Course record — links to KingsLearn LMS.
 */
export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    external_url: string | null;
    level: CourseLevel;
    duration_hours: number | null;
    category: string | null;
    status: CourseStatus;
    thumbnail_url: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Lesson status.
 */
export type LessonStatus = 'draft' | 'published';

/**
 * Lesson record — belongs to a course.
 */
export interface Lesson {
    id: string;
    course_id: string;
    title: string;
    content: string | null;
    order_index: number;
    duration_minutes: number | null;
    video_url: string | null;
    status: LessonStatus;
    created_at: string;
    updated_at: string;
}

/**
 * Certificate record — issued when a user completes a course.
 */
export interface Certificate {
    id: string;
    user_id: string;
    course_id: string;
    issued_at: string | null;
    created_at: string;
}

// ── Database schema mapping ──────────────────────────────────

/**
 * Database schema type mapping — use with typed Supabase queries.
 *
 * @example
 * ```ts
 * const { data } = await supabase
 *   .from('opportunities')
 *   .select('*')
 *   .returns<Opportunity[]>();
 * ```
 */
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Profile, 'id' | 'created_at' | 'updated_at'>>;
                Update: Partial<Omit<Profile, 'id'>>;
            };
            opportunities: {
                Row: Opportunity;
                Insert: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'views'> & Partial<Pick<Opportunity, 'id' | 'created_at' | 'updated_at' | 'views'>>;
                Update: Partial<Omit<Opportunity, 'id'>>;
            };
            partners: {
                Row: Partner;
                Insert: Omit<Partner, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Partner, 'id' | 'created_at' | 'updated_at'>>;
                Update: Partial<Omit<Partner, 'id'>>;
            };
            blog_posts: {
                Row: BlogPost;
                Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views'> & Partial<Pick<BlogPost, 'id' | 'created_at' | 'updated_at' | 'views'>>;
                Update: Partial<Omit<BlogPost, 'id'>>;
            };
            subscribers: {
                Row: Subscriber;
                Insert: Omit<Subscriber, 'id' | 'created_at'> & Partial<Pick<Subscriber, 'id' | 'created_at'>>;
                Update: Partial<Omit<Subscriber, 'id'>>;
            };
            applications: {
                Row: Application;
                Insert: Omit<Application, 'id' | 'applied_at' | 'updated_at'> & Partial<Pick<Application, 'id' | 'applied_at' | 'updated_at'>>;
                Update: Partial<Omit<Application, 'id'>>;
            };
            scheduled_emails: {
                Row: ScheduledEmail;
                Insert: Omit<ScheduledEmail, 'id' | 'created_at' | 'sent_at' | 'recipient_count'> & Partial<Pick<ScheduledEmail, 'id' | 'created_at' | 'sent_at' | 'recipient_count'>>;
                Update: Partial<Omit<ScheduledEmail, 'id'>>;
            };
            testimonials: {
                Row: Testimonial;
                Insert: Omit<Testimonial, 'id' | 'created_at'> & Partial<Pick<Testimonial, 'id' | 'created_at'>>;
                Update: Partial<Omit<Testimonial, 'id'>>;
            };
            saved_searches: {
                Row: SavedSearch;
                Insert: Omit<SavedSearch, 'id' | 'created_at'> & Partial<Pick<SavedSearch, 'id' | 'created_at'>>;
                Update: Partial<Omit<SavedSearch, 'id'>>;
            };
            employer_job_submissions: {
                Row: EmployerJobSubmission;
                Insert: Omit<EmployerJobSubmission, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<EmployerJobSubmission, 'id' | 'created_at' | 'updated_at'>>;
                Update: Partial<Omit<EmployerJobSubmission, 'id'>>;
            };
            forum_categories: {
                Row: ForumCategory;
                Insert: Omit<ForumCategory, 'id' | 'created_at'> & Partial<Pick<ForumCategory, 'id' | 'created_at'>>;
                Update: Partial<Omit<ForumCategory, 'id'>>;
            };
            forum_threads: {
                Row: ForumThread;
                Insert: Omit<ForumThread, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<ForumThread, 'id' | 'created_at' | 'updated_at'>>;
                Update: Partial<Omit<ForumThread, 'id'>>;
            };
            forum_comments: {
                Row: ForumComment;
                Insert: Omit<ForumComment, 'id' | 'created_at'> & Partial<Pick<ForumComment, 'id' | 'created_at'>>;
                Update: Partial<Omit<ForumComment, 'id'>>;
            };
            forum_votes: {
                Row: ForumVote;
                Insert: Omit<ForumVote, 'id' | 'created_at'> & Partial<Pick<ForumVote, 'id' | 'created_at'>>;
                Update: Partial<Omit<ForumVote, 'id'>>;
            };
            courses: {
                Row: Course;
                Insert: Omit<Course, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Course, 'id' | 'created_at' | 'updated_at'>>;
                Update: Partial<Omit<Course, 'id'>>;
            };
            lessons: {
                Row: Lesson;
                Insert: Omit<Lesson, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<Lesson, 'id' | 'created_at' | 'updated_at'>>;
                Update: Partial<Omit<Lesson, 'id'>>;
            };
            certificates: {
                Row: Certificate;
                Insert: Omit<Certificate, 'id' | 'created_at'> & Partial<Pick<Certificate, 'id' | 'created_at'>>;
                Update: Partial<Omit<Certificate, 'id'>>;
            };
        };
    };
}
