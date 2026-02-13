import { redirect } from 'next/navigation';

export default function BuyerMessagesPage() {
    // Redirect to the unified messages page
    redirect('/messages');
}
