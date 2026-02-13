import { redirect } from 'next/navigation';

export default function PublisherMessagesPage() {
    // Redirect to the unified messages page
    redirect('/messages');
}
