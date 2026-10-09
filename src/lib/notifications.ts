import { NotificationLog } from '../types';

export interface SendNotificationParams {
  type: string;
  recipientPhone: string;
  recipientEmail?: string;
  relatedReference: string;
  message: string;
  channel?: 'sms' | 'email' | 'both';
}

/**
 * Dispatches notification via server proxy
 */
export async function dispatchNotification(params: SendNotificationParams): Promise<{ success: boolean; log?: NotificationLog; error?: string }> {
  try {
    const res = await fetch('/api/notifications/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to dispatch notification' };
    }
    const data = await res.json();
    return { success: true, log: data.log };
  } catch (error) {
    console.error('Notification dispatch error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export function formatAppointmentConfirmationMessage(ref: string, date: string, time: string, businessName: string): string {
  return `Your appointment has been confirmed. Reference: ${ref}. Date: ${date}. Time: ${time}. Thank you for booking with ${businessName}.`;
}

export function formatAppointmentRescheduledMessage(ref: string, newDate: string, newTime: string, businessPhone: string): string {
  return `Your booking ${ref} has been rescheduled to ${newDate} at ${newTime}. Please contact us at ${businessPhone} if you need assistance.`;
}

export function formatSeminarConfirmationMessage(seminarTitle: string, ref: string, date: string): string {
  return `Your registration for ${seminarTitle} is confirmed. Reference: ${ref}. Date: ${date}. Thank you for joining us.`;
}

export function formatOrderConfirmationMessage(orderRef: string, businessPhone: string): string {
  return `Your order ${orderRef} has been paid successfully. We will notify you when it is ready for collection. For delivery enquiries, please contact ${businessPhone}.`;
}

export function formatOrderReadyMessage(orderRef: string, collectionAddress: string): string {
  return `Your order ${orderRef} is now ready for collection at ${collectionAddress}. Please present your order reference upon pickup.`;
}

export function formatLiveStreamConfirmationMessage(ref: string, eventType: string, date: string): string {
  return `Your live-streaming booking has been confirmed. Reference: ${ref}. Event: ${eventType}. Date: ${date}.`;
}

export function formatQuoteReadyMessage(quoteRef: string, eventType: string, domain: string): string {
  return `A quotation for your live-streaming enquiry (${eventType}) is ready for review. Reference: ${quoteRef}. Visit https://${domain}/quote/${quoteRef} to review and accept.`;
}
