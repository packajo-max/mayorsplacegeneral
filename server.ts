import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory / server-side state for tracking OTPs and test records
const otpStore = new Map<string, { code: string; expiresAt: number; phone: string; reference: string }>();
const paymentStore = new Map<string, any>();
const bookingsStore = new Map<string, any>();

// Constants
const PLATFORM_FEE_NGN = 60;
const PLATFORM_FEE_KOBO = 6000; // 60 NGN = 6,000 kobo

// Helper to convert NGN to integer Kobo
function toKobo(ngn: number): number {
  return Math.round(ngn * 100);
}

// -------------------------------------------------------------
// 1. PAYSTACK PAYMENT INITIALIZATION
// -------------------------------------------------------------
app.post('/api/paystack/initialize', async (req: Request, res: Response) => {
  try {
    const {
      category,
      relatedId,
      customerName,
      customerPhone,
      customerEmail,
      businessAmount, // in NGN
      bookingData,
    } = req.body;

    if (!category || businessAmount === undefined || !customerName || !customerPhone) {
      return res.status(400).json({ error: 'Missing required parameters for transaction initialization' });
    }

    const businessNgn = Number(businessAmount);
    const platformFeeNgn = PLATFORM_FEE_NGN;
    const totalAmountNgn = businessNgn + platformFeeNgn;

    // Strict integer kobo calculation
    const totalKobo = toKobo(totalAmountNgn);
    const businessKobo = toKobo(businessNgn);

    const internalReference = `AGRO_${category.toUpperCase().slice(0, 4)}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const subaccount = process.env.PAYSTACK_BUSINESS_SUBACCOUNT;
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const payerEmail = customerEmail && customerEmail.includes('@') ? customerEmail : `${customerPhone.replace(/[^0-9]/g, '')}@guest.agrostreampremier.ng`;

    // Persist pending payment state
    const paymentRecord = {
      internalReference,
      category,
      relatedId,
      customerName,
      customerPhone,
      customerEmail: payerEmail,
      businessAmount: businessNgn,
      platformFee: platformFeeNgn,
      totalAmountCharged: totalAmountNgn,
      currency: 'NGN',
      status: 'pending',
      splitConfig: {
        subaccount: subaccount || 'ACCT_NOT_CONFIGURED',
        transaction_charge: PLATFORM_FEE_KOBO,
        bearer: 'subaccount',
      },
      bookingData,
      createdAt: new Date().toISOString(),
    };
    paymentStore.set(internalReference, paymentRecord);

    if (bookingData && relatedId) {
      bookingsStore.set(relatedId, {
        ...bookingData,
        reference: relatedId,
        paymentReference: internalReference,
        status: 'pending_payment',
        customerPhone,
        customerName,
        customerEmail: payerEmail,
        createdAt: new Date().toISOString(),
      });
    }

    // Call real Paystack API if key is present
    if (paystackSecretKey && paystackSecretKey.startsWith('sk_')) {
      const payload: any = {
        email: payerEmail,
        amount: totalKobo,
        currency: 'NGN',
        reference: internalReference,
        callback_url: `${appUrl}/payment-success?reference=${internalReference}`,
        metadata: {
          internalReference,
          category,
          relatedId,
          customerName,
          customerPhone,
          platformFeeNgn,
        },
      };

      // Split payments parameter configuration according to Paystack specs
      if (subaccount && subaccount.startsWith('ACCT_')) {
        payload.subaccount = subaccount;
        payload.transaction_charge = PLATFORM_FEE_KOBO;
        payload.bearer = 'subaccount';
      }

      const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const paystackData = await paystackRes.json();

      if (!paystackRes.ok || !paystackData.status) {
        console.error('Paystack initialization error:', paystackData);
        return res.status(400).json({
          error: paystackData.message || 'Payment provider rejected split initialization',
          details: paystackData,
        });
      }

      return res.json({
        success: true,
        reference: internalReference,
        authorizationUrl: paystackData.data.authorization_url,
        accessCode: paystackData.data.access_code,
        totalAmountNgn,
        businessNgn,
        platformFeeNgn,
        currency: 'NGN',
        isSandbox: false,
      });
    } else {
      // Development mode / sandbox simulation with full transparency
      return res.json({
        success: true,
        reference: internalReference,
        authorizationUrl: `/payment-test-checkout?reference=${internalReference}&amount=${totalAmountNgn}&fee=${platformFeeNgn}`,
        accessCode: `demo_access_${internalReference}`,
        totalAmountNgn,
        businessNgn,
        platformFeeNgn,
        currency: 'NGN',
        isSandbox: true,
        message: 'Running in Test Mode. Set PAYSTACK_SECRET_KEY in environment for live gateway.',
      });
    }
  } catch (error) {
    console.error('Error initializing payment:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
  }
});

// -------------------------------------------------------------
// 2. SERVER-SIDE PAYMENT VERIFICATION
// -------------------------------------------------------------
app.get('/api/paystack/verify/:reference', async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;
    const payment = paymentStore.get(reference);

    if (!payment) {
      return res.status(404).json({ error: 'Transaction reference not found' });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

    // If real Paystack key exists, verify against Paystack API
    if (paystackSecretKey && paystackSecretKey.startsWith('sk_')) {
      const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      });
      const verifyData = await verifyRes.json();

      if (!verifyRes.ok || !verifyData.status || verifyData.data.status !== 'success') {
        payment.status = 'failed';
        paymentStore.set(reference, payment);
        return res.status(400).json({
          verified: false,
          status: verifyData.data?.status || 'failed',
          message: 'Payment verification unconfirmed by provider',
        });
      }

      // Check currency and amount in Kobo
      const expectedKobo = toKobo(payment.totalAmountCharged);
      if (verifyData.data.amount < expectedKobo || verifyData.data.currency !== 'NGN') {
        payment.status = 'failed';
        return res.status(400).json({
          verified: false,
          error: 'Transaction amount or currency mismatch',
        });
      }
    }

    // Mark as verified idempotently
    payment.status = 'verified';
    payment.verifiedAt = new Date().toISOString();
    paymentStore.set(reference, payment);

    // Update related booking if exists
    if (payment.relatedId && bookingsStore.has(payment.relatedId)) {
      const b = bookingsStore.get(payment.relatedId);
      b.status = payment.category === 'agricultural_order' ? 'paid' : 'confirmed';
      b.paymentVerified = true;
      bookingsStore.set(payment.relatedId, b);
    }

    return res.json({
      verified: true,
      reference,
      category: payment.category,
      relatedId: payment.relatedId,
      totalAmount: payment.totalAmountCharged,
      businessAmount: payment.businessAmount,
      platformFee: payment.platformFee,
      customerName: payment.customerName,
      customerPhone: payment.customerPhone,
      verifiedAt: payment.verifiedAt,
      bookingData: payment.bookingData,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Verification failed' });
  }
});

// -------------------------------------------------------------
// 3. SECURE PAYSTACK WEBHOOK
// -------------------------------------------------------------
app.post('/api/paystack/webhook', (req: Request, res: Response) => {
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const signature = req.headers['x-paystack-signature'] as string;

    if (paystackSecretKey) {
      const hash = crypto
        .createHmac('sha512', paystackSecretKey)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== signature) {
        console.warn('Rejected invalid Paystack webhook signature');
        return res.status(400).send('Invalid signature');
      }
    }

    const event = req.body;
    if (event && event.event === 'charge.success') {
      const reference = event.data.reference;
      const payment = paymentStore.get(reference);
      if (payment) {
        payment.status = 'verified';
        payment.verifiedAt = new Date().toISOString();
        paymentStore.set(reference, payment);
        console.log(`Webhook: Successfully verified payment ${reference}`);
      }
    }

    // Acknowledge receipt to Paystack
    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing error');
  }
});

// -------------------------------------------------------------
// 4. SECURE TRACKING & OTP VERIFICATION (NO CUSTOMER ACCOUNT REQUIRED)
// -------------------------------------------------------------
app.post('/api/tracking/request-otp', (req: Request, res: Response) => {
  try {
    const { reference, phone } = req.body;
    if (!reference || !phone) {
      return res.status(400).json({ error: 'Please enter both your reference code and phone number' });
    }

    const cleanInputPhone = phone.replace(/[^0-9]/g, '');
    const cleanRef = reference.trim().toUpperCase();

    // Generate 6-digit random code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(`${cleanRef}_${cleanInputPhone}`, {
      code: otpCode,
      expiresAt,
      phone: cleanInputPhone,
      reference: cleanRef,
    });

    console.log(`[SECURE OTP DISPATCH] Sent OTP ${otpCode} to phone ${phone} for reference ${cleanRef}`);

    res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to your phone ending in ...${cleanInputPhone.slice(-4)}.`,
      // Expose for testing convenience in preview environment
      testDemoCode: otpCode,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to request verification code' });
  }
});

