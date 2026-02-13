import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'PressScape <noreply@pressscape.com>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  const client = getResend();

  if (!client) {
    console.log('[Email] Resend API key not configured. Would send:', options.subject, 'to', options.to);
    return { success: true, mock: true };
  }

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('[Email] Error sending:', error);
      return { success: false, error };
    }

    console.log('[Email] Sent:', options.subject, 'to', options.to);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Email] Exception:', err);
    return { success: false, error: err };
  }
}

// ============================================
// Email Templates
// ============================================

function baseTemplate(content: string, preheader?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:bold;">PressScape</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#6b7280;font-size:14px;">
                © ${new Date().getFullYear()} PressScape. All rights reserved.
              </p>
              <p style="margin:8px 0 0;color:#9ca3af;font-size:12px;">
                <a href="${APP_URL}" style="color:#7c3aed;text-decoration:none;">Visit Website</a> · 
                <a href="${APP_URL}/help" style="color:#7c3aed;text-decoration:none;">Help Center</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

function buttonStyle() {
  return 'display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;';
}

// ============================================
// AUTH EMAILS
// ============================================

export async function sendWelcomeEmail(to: string, name: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Welcome to PressScape, ${name}! 🎉</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Thank you for joining our marketplace. You're now part of a community connecting quality publishers with content buyers.
    </p>
    <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;">
      Get started by exploring our marketplace or adding your first website.
    </p>
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/marketplace" style="${buttonStyle()}">Explore Marketplace</a>
    </p>
  `;
  return sendEmail({ to, subject: 'Welcome to PressScape! 🎉', html: baseTemplate(content) });
}

export async function sendPasswordResetEmail(to: string, name: string, resetToken: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`;
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Reset Your Password</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, we received a request to reset your password. Click the button below to choose a new one:
    </p>
    <p style="margin:0 0 24px;text-align:center;">
      <a href="${resetUrl}" style="${buttonStyle()}">Reset Password</a>
    </p>
    <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>
    <p style="margin:0;color:#9ca3af;font-size:12px;word-break:break-all;">
      ${resetUrl}
    </p>
  `;
  return sendEmail({ to, subject: 'Reset Your Password - PressScape', html: baseTemplate(content) });
}

export async function sendPasswordChangedEmail(to: string, name: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Password Changed Successfully</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, your password has been successfully changed.
    </p>
    <p style="margin:0;color:#6b7280;font-size:14px;">
      If you didn't make this change, please contact our support team immediately.
    </p>
  `;
  return sendEmail({ to, subject: 'Password Changed - PressScape', html: baseTemplate(content) });
}

// ============================================
// BUYER ORDER EMAILS
// ============================================

export async function sendOrderPlacedBuyerEmail(to: string, name: string, orderNumber: string, websiteDomain: string, amount: number) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Order Confirmed! 🎉</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, your order has been placed successfully.
    </p>
    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Order Number</p>
      <p style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:600;">${orderNumber}</p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Website</p>
      <p style="margin:0 0 16px;color:#111827;font-size:16px;">${websiteDomain}</p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Amount</p>
      <p style="margin:0;color:#059669;font-size:20px;font-weight:600;">$${(amount / 100).toFixed(2)}</p>
    </div>
    <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;">
      The publisher will review your order and accept it shortly. You'll receive an email when accepted.
    </p>
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/buyer/orders" style="${buttonStyle()}">View Order</a>
    </p>
  `;
  return sendEmail({ to, subject: `Order Confirmed - ${orderNumber}`, html: baseTemplate(content) });
}

export async function sendOrderAcceptedBuyerEmail(to: string, name: string, orderNumber: string, websiteDomain: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Order Accepted! ✅</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, great news! The publisher has accepted your order for <strong>${websiteDomain}</strong>.
    </p>
    <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #22c55e;">
      <p style="margin:0;color:#166534;font-size:16px;">
        Order <strong>${orderNumber}</strong> is now in progress.
      </p>
    </div>
    <p style="margin:0 0 24px;color:#4b5563;font-size:16px;line-height:1.6;">
      The publisher will work on your order and notify you when it's ready for review.
    </p>
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/buyer/orders" style="${buttonStyle()}">Track Order</a>
    </p>
  `;
  return sendEmail({ to, subject: `Order Accepted - ${orderNumber}`, html: baseTemplate(content) });
}

