export const runtime = 'edge';

import { redirect } from 'next/navigation';

export default function BuyerConversationPage({ params }: { params: Promise<{ id: string }> }) {
    // Redirect to the unified messages conversation page
    // The shared /messages/[id] page will handle role detection internally
    redirect(`/messages/${params}`);
}
