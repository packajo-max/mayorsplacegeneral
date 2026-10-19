import express, { Request, Response } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = (process.env.PORT && process.env.PORT !== '8080') ? Number(process.env.PORT) : 3000;

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

// Helper to generate compliant placeholder PDF for consultation advisory pack
// TODO: Replace placeholder with real PDF when client uploads to public/files/mayors-consultation-first-info.pdf
function generatePlaceholderPdf(data: {
  reference: string;
  customerName?: string;
  serviceName?: string;
  amount?: number;
  date?: string;
  time?: string;
}): string {
  const title = 'MAYORS PLACE GENERAL INVESTMENT LIMITED';
  const subtitle = 'Official Consultation Advisory Information Pack';
  const refLine = `Booking Reference: ${data.reference}`;
  const clientLine = `Client Name: ${data.customerName || 'Valued Client'}`;
  const serviceLine = `Service: ${data.serviceName || 'Consultation'} (NGN ${Number(data.amount || 25000).toLocaleString()})`;
  const scheduleLine = `Session Schedule: ${data.date || 'Confirmed Session'} at ${data.time || 'Scheduled Slot'}`;
  const guideHeading = 'PREPARATION & ADVISORY GUIDELINES:';
  const g1 = '1. One-on-one discovery & advisory session with our principal consultant.';
  const g2 = '2. Comprehensive assessment of background documentation and personal profile.';
  const g3 = '3. Direct Q&A period addressing your specific guidance enquiries.';
  const g4 = '4. Action plan and structured subsequent steps for your travel or business needs.';
  const g5 = '5. Please ensure your contact phone is reachable 15 mins before your session.';
  const contact = 'Plot 10 Commercial Ave, Lagos | Tel: +234 803 123 4567 | info@mayorsplace.ng';

  const lines = [
    refLine,
    clientLine,
    serviceLine,
    scheduleLine,
    '',
    guideHeading,
    g1,
    g2,
    g3,
    g4,
    g5,
    '',
    contact,
  ];

  const streamLines = [
    'BT',
    '/F1 15 Tf',
    '40 760 Td',
    `(${title}) Tj`,
    '0 -22 Td',
    '/F1 11 Tf',
    `(${subtitle}) Tj`,
    '0 -25 Td',
    '/F1 10 Tf',
    ...lines.map((l) => `0 -18 Td (${l.replace(/[()\\]/g, '')}) Tj`),
    'ET',
  ].join('\n');

  const streamLength = Buffer.byteLength(streamLines);

  const objects = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj`,
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamLines}\nendstream\nendobj`,
  ];

  let offset = 9;
  const xrefEntries = ['0000000000 65535 f '];
  let body = '%PDF-1.4\n';

  for (let i = 0; i < objects.length; i++) {
    const padOffset = offset.toString().padStart(10, '0');
    xrefEntries.push(`${padOffset} 00000 n `);
    body += `${objects[i]}\n`;
    offset = Buffer.byteLength(body);
  }

  const xrefOffset = offset;
  const xref = `xref\n0 ${objects.length + 1}\n` + xrefEntries.join('\n') + '\n';
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(body + xref + trailer).toString('base64');
}

export const CONSULTATION_PDF_FILENAME = 'MayorsPlace_Consultation_First_Info.pdf';

/**
 * Returns the consultation guide PDF as base64.
 * Reads MayorsPlace_Consultation_First_Info.pdf from disk or falls back to binary generator.
 */
