export interface ConsultationPdfData {
  reference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  servicePrice: number;
  platformFee: number;
  totalAmount: number;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}

/**
 * Generates and downloads the official consultation advisory document PDF for Mayors Place
 */
export function downloadConsultationPdf(data: ConsultationPdfData) {
  const serviceGuidelines: Record<string, string[]> = {
    'General Information, Guidance and Other Services': [
      'Preliminary assessment of background documentation and personal profile.',
      'Overview of migration frameworks, overseas opportunities, and commercial prerequisites.',
      'Step-by-step advisory checklist tailored to your specific guidance requests.',
      'Direct enquiry review and resolution during your scheduled session.',
    ],
    'Tourist / Business Package': [
      'Comprehensive tourism and business travel verification protocols.',
      'Itinerary structure, accommodation requirements, and flight reservations guidance.',
      'Commercial documentation requirements for business delegates and company representatives.',
      'Consular interview preparation briefing and travel compliance guidelines.',
    ],
    'Consultation': [
      'One-on-one discovery and advisory session with our principal consultant.',
      'Direct question-and-answer period addressing all specific client inquiries.',
      'Recommended action plans and immediate subsequent steps.',
      'Follow-up briefing notes provided following conclusion of the session.',
    ],
  };

  const specificPoints = serviceGuidelines[data.serviceName] || [
    'Comprehensive professional advisory review.',
    'Documentation and requirements breakdown.',
    'Session notes and tailored next steps.',
  ];

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Consultation Advisory Guide - ${data.reference}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: Arial, Helvetica, sans-serif;
      color: #0d472b;
      margin: 0;
      padding: 30px;
      background: #ffffff;
      line-height: 1.5;
    }
    .header {
      border-bottom: 3px solid #146C43;
      padding-bottom: 18px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      color: #146C43;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 0 4px 0;
    }
    .brand-sub {
      font-size: 12px;
      color: #198754;
      font-weight: bold;
      margin: 0;
    }
    .doc-type {
      text-align: right;
    }
    .badge {
      display: inline-block;
      background: #F0F8F2;
      border: 1px solid #198754;
      color: #146C43;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #146C43;
      border-bottom: 1px solid #e0e0e0;
      padding-bottom: 6px;
      margin-top: 24px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 13px;
    }
    .info-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #F0F8F2;
    }
    .info-table td.label {
      width: 35%;
      font-weight: bold;
      color: #146C43;
      background-color: #F0F8F2;
    }
    .info-table td.value {
      width: 65%;
      color: #0d472b;
    }
    .guideline-box {
      background: #F0F8F2;
      border: 1px solid #198754;
      border-radius: 10px;
      padding: 15px 20px;
      margin: 20px 0;
    }
    .guideline-box h4 {
      margin: 0 0 10px 0;
      color: #146C43;
      font-size: 14px;
    }
    .guideline-box ul {
      margin: 0;
      padding-left: 20px;
      font-size: 12.5px;
    }
    .guideline-box li {
      margin-bottom: 6px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 1px solid #198754;
      font-size: 11px;
      color: #146C43;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="brand-title">MAYORS PLACE GENERAL INVESTMENT LIMITED</h1>
      <p class="brand-sub">Official Consultation Advisory & Service Information Pack</p>
    </div>
    <div class="doc-type">
      <div class="badge">Confirmed Schedule</div>
      <div style="font-size: 11px; margin-top: 5px; font-family: monospace; font-weight: bold;">Ref: ${data.reference}</div>
    </div>
  </div>

  <div class="section-title">Client & Booking Details</div>
  <table class="info-table">
    <tr>
      <td class="label">Client Full Name</td>
      <td class="value"><strong>${data.customerName}</strong></td>
    </tr>
    <tr>
      <td class="label">Phone Number</td>
      <td class="value">${data.customerPhone}</td>
    </tr>
    ${data.customerEmail ? `
    <tr>
      <td class="label">Email Address</td>
      <td class="value">${data.customerEmail}</td>
    </tr>
    ` : ''}
    <tr>
      <td class="label">Consultation Service</td>
      <td class="value"><strong>${data.serviceName}</strong></td>
    </tr>
    <tr>
      <td class="label">Scheduled Date & Time</td>
      <td class="value"><strong>${data.appointmentDate} at ${data.appointmentTime} (WAT / Lagos)</strong></td>
    </tr>
    <tr>
      <td class="label">Consultation Fee</td>
      <td class="value">₦${data.servicePrice.toLocaleString('en-NG')}</td>
    </tr>
    <tr>
      <td class="label">Total Paid</td>
      <td class="value"><strong>₦${data.servicePrice.toLocaleString('en-NG')}</strong></td>
    </tr>
    ${data.notes ? `
    <tr>
      <td class="label">Client Enquiries / Notes</td>
      <td class="value">${data.notes}</td>
    </tr>
    ` : ''}
  </table>

  <div class="guideline-box">
    <h4>Preparation & Advisory Guidelines</h4>
    <ul>
      ${specificPoints.map((pt) => `<li>${pt}</li>`).join('')}
      <li>Please ensure your contact phone number is reachable 15 minutes before your scheduled session.</li>
      <li>Have all relevant documents or correspondence organized for immediate reference.</li>
      <li>To reschedule, kindly provide at least 24 hours advance notification.</li>
    </ul>
  </div>

  <div class="footer">
    <strong>MAYORS PLACE GENERAL INVESTMENT LIMITED</strong><br>
    Plot 10, Commercial Avenue, Lagos, Nigeria • Phone: +234 803 123 4567 • Email: info@mayorsplace.ng
  </div>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MayorsPlace_Consultation_${data.reference}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
