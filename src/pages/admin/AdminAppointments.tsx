import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { ServiceItem, Appointment } from '../../types';
import { Currency } from '../../components/Currency';
import { dispatchNotification, formatAppointmentRescheduledMessage } from '../../lib/notifications';
import {
  Calendar,
  Clock,
  Plus,
  Phone,
  CheckCircle,
  XCircle,
  Edit,
  Send,
  AlertCircle,
  Trash2
} from 'lucide-react';

export const AdminAppointments: React.FC = () => {
  const { services, addService, updateService, settings } = useBusiness();
  const [activeTab, setActiveTab] = useState<'bookings' | 'services'>('bookings');

  // Sample verified appointments state for admin management
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'apt-001',
      serviceId: 'srv-general-info-guidance',
      serviceName: 'General Information, Guidance and Other Services',
      customerName: 'Chief Babatunde Adeleke',
      customerPhone: '08031234567',
      customerEmail: 'babatunde@example.com',
      date: '2026-10-14',
      time: '10:00 AM',
      notes: 'Corporate guidance and migration pathway review.',
      price: 300000,
      platformFee: 60,
      totalAmount: 300060,
      paymentReference: 'AGRO_APPT_001',
      paystackReference: 'PSTK_APPT_001',
      status: 'confirmed',
      createdAt: '2026-10-09T08:00:00Z',
    },
    {
      id: 'apt-002',
      serviceId: 'srv-tourist-business-pkg',
      serviceName: 'Tourist / Business Package',
      customerName: 'Alhaji Musa Danjuma',
      customerPhone: '08123456789',
      date: '2026-10-16',
      time: '01:00 PM',
      notes: 'Tourist and commercial delegation requirements.',
      price: 300000,
      platformFee: 60,
      totalAmount: 300060,
      paymentReference: 'AGRO_APPT_002',
      paystackReference: 'PSTK_APPT_002',
      status: 'confirmed',
      createdAt: '2026-10-09T09:30:00Z',
    },
  ]);

  // Reschedule state
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('11:00 AM');
  const [notifyNotice, setNotifyNotice] = useState<string | null>(null);

  // New Service state
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState(30000);
  const [serviceDuration, setServiceDuration] = useState(60);

  const handleConfirmReschedule = async () => {
    if (!rescheduleApt || !newDate || !newTime) return;

    const updated = appointments.map((a) =>
      a.id === rescheduleApt.id ? { ...a, date: newDate, time: newTime, status: 'rescheduled' as const } : a
    );
    setAppointments(updated);

    // Dispatch SMS notification to customer
    const msg = formatAppointmentRescheduledMessage(
      rescheduleApt.paymentReference || rescheduleApt.id,
      newDate,
      newTime,
      settings.businessPhone
    );

    await dispatchNotification({
      type: 'appointment_rescheduled',
      recipientPhone: rescheduleApt.customerPhone,
      recipientEmail: rescheduleApt.customerEmail,
      relatedReference: rescheduleApt.paymentReference || rescheduleApt.id,
      message: msg,
      channel: 'both',
    });

    setNotifyNotice(`Appointment rescheduled and notification sent to ${rescheduleApt.customerPhone}.`);
    setRescheduleApt(null);
    setTimeout(() => setNotifyNotice(null), 4000);
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName.trim()) return;

    await addService({
      name: serviceName.trim(),
      description: serviceDescription.trim() || 'Comprehensive professional consultation.',
      imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=800&auto=format&fit=crop&q=80',
      price: servicePrice,
      durationMinutes: serviceDuration,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
      bookingInstructions: 'Bring farm details or land coordinates.',
      cancellationPolicy: '24 hours advance notice required.',
      active: true,
    });

    setIsAddingService(false);
    setServiceName('');
    setServiceDescription('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#146C43]">Appointments & Consultations</h1>
          <p className="text-xs sm:text-sm text-[#146C43]">
            Manage scheduled agronomy sessions, reschedule bookings, and configure service fees.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bookings' ? 'bg-emerald-800 text-white' : 'bg-white text-[#0d472b] border'
            }`}
          >
            Customer Bookings ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'services' ? 'bg-emerald-800 text-white' : 'bg-white text-[#0d472b] border'
            }`}
          >
            Manage Services ({services.length})
          </button>
        </div>
      </div>

      {notifyNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notifyNotice}</span>
        </div>
      )}

      {activeTab === 'bookings' ? (
        <div className="bg-white rounded-2xl border border-[#198754]/20 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F0F8F2] text-[#146C43] uppercase border-b border-[#198754]/20">
                <tr>
                  <th className="py-3 px-4">Ref & Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Paid Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#198754]/10">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#F0F8F2]">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#146C43]">{apt.customerName}</div>
                      <div className="text-[#146C43] font-mono text-[11px]">{apt.customerPhone}</div>
                      <div className="text-emerald-800 font-mono text-[10px]">{apt.paymentReference}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-[#146C43] truncate">{apt.serviceName}</div>
                      {apt.notes && <div className="text-[11px] text-[#146C43] italic truncate">{apt.notes}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#146C43]">{apt.date}</div>
                      <div className="text-[#146C43] text-[11px]">{apt.time}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#146C43]">
                      <Currency amount={apt.totalAmount} />
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setRescheduleApt(apt);
                          setNewDate(apt.date);
                          setNewTime(apt.time);
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold"
                      >
                        Reschedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-[#146C43]">Active Consultation Services</h3>
            <button
              onClick={() => setIsAddingService(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => (
              <div key={svc.id} className="bg-white rounded-xl border border-[#198754]/20 p-4 space-y-2 shadow-xs">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-[#146C43] text-sm">{svc.name}</h4>
                  <Currency amount={svc.price} className="text-emerald-900 font-bold" />
                </div>
                <p className="text-xs text-[#0d472b] line-clamp-2">{svc.description}</p>
                <div className="text-xs text-[#146C43] flex justify-between pt-2 border-t border-[#198754]/20">
                  <span>Duration: {svc.durationMinutes} mins</span>
                  <span className="font-semibold text-emerald-700">{svc.active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Service Modal */}
          {isAddingService && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
                <h3 className="font-bold text-[#146C43] text-base">Add New Consultation Service</h3>
                <form onSubmit={handleCreateService} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0d472b] mb-1">Service Name</label>
                    <input
                      type="text"
                      required
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0d472b] mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={serviceDescription}
                      onChange={(e) => setServiceDescription(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#0d472b] mb-1">Price (NGN)</label>
                      <input
                        type="number"
                        value={servicePrice}
                        onChange={(e) => setServicePrice(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0d472b] mb-1">Duration (Mins)</label>
                      <input
                        type="number"
                        value={serviceDuration}
                        onChange={(e) => setServiceDuration(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingService(false)}
                      className="w-1/2 py-2 rounded-lg border text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                    >
                      Save Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleApt && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4">
            <h3 className="font-bold text-[#146C43] text-base">Reschedule Appointment</h3>
            <p className="text-xs text-[#0d472b]">
              Client: <strong>{rescheduleApt.customerName}</strong> ({rescheduleApt.customerPhone})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">New Time Slot</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30 bg-white"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
            </div>

            <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded">
              An SMS notification with the new date and time will be dispatched automatically upon confirmation.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRescheduleApt(null)}
                className="w-1/2 py-2 rounded-lg border text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="w-1/2 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold"
              >
                Confirm & Notify
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