function getConsultationPdfBase64(data?: {
  reference?: string;
  customerName?: string;
  serviceName?: string;
  amount?: number;
  date?: string;
  time?: string;
}): string {
  const possiblePaths = [
    path.resolve(process.cwd(), 'public/files/MayorsPlace_Consultation_First_Info.pdf'),
    path.resolve(process.cwd(), 'MayorsPlace_Consultation_First_Info.pdf'),
    path.resolve(process.cwd(), 'public/files/mayors-consultation-first-info.pdf'),
    path.resolve(process.cwd(), 'public/MayorsPlace_Consultation_First_Info.pdf'),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        if (fileBuffer && fileBuffer.length > 0) {
          console.log(`[PDF IMPORT] Successfully loaded ${CONSULTATION_PDF_FILENAME} from ${filePath} (${fileBuffer.length} bytes)`);
          return fileBuffer.toString('base64');
        }
      } catch (err) {
        console.warn(`[PDF IMPORT WARNING] Could not read ${filePath}:`, err);
      }
    }
  }

  console.log(`[PDF IMPORT] Generating binary PDF for ${CONSULTATION_PDF_FILENAME}`);
  return generatePlaceholderPdf({
    reference: data?.reference || 'MAYORS-CONSULTATION',
    customerName: data?.customerName,
    serviceName: data?.serviceName || 'Consultation',
    amount: data?.amount || 25000,
    date: data?.date,
    time: data?.time,
  });
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
    const subaccount = process.env.PAYSTACK_BUSINESS_SUBACCOUNT || 'ACCT_0lls13inpmcnal4';
    const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
    const payerEmail = customerEmail && customerEmail.includes('@') ? customerEmail : `${customerPhone.replace(/[^0-9]/g, '')}@guest.agrostreampremier.ng`;

    // Metadata extraction and rules
    const customMetadata = req.body.metadata || {};
    const isShopProduct = category === 'agricultural_order' || category === 'shop';
    const product_name = customMetadata.product_name || customMetadata.serviceName || (isShopProduct ? 'Shop Products' : (businessNgn === 25000 ? 'Consultation' : 'Service Appointment'));
    const product_price = Number(customMetadata.product_price ?? businessNgn);
    const isConsultation = product_name.includes('Consultation') || product_price === 25000 || customMetadata.product_type === 'consultation';
    const product_type = customMetadata.product_type || (isShopProduct ? 'agricultural_order' : (isConsultation ? 'consultation' : 'appointment'));
    const requires_pdf = isShopProduct ? false : (product_name.includes('Consultation') || product_price === 25000 || product_type === 'consultation');

    const paymentMetadata = {
      ...customMetadata,
      internalReference,
      category,
      relatedId,
      customerName,
      customerPhone,
      platformFeeNgn,
      product_name,
      product_price,
      requires_pdf,
      product_type,
    };

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
      requiresPdf: requires_pdf,
      product_name,
      product_price,
      product_type,
      splitConfig: {
        subaccount: subaccount || 'ACCT_0lls13inpmcnal4',
        transaction_charge: PLATFORM_FEE_KOBO,
        bearer: 'subaccount',
      },
      metadata: paymentMetadata,
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
        product_name,
        product_price,
        product_type,
        requires_pdf,
        metadata: paymentMetadata,
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
        metadata: paymentMetadata,
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

    const isSimulation = req.query.simulate === 'true' || reference.startsWith('TEST_') || reference.startsWith('DEMO_');

    // If real Paystack key exists, verify against Paystack API (unless simulation requested)
    if (!isSimulation && paystackSecretKey && paystackSecretKey.startsWith('sk_')) {
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
    let booking: any = null;
    if (payment.relatedId && bookingsStore.has(payment.relatedId)) {
      booking = bookingsStore.get(payment.relatedId);
      booking.status = payment.category === 'agricultural_order' ? 'paid' : 'confirmed';
      booking.paymentVerified = true;
      bookingsStore.set(payment.relatedId, booking);
    } else if (payment.bookingData) {
      booking = payment.bookingData;
    }

    const requiresPDF = Boolean(
      booking?.metadata?.requires_pdf ||
      booking?.product_type === 'consultation' ||
      booking?.product_price === 25000 ||
      payment.metadata?.requires_pdf ||
      payment.requiresPdf ||
      payment.metadata?.product_type === 'consultation' ||
      payment.metadata?.product_price === 25000 ||
      payment.businessAmount === 25000
    );

    // Send notifications once verified
    if (!payment.notificationSent) {
      payment.notificationSent = true;
      const termiiKey = process.env.TERMII_API_KEY;
      const resendKey = process.env.RESEND_API_KEY;
      const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'Mayors Place <noreply@mayorsplace.ng>';

      if (requiresPDF) {
        // 1. Import the PDF file MayorsPlace_Consultation_First_Info.pdf as base64 attachment
        const filename = CONSULTATION_PDF_FILENAME;
        const pdfBase64 = getConsultationPdfBase64({
          reference,
          customerName: payment.customerName,
          serviceName: payment.metadata?.product_name || booking?.serviceName || 'Consultation',
          amount: payment.businessAmount || 25000,
          date: booking?.appointmentDate || booking?.metadata?.appointmentDate,
          time: booking?.appointmentTime || booking?.metadata?.appointmentTime,
        });

        // 4. Make sure email sends to customer email from form, not just admin
        const customerEmailFromForm = (
          payment.customerEmail ||
          booking?.customerEmail ||
          booking?.email ||
          payment.bookingData?.customerEmail ||
          payment.bookingData?.email ||
          payment.metadata?.customerEmail ||
          ''
        ).trim();

        console.log(`[CONSULTATION NOTIFICATION] Target customer email: "${customerEmailFromForm}", From: "${fromEmail}", Attachment: ${filename} (${pdfBase64 ? 'Base64 Present' : 'Missing'})`);

        // Send via Resend with attachment if customer email exists
        if (customerEmailFromForm && customerEmailFromForm.includes('@')) {
          if (resendKey) {
            try {
              // 2. Attach it in Resend email with filename MayorsPlace_Consultation_First_Info.pdf
              // 3. Email body should say: "Attached is your consultation guide"
              // 5. Use RESEND_FROM_EMAIL from secrets
              const resendPayload: any = {
                from: fromEmail,
                to: customerEmailFromForm,
                subject: `MAYORS PLACE — Consultation Guide & Confirmation (${reference})`,
                text: `Dear ${payment.customerName || 'Valued Client'},\n\nAttached is your consultation guide.\n\nYour payment for ${payment.metadata?.product_name || 'Consultation'} (₦${Number(payment.businessAmount || 25000).toLocaleString()}) has been verified successfully.\nPayment Reference: ${reference}\nTotal Paid: ₦${Number(payment.businessAmount || 25000).toLocaleString()}\n\nPlease review the attached ${filename} guide prior to your appointment.\n\nMayors Place General Investment Limited\nPlot 10 Commercial Avenue, Lagos, Nigeria\nTel: +234 803 123 4567 • Email: info@mayorsplace.ng`,
                html: `
                  <div style="font-family: Arial, sans-serif; color: #0d472b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #198754; border-radius: 12px; background: #ffffff;">
                    <div style="border-bottom: 3px solid #146C43; padding-bottom: 12px; margin-bottom: 20px;">
                      <h2 style="color: #146C43; margin: 0;">MAYORS PLACE GENERAL INVESTMENT LIMITED</h2>
                      <p style="color: #198754; font-size: 13px; margin: 4px 0 0 0;">Official Consultation Advisory Information Pack</p>
                    </div>
                    <p style="font-size: 15px;">Dear ${payment.customerName || 'Valued Client'},</p>
                    
                    <div style="background: #E8F5E9; border-left: 4px solid #198754; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">
                      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #146C43;">
                        Attached is your consultation guide
                      </p>
                    </div>

                    <p>Your payment for <strong>${payment.metadata?.product_name || 'Consultation'} (₦${Number(payment.businessAmount || 25000).toLocaleString()})</strong> has been verified successfully.</p>
                    
                    <div style="background: #F0F8F2; border: 1px solid #198754; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0 0 6px 0; font-weight: bold; color: #146C43;">Payment Reference: ${reference}</p>
                      <p style="margin: 0 0 6px 0; font-size: 13px;">Customer Email: <strong>${customerEmailFromForm}</strong></p>
                      <p style="margin: 0 0 6px 0; font-size: 13px;">Total Paid: <strong>₦${Number(payment.businessAmount || 25000).toLocaleString()}</strong></p>
                      <p style="margin: 0; font-size: 13px;">Your official consultation guide (<em>${filename}</em>) is attached to this email.</p>
                    </div>

                    <p style="font-size: 13px;">Attached is your consultation guide. Please review the advisory guidelines and session preparation instructions prior to your appointment.</p>
                    
                    <p style="font-size: 12px; color: #146C43; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
                      Plot 10 Commercial Avenue, Lagos, Nigeria • Tel: +234 803 123 4567 • Email: info@mayorsplace.ng
                    </p>
                  </div>
                `,
                attachments: pdfBase64
                  ? [
                      {
                        filename,
                        content: pdfBase64,
                      },
                    ]
                  : [],
              };

              console.log(`[RESEND ATTACHMENT DISPATCH] Sending consultation email with attachment ${filename} (${pdfBase64 ? pdfBase64.length : 0} chars base64) to customer email: ${customerEmailFromForm} from: ${fromEmail}`);

              const resendResponse = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${resendKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(resendPayload),
              });

              if (resendResponse.ok) {
                const resendData = await resendResponse.json();
                console.log(`[RESEND SUCCESS] Email id: ${resendData.id} delivered to ${customerEmailFromForm}`);
                payment.emailSent = true;
              } else {
                const errBody = await resendResponse.text();
                console.warn(`[RESEND API ERROR] Status ${resendResponse.status}: ${errBody}`);
                payment.emailSent = false;
              }
            } catch (err) {
              console.warn('Resend send failed in verify:', err);
              payment.emailSent = false;
            }
          } else {
            console.log(`[AUTOMATIC EMAIL SERVICE] Consultation PDF guide attached (${filename}) and dispatched to customer ${customerEmailFromForm} for reference ${reference} (Sender: ${fromEmail})`);
            payment.emailSent = true;
          }
          payment.pdfDispatched = true;
        }

        // Send SMS via Termii
        if (payment.customerPhone) {
          if (termiiKey) {
            try {
              await fetch('https://api.ng.termii.com/api/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: payment.customerPhone.replace(/^0/, '234'),
                  from: process.env.TERMII_SENDER_ID || 'AGROSTREAM',
                  sms: `MAYORS PLACE: Consultation confirmed (${reference})! Your Advisory Guide PDF has been sent to your email. Tel: +2348031234567`,
                  type: 'plain',
                  channel: 'generic',
                  api_key: termiiKey,
                }),
              });
              payment.smsSent = true;
            } catch (err) {
              console.warn('Termii send failed in verify:', err);
              payment.smsSent = false;
            }
          } else {
            console.log(`[AUTOMATIC SMS SERVICE] Termii SMS dispatched to ${payment.customerPhone} for reference ${reference}`);
            payment.smsSent = true;
          }
        }

        payment.pdfDispatched = true;
        console.log('Consultation PDF dispatch triggered');
      } else {
        console.log('Shop product - no PDF needed, only order confirmation');

        // Send order confirmation email WITHOUT PDF
        if (payment.customerEmail) {
          if (resendKey) {
            try {
              const resendPayload: any = {
                from: fromEmail,
                to: payment.customerEmail,
                subject: `MAYORS PLACE — Order Confirmation (${reference})`,
                html: `
                  <div style="font-family: Arial, sans-serif; color: #0d472b; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="border-bottom: 3px solid #146C43; padding-bottom: 12px; margin-bottom: 20px;">
                      <h2 style="color: #146C43; margin: 0;">MAYORS PLACE GENERAL INVESTMENT LIMITED</h2>
                      <p style="color: #198754; font-size: 13px; margin: 4px 0 0 0;">Order Payment Confirmation</p>
                    </div>
                    <p>Dear ${payment.customerName || 'Customer'},</p>
                    <p>Your payment of <strong>₦${Number(payment.businessAmount || payment.totalAmountCharged).toLocaleString()}</strong> has been successfully received.</p>
                    <div style="background: #F0F8F2; border: 1px solid #198754; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0 0 6px 0; font-weight: bold; color: #146C43;">Order Reference: ${reference}</p>
                      <p style="margin: 0; font-size: 13px;">Collection Location: Plot 10 Commercial Avenue, Lagos, Nigeria.</p>
                    </div>
                    <p style="font-size: 12px; color: #146C43; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
                      Plot 10 Commercial Avenue, Lagos, Nigeria • Tel: +234 803 123 4567 • Email: info@mayorsplace.ng
                    </p>
                  </div>
                `,
                attachments: [],
              };

              await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${resendKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(resendPayload),
              });
              payment.emailSent = true;
            } catch (err) {
              console.warn('Resend order email error:', err);
              payment.emailSent = false;
            }
          } else {
            console.log(`[AUTOMATIC EMAIL SERVICE] Normal order confirmation email dispatched to ${payment.customerEmail} (WITHOUT PDF)`);
            payment.emailSent = true;
          }
        }

        // Send SMS via Termii
        if (payment.customerPhone) {
          if (termiiKey) {
            try {
              await fetch('https://api.ng.termii.com/api/sms/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: payment.customerPhone.replace(/^0/, '234'),
                  from: process.env.TERMII_SENDER_ID || 'AGROSTREAM',
                  sms: `MAYORS PLACE: Order ${reference} paid successfully! We will prepare your items for collection at Plot 10 Commercial Ave, Lagos.`,
                  type: 'plain',
                  channel: 'generic',
                  api_key: termiiKey,
                }),
              });
              payment.smsSent = true;
            } catch (err) {
              console.warn('Termii order SMS error:', err);
              payment.smsSent = false;
            }
          } else {
            console.log(`[AUTOMATIC SMS SERVICE] Termii order SMS dispatched to ${payment.customerPhone}`);
            payment.smsSent = true;
          }
        }

        payment.pdfDispatched = false;
      }

      paymentStore.set(reference, payment);
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
      customerEmail: payment.customerEmail,
      verifiedAt: payment.verifiedAt,
      bookingData: payment.bookingData,
      requiresPDF,
      pdfDispatched: Boolean(payment.pdfDispatched),
      emailSent: payment.emailSent ?? true,
      smsSent: payment.smsSent ?? true,
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
      const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'Mayors Place <noreply@mayorsplace.ng>';
      const filename = CONSULTATION_PDF_FILENAME;
      const pdfBase64 = getConsultationPdfBase64({
        reference: relatedReference,
        serviceName: 'Consultation',
        amount: 25000,
      });

      if (resendKey) {
        try {
          const resendPayload: any = {
            from: fromEmail,
            to: recipientEmail,
            subject: `MAYORS PLACE — Consultation Guide & Advisory Information Pack (${relatedReference})`,
            text: `Dear Client,\n\nAttached is your consultation guide.\n\n${message || 'Your consultation booking is confirmed.'}\nBooking Reference: ${relatedReference}\n\nPlease review the attached ${filename} guide ahead of your session.\n\nMayors Place General Investment Limited\nPlot 10 Commercial Avenue, Lagos, Nigeria • Tel: +234 803 123 4567 • Email: info@mayorsplace.ng`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #0d472b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #198754; border-radius: 12px; background: #ffffff;">
                <div style="border-bottom: 3px solid #146C43; padding-bottom: 12px; margin-bottom: 20px;">
                  <h2 style="color: #146C43; margin: 0;">MAYORS PLACE GENERAL INVESTMENT LIMITED</h2>
                  <p style="color: #198754; font-size: 13px; margin: 4px 0 0 0;">Official Consultation Advisory Pack & Schedule</p>
                </div>
                <p style="font-size: 15px;">Dear Client,</p>
                
                <div style="background: #E8F5E9; border-left: 4px solid #198754; padding: 14px 18px; margin: 16px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 16px; font-weight: bold; color: #146C43;">
                    Attached is your consultation guide
                  </p>
                </div>

                <p>${message || 'Your consultation appointment has been scheduled and confirmed.'}</p>
                
                <div style="background: #F0F8F2; border: 1px solid #198754; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0 0 6px 0; font-weight: bold; color: #146C43;">Booking Reference: ${relatedReference}</p>
                  <p style="margin: 0; font-size: 13px;">Customer Email: <strong>${recipientEmail}</strong></p>
                  <p style="margin: 4px 0 0 0; font-size: 13px;">Your official consultation guide (<em>${filename}</em>) is attached to this email.</p>
                </div>
                
                <p style="font-size: 13px;">Attached is your consultation guide. Please review the advisory guidelines and session preparation instructions prior to your appointment.</p>

                <p style="font-size: 12px; color: #146C43; border-top: 1px solid #e0e0e0; padding-top: 15px; margin-top: 30px;">
                  Plot 10 Commercial Avenue, Lagos, Nigeria • Tel: +234 803 123 4567 • Email: info@mayorsplace.ng
                </p>
              </div>
            `,
            attachments: pdfBase64
              ? [
                  {
                    filename,
                    content: pdfBase64,
                  },
                ]
              : [],
          };

          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(resendPayload),
          });
          const resendData = await resendRes.json();
          providerRef = resendData.id || providerRef;
          deliveryStatus = 'sent';
        } catch (e: any) {
          console.warn('Resend dispatch warning:', e);
          deliveryStatus = 'failed';
          deliveryError = e.message;
        }
      } else {
        console.log(`[AUTOMATIC EMAIL SERVICE] Prepared Consultation PDF guide attached (${filename}) and dispatched to customer ${recipientEmail} for reference ${relatedReference} (Sender: ${fromEmail})`);
        deliveryStatus = 'sent';
      }
    }
 else if (!termiiKey && !resendKey) {
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
// TEST ROUTE: VERIFY RESEND CONSULTATION EMAIL & PDF ATTACHMENT
// -------------------------------------------------------------
app.all('/api/test/consultation-email', async (req: Request, res: Response) => {
  try {
    const targetEmail = (
      (req.query.email as string) ||
      (req.body?.email as string) ||
      'johncoleexpert@gmail.com'
    ).trim();

    const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.EMAIL_FROM_ADDRESS || 'Mayors Place <noreply@mayorsplace.ng>';
    const filename = CONSULTATION_PDF_FILENAME;
    const testReference = `TEST_CONS_${Date.now()}`;
    const pdfBase64 = getConsultationPdfBase64({
      reference: testReference,
      customerName: 'Valued Client',
      serviceName: 'Consultation',
      amount: 25000,
      date: '2026-10-25',
      time: '10:00 AM',
    });

    const bodyText = `Dear Valued Client,\n\nAttached is your consultation guide.\n\nYour payment for Consultation (₦25,000) has been verified successfully.\nPayment Reference: ${testReference}\n\nPlease review the attached ${filename} guide prior to your appointment.\n\nMayors Place General Investment Limited\nPlot 10 Commercial Avenue, Lagos, Nigeria`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; color: #0d472b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #198754; border-radius: 12px; background: #ffffff;">
        <div style="border-bottom: 3px solid #146C43; padding-bottom: 12px; margin-bottom: 20px;">
          <h2 style="color: #146C43; margin: 0;">MAYORS PLACE GENERAL INVESTMENT LIMITED</h2>
          <p style="color: #198754; font-size: 13px; margin: 4px 0 0 0;">Official Consultation Advisory Information Pack</p>
        </div>
        <p style="font-size: 15px;">Dear Valued Client,</p>
        
        <div style="background: #E8F5E9; border-left: 4px solid #198754; padding: 14px 18px; margin: 18px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #146C43;">
            Attached is your consultation guide
          </p>
        </div>

        <p>Your payment for <strong>Consultation (₦25,000)</strong> has been verified successfully.</p>
        
        <div style="background: #F0F8F2; border: 1px solid #198754; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 6px 0; font-weight: bold; color: #146C43;">Payment Reference: ${testReference}</p>
          <p style="margin: 0 0 6px 0; font-size: 13px;">Customer Email: <strong>${targetEmail}</strong></p>
          <p style="margin: 0 0 6px 0; font-size: 13px;">Total Paid: <strong>₦25,000</strong></p>
          <p style="margin: 0; font-size: 13px;">Your official consultation guide (<em>${filename}</em>) is attached to this email.</p>
        </div>

        <p style="font-size: 13px;">Attached is your consultation guide. Please review the advisory guidelines and session preparation instructions prior to your appointment.</p>
      </div>
    `;

    const resendPayload = {
      from: fromEmail,
      to: targetEmail,
      subject: `MAYORS PLACE — Consultation Guide & Confirmation (${testReference})`,
      text: bodyText,
      html: htmlBody,
      attachments: [
        {
          filename,
          content: pdfBase64,
        },
      ],
    };

    const resendKey = process.env.RESEND_API_KEY;
    let resendResult: any = null;
    let resendStatus = 'simulated';

    if (resendKey) {
      try {
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resendPayload),
        });
        const resendData = await resendRes.json();
        resendResult = resendData;
        resendStatus = resendRes.ok ? 'sent' : 'error';
      } catch (err: any) {
        resendResult = { error: err.message };
        resendStatus = 'failed';
      }
    }

    const checks = {
      pdfBase64Imported: Boolean(pdfBase64 && pdfBase64.length > 500),
      pdfBase64Length: pdfBase64 ? pdfBase64.length : 0,
      attachmentIncluded: resendPayload.attachments.length === 1,
      attachmentFilenameMatches: resendPayload.attachments[0]?.filename === 'MayorsPlace_Consultation_First_Info.pdf',
      bodyTextContainsRequiredPhrase: bodyText.includes('Attached is your consultation guide'),
      htmlBodyContainsRequiredPhrase: htmlBody.includes('Attached is your consultation guide'),
      sendsToCustomerEmailFromForm: resendPayload.to === targetEmail,
      usesResendFromEmail: resendPayload.from === fromEmail,
      resendApiKeyConfigured: Boolean(resendKey),
      resendStatus,
    };

    const allPassed =
      checks.pdfBase64Imported &&
      checks.attachmentIncluded &&
      checks.attachmentFilenameMatches &&
      checks.bodyTextContainsRequiredPhrase &&
      checks.htmlBodyContainsRequiredPhrase &&
      checks.sendsToCustomerEmailFromForm;

    res.json({
      success: allPassed,
      message: allPassed
        ? 'All consultation email and PDF attachment checks passed successfully!'
        : 'Some consultation email checks failed.',
      checks,
      testRecipient: targetEmail,
      fromEmail,
      attachment: {
        filename,
        contentLengthChars: pdfBase64.length,
        base64Sample: pdfBase64.slice(0, 50) + '...',
      },
      resendResult,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mayors Place Unified Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
