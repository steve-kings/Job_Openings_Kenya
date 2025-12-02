import { createClient } from '@/lib/supabase/client';

/**
 * Generate a unique certificate ID
 */
export function generateCertificateId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'YENA-';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Issue a certificate for a completed course
 */
export async function issueCertificate(
    userId: string,
    courseId: string,
    userName: string,
    courseName: string
): Promise<{ success: boolean; certificateId?: string; error?: string }> {
    const supabase = createClient();

    try {
        // Check if certificate already exists
        const { data: existing } = await supabase
            .from('certificates')
            .select('certificate_id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (existing) {
            return {
                success: true,
                certificateId: existing.certificate_id
            };
        }

        // Generate new certificate
        const certificateId = generateCertificateId();
        const completionDate = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('certificates')
            .insert({
                user_id: userId,
                course_id: courseId,
                certificate_id: certificateId,
                user_name: userName,
                course_name: courseName,
                completion_date: completionDate
            })
            .select()
            .single();

        if (error) {
            console.error('Error issuing certificate:', error);
            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true,
            certificateId: data.certificate_id
        };
    } catch (error: any) {
        console.error('Error issuing certificate:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get user's certificates
 */
export async function getUserCertificates(userId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .order('issued_at', { ascending: false });

    if (error) {
        console.error('Error fetching certificates:', error);
        return [];
    }

    return data || [];
}

/**
 * Get certificate by ID
 */
export async function getCertificateById(certificateId: string) {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', certificateId)
        .single();

    if (error) {
        console.error('Error fetching certificate:', error);
        return null;
    }

    return data;
}

/**
 * Get certificate URL
 */
export function getCertificateUrl(certificateId: string): string {
    if (typeof window === 'undefined') {
        return `/certificates/${certificateId}`;
    }
    return `${window.location.origin}/certificates/${certificateId}`;
}
