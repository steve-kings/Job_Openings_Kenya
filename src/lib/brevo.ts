export async function sendEmail({
    to,
    bcc,
    subject,
    htmlContent,
    senderName = 'Job Openings Kenya Team',
    senderEmail = 'info@jobopenings.co.ke'
}: {
    to: { email: string; name?: string }[];
    bcc?: { email: string; name?: string }[];
    subject: string;
    htmlContent: string;
    senderName?: string;
    senderEmail?: string;
}) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) throw new Error('BREVO_API_KEY is not configured in environment variables');

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'api-key': apiKey,
        },
        body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: to,
            ...(bcc && bcc.length > 0 ? { bcc } : {}),
            subject: subject,
            htmlContent: htmlContent,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Brevo API Error:', errorData);
        throw new Error(errorData.message || 'Failed to send email via Brevo');
    }

    return await response.json();
}
