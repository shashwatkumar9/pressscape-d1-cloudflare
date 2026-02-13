import { sql } from '@/lib/db';
import { createRefund } from '@/lib/stripe';
import { sendEmail } from '@/lib/email';

/**
 * Release payment to publisher and affiliate when order is completed
 */
export async function releasePayment(orderId: string): Promise<void> {
  try {
    // Get order details
    const orderResult = await sql`
      SELECT 
        o.*,
        p.email as publisher_email,
        p.name as publisher_name,
        a.email as affiliate_email,
        a.name as affiliate_name
      FROM orders o
      JOIN users p ON o.publisher_id = p.id
      LEFT JOIN users a ON o.affiliate_id = a.id
      WHERE o.id = ${orderId}
    `;

    if (orderResult.rows.length === 0) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orderResult.rows[0] as Record<string, unknown>;

    // Check if already released
    if (order.payment_status === 'released') {
      console.log(`Payment for order ${orderId} already released`);
      return;
    }

    // Credit publisher balance
    await sql`
        UPDATE users 
        SET publisher_balance = publisher_balance + ${order.publisher_earnings as number}
        WHERE id = ${order.publisher_id as string}
      `;

    // Create publisher transaction record
    await sql`
        INSERT INTO transactions (
          user_id, type, reference_type, reference_id,
          amount, balance_type, description
        ) VALUES (
          ${order.publisher_id as string},
          'earning',
          'order',
          ${orderId},
          ${order.publisher_earnings as number},
          'publisher',
          ${'Earnings from order ' + (order.order_number as string)}
        )
      `;

    // Credit affiliate if applicable
    if (order.affiliate_id && order.affiliate_fee && (order.affiliate_fee as number) > 0) {
      await sql`
          UPDATE users 
          SET affiliate_balance = affiliate_balance + ${order.affiliate_fee as number}
          WHERE id = ${order.affiliate_id as string}
        `;

      await sql`
          INSERT INTO transactions (
            user_id, type, reference_type, reference_id,
            amount, balance_type, description
          ) VALUES (
            ${order.affiliate_id as string},
            'affiliate',
            'order',
            ${orderId},
            ${order.affiliate_fee as number},
            'affiliate',
            ${'Affiliate commission from order ' + (order.order_number as string)}
          )
        `;
    }

    // Update order payment status
    await sql`
        UPDATE orders 
        SET 
          payment_status = 'released',
          released_at = NOW()
        WHERE id = ${orderId}
      `;

    // Send notification emails
    await sendEmail({
      to: order.publisher_email as string,
      subject: `Payment Released - Order ${order.order_number as string}`,
      html: `
        <h2>Payment Released!</h2>
        <p>Hi ${order.publisher_name as string},</p>
        <p>Your earnings for order <strong>${order.order_number as string}</strong> have been released to your account balance.</p>
        <p><strong>Amount: $${((order.publisher_earnings as number) / 100).toFixed(2)}</strong></p>
        <p>You can request a withdrawal from your publisher dashboard.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/publisher/earnings">View Earnings</a></p>
      `,
    });

    if (order.affiliate_id && order.affiliate_email) {
      await sendEmail({
        to: order.affiliate_email as string,
        subject: `Affiliate Commission - Order ${order.order_number as string}`,
        html: `
          <h2>Affiliate Commission Earned!</h2>
          <p>Hi ${order.affiliate_name as string},</p>
          <p>You've earned a commission from order <strong>${order.order_number as string}</strong>.</p>
          <p><strong>Commission: $${((order.affiliate_fee as number) / 100).toFixed(2)}</strong></p>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/affiliate/dashboard">View Dashboard</a></p>
        `,
      });
    }

    console.log(`Payment released successfully for order ${orderId}`);
  } catch (error) {
    console.error(`Error releasing payment for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Refund an order and update balances
 */
export async function refundOrder(
  orderId: string,
  reason: string
): Promise<void> {
  try {
    // Get order details
    const orderResult = await sql`
      SELECT 
        o.*,
        b.email as buyer_email,
        b.name as buyer_name
      FROM orders o
      JOIN users b ON o.buyer_id = b.id
      WHERE o.id = ${orderId}
    `;

    if (orderResult.rows.length === 0) {
      throw new Error(`Order ${orderId} not found`);
    }

    const order = orderResult.rows[0] as Record<string, unknown>;

    // Check if payment can be refunded
    if (order.payment_status === 'refunded') {
      console.log(`Order ${orderId} already refunded`);
      return;
    }

    if (!order.stripe_payment_intent_id) {
      throw new Error(`Order ${orderId} has no payment intent ID`);
    }

    // Create Stripe refund
    const refund = await createRefund(order.stripe_payment_intent_id as string);

    // Update order status
    await sql`
      UPDATE orders 
      SET 
        status = 'refunded',
        payment_status = 'refunded',
        cancelled_at = NOW(),
        cancellation_reason = ${reason}
      WHERE id = ${orderId}
    `;

    // Create transaction record
    await sql`
      INSERT INTO transactions (
        user_id, type, reference_type, reference_id,
        amount, balance_type, description,
        stripe_payment_intent_id
      ) VALUES (
        ${order.buyer_id as string},
        'refund',
        'order',
        ${orderId},
        ${order.total_amount as number},
        'buyer',
        ${'Refund for order ' + (order.order_number as string)},
        ${order.stripe_payment_intent_id as string}
      )
    `;

    // Send notification email
    await sendEmail({
      to: order.buyer_email as string,
      subject: `Order Refunded - ${order.order_number as string}`,
      html: `
        <h2>Order Refunded</h2>
        <p>Hi ${order.buyer_name as string},</p>
        <p>Your order <strong>${order.order_number as string}</strong> has been refunded.</p>
        <p><strong>Refund Amount: $${((order.total_amount as number) / 100).toFixed(2)}</strong></p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>The refund will appear in your account within 5-10 business days.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/buyer/orders">View Orders</a></p>
      `,
    });

    console.log(`Order ${orderId} refunded successfully. Refund ID: ${refund.id}`);
  } catch (error) {
    console.error(`Error refunding order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PS-${timestamp}-${random}`;
}
