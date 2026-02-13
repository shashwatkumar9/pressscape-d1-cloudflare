import { redirect } from 'next/navigation';

export default async function PublisherConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    // Redirect to the unified messages conversation page
    // The shared /messages/[id] page will handle role detection internally
    redirect(`/messages/${id}`);
}
