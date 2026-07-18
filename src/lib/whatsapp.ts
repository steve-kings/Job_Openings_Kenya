export const OWNER_WHATSAPP_NUMBER = '254790855690';

export function getManualCvRevampWhatsAppUrl(name?: string) {
    const customerName = name?.trim();
    const introduction = customerName ? ` My name is ${customerName}.` : '';
    const message = `Hello Job Openings Kenya.${introduction} I would like a manual CV revamp. Please share the requirements, price, and next steps.`;

    return `https://wa.me/${OWNER_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
