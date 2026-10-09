import React, { useState } from 'react';
import { NotificationLog } from '../../types';
import { Bell, Phone, Mail, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';

export const AdminNotifications: React.FC = () => {
  const [logs] = useState<NotificationLog[]>([
    {
      id: 'notif-001',
      type: 'order_paid_confirmation',
      recipientPhone: '08023456789',
      recipientEmail: 'thomas@example.com',
      relatedReference: 'ORD_942103',
      channel: 'both',
      status: 'sent',
      message: 'Your order ORD_942103 has been paid successfully. We will notify you when it is ready for collection. For delivery enquiries, please contact +234 803 123 4567.',
      providerReference: 'TRM_MSG_849201',
      attemptCount: 1,
      createdAt: '2026-10-09T08:18:05Z',
    },
    {
      id: 'notif-002',
      type: 'appointment_confirmed',
      recipientPhone: '08031234567',
      relatedReference: 'APT_94102',
      channel: 'sms',
      status: 'sent',
      message: 'Your appointment has been confirmed. Reference: AGRO_APPT_001. Date: 2026-10-14. Time: 10:00 AM. Thank you for booking with AgroStream Premier.',
      providerReference: 'TRM_MSG_910482',
      attemptCount: 1,
      createdAt: '2026-10-09T08:05:02Z',
    },
    {
      id: 'notif-003',
      type: 'quote_dispatched',
      recipientPhone: '08031234567',
      relatedReference: 'LIV_841029',
      channel: 'both',
      status: 'sent',
      message: 'A quotation for your live-streaming enquiry (Golden Jubilee) is ready for review. Reference: LIV_841029. Visit https://agrostreampremier.ng/quote/LIV_841029 to review and accept.',
      providerReference: 'TRM_MSG_194028',
      attemptCount: 1,
      createdAt: '2026-10-09T08:50:00Z',
    },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[#146C43]">SMS & Email Notification Audit Trail</h1>
        <p className="text-xs sm:text-sm text-[#146C43]">
          Delivery logs, dispatch timestamps, Nigerian Termii SMS provider tracking IDs, and transmission status.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#198754]/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F0F8F2] text-[#146C43] uppercase border-b border-[#198754]/20">
              <tr>
                <th className="py-3 px-4">Notification Type</th>
                <th className="py-3 px-4">Recipient Phone / Email</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Rendered Message</th>
                <th className="py-3 px-4">Provider Ref</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp (WAT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#198754]/10">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F0F8F2]">
                  <td className="py-3 px-4 font-bold text-[#146C43] capitalize">
                    {log.type.replace(/_/g, ' ')}
                    <div className="text-[10px] text-emerald-800 font-mono">{log.relatedReference}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-mono text-[#146C43] font-semibold">{log.recipientPhone}</div>
                    {log.recipientEmail && <div className="text-[#146C43] text-[11px]">{log.recipientEmail}</div>}
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-[10px] text-[#0d472b]">{log.channel}</td>
                  <td className="py-3 px-4 max-w-sm text-[#0d472b] line-clamp-2 leading-relaxed">
                    {log.message}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#146C43]">
                    {log.providerReference || 'Pending'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#146C43] whitespace-nowrap">
                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