export async function sendOrderCompletedBuyerEmail(to: string, name: string, orderNumber: string, websiteDomain: string, publishedUrl: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Order Completed! 🎉</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, your guest post on <strong>${websiteDomain}</strong> is now live!
    </p>
    <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #22c55e;">
      <p style="margin:0 0 8px;color:#166534;font-size:14px;">Published URL:</p>
      <p style="margin:0;"><a href="${publishedUrl}" style="color:#7c3aed;font-size:16px;">${publishedUrl}</a></p>
    </div>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Your link comes with a <strong>90-day warranty</strong>. If removed within this period, you're eligible for a refund.
    </p>
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/buyer/orders" style="${buttonStyle()}">View Order</a>
    </p>
  `;
  return sendEmail({ to, subject: `Order Completed - ${orderNumber}`, html: baseTemplate(content) });
}

export async function sendRevisionRequestedEmail(to: string, name: string, orderNumber: string, notes: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Revision Requested</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, the buyer has requested changes to order <strong>${orderNumber}</strong>.
    </p>
    <div style="background:#fef3c7;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #f59e0b;">
      <p style="margin:0 0 8px;color:#92400e;font-size:14px;font-weight:600;">Requested Changes:</p>
      <p style="margin:0;color:#78350f;font-size:14px;">${notes}</p>
    </div>
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/publisher/orders" style="${buttonStyle()}">View Order</a>
    </p>
  `;
  return sendEmail({ to, subject: `Revision Requested - ${orderNumber}`, html: baseTemplate(content) });
}

// ============================================
// PUBLISHER ORDER EMAILS
// ============================================

export async function sendNewOrderPublisherEmail(to: string, name: string, orderNumber: string, websiteDomain: string, buyerName: string, amount: number) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">New Order Received! 💰</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, you have a new order for <strong>${websiteDomain}</strong>.
    </p>
    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Order Number</p>
      <p style="margin:0 0 16px;color:#111827;font-size:18px;font-weight:600;">${orderNumber}</p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Buyer</p>
      <p style="margin:0 0 16px;color:#111827;font-size:16px;">${buyerName}</p>
      <p style="margin:0 0 8px;color:#6b7280;font-size:14px;">Your Earnings</p>
      <p style="margin:0;color:#059669;font-size:20px;font-weight:600;">$${(amount / 100).toFixed(2)}</p>
    </div>
    <p style="margin:0 0 16px;color:#6b7280;font-size:14px;">
      Note: Earnings are released 90 days after order completion.
    </p>
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/publisher/orders" style="${buttonStyle()}">Accept Order</a>
    </p>
  `;
  return sendEmail({ to, subject: `New Order - ${orderNumber}`, html: baseTemplate(content) });
}

export async function sendOrderCancelledPublisherEmail(to: string, name: string, orderNumber: string, reason: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Order Cancelled</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, order <strong>${orderNumber}</strong> has been cancelled.
    </p>
    <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #ef4444;">
      <p style="margin:0 0 8px;color:#991b1b;font-size:14px;font-weight:600;">Reason:</p>
      <p style="margin:0;color:#7f1d1d;font-size:14px;">${reason || 'No reason provided'}</p>
    </div>
  `;
  return sendEmail({ to, subject: `Order Cancelled - ${orderNumber}`, html: baseTemplate(content) });
}

// ============================================
// WEBSITE EMAILS
// ============================================

export async function sendWebsiteSubmittedEmail(to: string, name: string, domain: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Website Submitted for Review</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, your website <strong>${domain}</strong> has been submitted for review.
    </p>
    <div style="background:#fef3c7;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #f59e0b;">
      <p style="margin:0;color:#92400e;font-size:14px;">
        Our team will review your website within 24-48 hours. You'll receive an email once approved.
      </p>
    </div>
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/publisher/websites" style="${buttonStyle()}">View Status</a>
    </p>
  `;
  return sendEmail({ to, subject: `Website Submitted - ${domain}`, html: baseTemplate(content) });
}

export async function sendWebsiteApprovedEmail(to: string, name: string, domain: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Website Approved! 🎉</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, great news! Your website <strong>${domain}</strong> has been approved and is now live on the marketplace.
    </p>
    <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #22c55e;">
      <p style="margin:0;color:#166534;font-size:14px;">
        Buyers can now find and order guest posts on your website. Make sure your pricing and turnaround times are up to date.
      </p>
    </div>
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/publisher/websites" style="${buttonStyle()}">Manage Website</a>
    </p>
  `;
  return sendEmail({ to, subject: `Website Approved - ${domain}`, html: baseTemplate(content) });
}

