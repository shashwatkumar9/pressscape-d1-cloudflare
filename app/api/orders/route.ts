export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';
import { sql, generateId, intToBool } from '@/lib/db';
import { initializeDatabaseFromContext } from '@/lib/cloudflare';
import { cookies } from 'next/headers';
import { sendOrderPlacedBuyerEmail, sendNewOrderPublisherEmail } from '@/lib/email';



async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get('auth_session')?.value;
  if (!sessionId) return null;

  const now = new Date().toISOString();
  const result = await sql`
    SELECT s.*, u.* FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ${sessionId} AND s.expires_at > ${now}
  `;
  return result.rows[0] || null;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize D1 database
    await initializeDatabaseFromContext();

    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Please log in to place an order' }, { status: 401 });
    }

    const body = await request.json() as any;
    const {
      website_id,
      order_type,
      title,
      content,
      anchor_text,
      target_url,
      amount,
      campaign_id,
      contributor_id  // NEW: Selected contributor for writing
    } = body;

    // Validate required fields
    if (!website_id || !order_type || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get website details with owner info
    const websiteResult = await sql`
      SELECT w.*, u.email as publisher_email, u.name as publisher_name
      FROM websites w
      JOIN users u ON w.owner_id = u.id
      WHERE w.id = ${website_id} AND w.is_active = true
    `;

    if (websiteResult.rows.length === 0) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    const website = websiteResult.rows[0] as Record<string, unknown>;

    // Validate and get contributor if specified
    let selectedContributor: Record<string, unknown> | null = null;
    let contributorEarnings = 0;
    let contentSource = 'buyer_provided';

    if (contributor_id) {
      const contributorResult = await sql`
        SELECT wc.*, u.name as contributor_name, u.email as contributor_email
        FROM website_contributors wc
        JOIN users u ON wc.user_id = u.id
        WHERE wc.id = ${contributor_id} 
          AND wc.website_id = ${website_id}
          AND wc.is_active = true 
          AND wc.is_approved = true
      `;

      if (contributorResult.rows.length === 0) {
        return NextResponse.json({ error: 'Selected contributor not found or not available' }, { status: 400 });
      }

      selectedContributor = contributorResult.rows[0] as Record<string, unknown>;
      contributorEarnings = selectedContributor.writing_price as number;
      contentSource = 'contributor_writes';
    }

    // Calculate fees
    // amount is total paid by buyer (includes 25% markup)
    // base_price is the publisher's price (amount / 1.25 = amount * 0.8)
    const base_price = Math.round(amount * 0.8);
    const platform_fee = amount - base_price;

    // Publisher earnings = base_price - contributor_earnings (if any)
    const publisher_earnings = base_price - contributorEarnings;

    // Create order (D1 pattern: generate ID first, insert, then select)
    const orderId = generateId();
    const orderNumber = 'PS-' + generateId().substring(0, 8);
    const now = new Date().toISOString();

    await sql`
      INSERT INTO orders (
        id, order_number, buyer_id, website_id, publisher_id,
        order_type, status, base_price, subtotal, platform_fee, total_amount, publisher_earnings,
        article_title, article_content, anchor_text, target_url,
        turnaround_days, campaign_id, created_at,
        content_source, selected_contributor_id, contributor_id, contributor_earnings
      ) VALUES (
        ${orderId},
        ${orderNumber},
        ${session.user_id as string},
        ${website_id},
        ${website.owner_id as string},
        ${order_type},
        'pending',
        ${base_price},
        ${base_price},
        ${platform_fee},
        ${amount},
        ${publisher_earnings},
        ${title || null},
        ${content || null},
        ${anchor_text || 'Click Here'},
        ${target_url || 'https://example.com'},
        ${selectedContributor ? (selectedContributor.turnaround_days as number) : (website.turnaround_days as number || 3)},
        ${campaign_id || null},
        ${now},
        ${contentSource},
        ${contributor_id || null},
        ${selectedContributor ? (selectedContributor.user_id as string) : null},
        ${contributorEarnings}
      )
    `;

    // Fetch the created order
    const orderResult = await sql`SELECT * FROM orders WHERE id = ${orderId}`;
    const order = orderResult.rows[0] as Record<string, unknown>;

    // Send email notifications (fire and forget)
    sendOrderPlacedBuyerEmail(
      session.email as string,
      session.name as string,
      order.order_number as string,
      website.domain as string,
      amount
    ).catch(console.error);

    sendNewOrderPublisherEmail(
      website.publisher_email as string,
      website.publisher_name as string,
      order.order_number as string,
      website.domain as string,
      session.name as string,
      publisher_earnings
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      order: orderResult.rows[0],
      contributor: selectedContributor ? {
        id: selectedContributor.id,
        name: selectedContributor.contributor_name,
        writing_price: selectedContributor.writing_price
      } : null
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
