import { redirect } from 'next/navigation';

// Lessons are managed on the external KingsLearn LMS platform
// This route redirects admins to the appropriate admin page
export default function LessonRedirectPage() {
    redirect('/admin/courses');
}