export async function sendWebsiteRejectedEmail(to: string, name: string, domain: string, reason: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Website Not Approved</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, unfortunately your website <strong>${domain}</strong> was not approved.
    </p>
    <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #ef4444;">
      <p style="margin:0 0 8px;color:#991b1b;font-size:14px;font-weight:600;">Reason:</p>
      <p style="margin:0;color:#7f1d1d;font-size:14px;">${reason || 'Does not meet our quality guidelines'}</p>
    </div>
    <p style="margin:0;color:#4b5563;font-size:14px;">
      You can resubmit after addressing the issues. Contact support if you have questions.
    </p>
  `;
  return sendEmail({ to, subject: `Website Not Approved - ${domain}`, html: baseTemplate(content) });
}

// ============================================
// PAYOUT EMAILS
// ============================================

export async function sendPayoutAvailableEmail(to: string, name: string, amount: number) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Earnings Available! 💰</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, you have earnings available for withdrawal.
    </p>
    <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 8px;color:#166534;font-size:14px;">Available Balance</p>
      <p style="margin:0;color:#059669;font-size:32px;font-weight:700;">$${(amount / 100).toFixed(2)}</p>
    </div>
    <p style="margin:0;text-align:center;">
      <a href="${APP_URL}/publisher/earnings" style="${buttonStyle()}">Request Payout</a>
    </p>
  `;
  return sendEmail({ to, subject: 'Earnings Available for Withdrawal', html: baseTemplate(content) });
}

export async function sendPayoutProcessedEmail(to: string, name: string, amount: number) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Payout Processed! ✅</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, your payout has been processed successfully.
    </p>
    <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 8px;color:#166534;font-size:14px;">Amount Sent</p>
      <p style="margin:0;color:#059669;font-size:32px;font-weight:700;">$${(amount / 100).toFixed(2)}</p>
    </div>
    <p style="margin:0;color:#6b7280;font-size:14px;text-align:center;">
      Funds typically arrive within 1-3 business days depending on your bank.
    </p>
  `;
  return sendEmail({ to, subject: 'Payout Processed', html: baseTemplate(content) });
}

// ============================================
// REFUND EMAILS
// ============================================

export async function sendRefundApprovedEmail(to: string, name: string, orderNumber: string, amount: number) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Refund Approved</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, your refund request for order <strong>${orderNumber}</strong> has been approved.
    </p>
    <div style="background:#f0fdf4;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
      <p style="margin:0 0 8px;color:#166534;font-size:14px;">Refund Amount</p>
      <p style="margin:0;color:#059669;font-size:24px;font-weight:700;">$${(amount / 100).toFixed(2)}</p>
    </div>
    <p style="margin:0;color:#6b7280;font-size:14px;">
      The refund will be processed within 5-10 business days to your original payment method.
    </p>
  `;
  return sendEmail({ to, subject: `Refund Approved - ${orderNumber}`, html: baseTemplate(content) });
}

export async function sendRefundRejectedEmail(to: string, name: string, orderNumber: string, reason: string) {
  const content = `
    <h2 style="margin:0 0 16px;color:#111827;font-size:24px;">Refund Request Declined</h2>
    <p style="margin:0 0 16px;color:#4b5563;font-size:16px;line-height:1.6;">
      Hi ${name}, your refund request for order <strong>${orderNumber}</strong> has been reviewed.
    </p>
    <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:20px 0;border-left:4px solid #ef4444;">
      <p style="margin:0 0 8px;color:#991b1b;font-size:14px;font-weight:600;">Reason:</p>
      <p style="margin:0;color:#7f1d1d;font-size:14px;">${reason || 'Does not meet refund criteria'}</p>
    </div>
    <p style="margin:0;color:#6b7280;font-size:14px;">
      If you believe this decision is incorrect, please contact our support team.
    </p>
  `;
  return sendEmail({ to, subject: `Refund Request Declined - ${orderNumber}`, html: baseTemplate(content) });
}