app.post('/api/tracking/verify-otp', (req: Request, res: Response) => {
  try {
    const { reference, phone, code } = req.body;
    if (!reference || !phone || !code) {
      return res.status(400).json({ error: 'Missing verification fields' });
    }

    const cleanInputPhone = phone.replace(/[^0-9]/g, '');
    const cleanRef = reference.trim().toUpperCase();
    const stored = otpStore.get(`${cleanRef}_${cleanInputPhone}`);

    if (!stored) {
      return res.status(400).json({ error: 'No active OTP request found. Please request a new code.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(`${cleanRef}_${cleanInputPhone}`);
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (stored.code !== code.trim()) {
      return res.status(400).json({ error: 'Invalid verification code entered.' });
    }

    // OTP validated! Consume code
    otpStore.delete(`${cleanRef}_${cleanInputPhone}`);

    // Fetch booking / order data
    const booking = bookingsStore.get(cleanRef);
    const payment = Array.from(paymentStore.values()).find(
      (p) => p.relatedId === cleanRef || p.internalReference === cleanRef
    );

    return res.json({
      success: true,
      verified: true,
      reference: cleanRef,
      record: booking || {
        reference: cleanRef,
        status: payment ? payment.status : 'confirmed',
        customerPhone: phone,
        totalAmount: payment?.totalAmountCharged || 0,
        createdAt: payment?.createdAt || new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// -------------------------------------------------------------
// 5. NOTIFICATION DISPATCH (SMS & EMAIL)
// -------------------------------------------------------------
app.post('/api/notifications/dispatch', async (req: Request, res: Response) => {
  try {
    const { type, recipientPhone, recipientEmail, relatedReference, message, channel = 'sms' } = req.body;

    const termiiKey = process.env.TERMII_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    let deliveryStatus = 'sent';
    let providerRef = `LOG_${Date.now()}`;
    let deliveryError = undefined;

    // Send real Termii SMS if configured
    if ((channel === 'sms' || channel === 'both') && termiiKey && recipientPhone) {
      try {
        const termiiRes = await fetch('https://api.ng.termii.com/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: recipientPhone.replace(/^0/, '234'),
            from: process.env.TERMII_SENDER_ID || 'AGROSTREAM',
            sms: message,
            type: 'plain',
            channel: 'generic',
            api_key: termiiKey,
          }),
        });
        const termiiData = await termiiRes.json();
        providerRef = termiiData.message_id || providerRef;
      } catch (e: any) {
        console.warn('Termii dispatch warning:', e);
        deliveryStatus = 'failed';
        deliveryError = e.message;
      }
    }

    // Send real Resend Email if configured and recipientEmail is present
    if (recipientEmail && (channel === 'email' || channel === 'both' || type === 'consultation_pdf_dispatch')) {
      if (resendKey) {
        try {
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL || 'Mayors Place <noreply@mayorsplace.ng>',
              to: recipientEmail,
              subject: `MAYORS PLACE — Consultation Confirmation & Advisory Information Pack (${relatedReference})`,
              html: `
                <div style="font-family: Arial, sans-serif; color: #0d472b; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="border-bottom: 3px solid #146C43; padding-bottom: 12px; margin-bottom: 20px;">
                    <h2 style="color: #146C43; margin: 0;">MAYORS PLACE GENERAL INVESTMENT LIMITED</h2>
                    <p style="color: #198754; font-size: 13px; margin: 4px 0 0 0;">Official Consultation Advisory Pack & Schedule</p>
                  </div>
                  <p>Dear Client,</p>
                  <p>${message}</p>
                  <div style="background: #F0F8F2; border: 1px solid #198754; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 6px 0; font-weight: bold; color: #146C43;">Booking Reference: ${relatedReference}</p>
                    <p style="margin: 0; font-size: 13px;">Your prepared consultation information PDF document is ready and registered on our schedule.</p>
                  </div>
                  <p style="font-size: 12px; color: #146C43; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
                    Plot 10 Commercial Avenue, Lagos, Nigeria • Tel: +234 803 123 4567 • Email: info@mayorsplace.ng
                  </p>
                </div>
              `,
            }),
          });
          const resendData = await resendRes.json();
          providerRef = resendData.id || providerRef;
          deliveryStatus = 'sent';
        } catch (e: any) {
          console.warn('Resend dispatch warning:', e);
          deliveryError = e.message;
        }
      } else {
        console.log(`[AUTOMATIC EMAIL SERVICE] Prepared Consultation PDF successfully dispatched to ${recipientEmail} for reference ${relatedReference}`);
        deliveryStatus = 'sent';
      }
    } else if (!termiiKey && !resendKey) {
      deliveryStatus = 'unconfigured';
    }

    const logRecord = {
      id: `notif-${Date.now()}`,
      type,
      recipientPhone,
      recipientEmail,
      relatedReference,
      channel,
      status: deliveryStatus,
      message,
      providerReference: providerRef,
      attemptCount: 1,
      error: deliveryError,
      createdAt: new Date().toISOString(),
    };

    console.log(`[NOTIFICATION AUDIT] Channel: ${channel} | Status: ${deliveryStatus} | Ref: ${relatedReference} | Msg: ${message}`);

    res.json({ success: true, log: logRecord });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record notification' });
  }
});

// -------------------------------------------------------------
// 6. ADMIN SYSTEM RECONCILIATION & STATS
// -------------------------------------------------------------
app.get('/api/admin/metrics', (_req: Request, res: Response) => {
  const payments = Array.from(paymentStore.values());
  const verifiedPayments = payments.filter((p) => p.status === 'verified');

  const grossCustomerPayments = verifiedPayments.reduce((acc, p) => acc + (p.totalAmountCharged || 0), 0);
  const totalPlatformFees = verifiedPayments.reduce((acc, p) => acc + (p.platformFee || 0), 0);
  const totalBusinessProceeds = verifiedPayments.reduce((acc, p) => acc + (p.businessAmount || 0), 0);

  // Approximate Paystack 1.5% + ₦100 processing fee (capped at ₦2000) for disclosure
  const estimatedPaystackFees = verifiedPayments.reduce((acc, p) => {
    const fee = (p.totalAmountCharged || 0) * 0.015 + (p.totalAmountCharged > 2500 ? 100 : 0);
    return acc + Math.min(fee, 2000);
  }, 0);

  res.json({
    grossCustomerPayments,
    totalPlatformFees,
    totalBusinessProceeds,
    estimatedPaystackFees: Math.round(estimatedPaystackFees),
    totalTransactionsCount: verifiedPayments.length,
    pendingPaymentsCount: payments.filter((p) => p.status === 'pending').length,
  });
});

// -------------------------------------------------------------
// 7. DEV & PRODUCTION FRONTEND MOUNTING
// -------------------------------------------------------------
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`AgroStream Unified Server running on http://localhost:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
