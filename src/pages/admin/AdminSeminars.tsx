import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Seminar } from '../../types';
import { Currency } from '../../components/Currency';
import { dispatchNotification } from '../../lib/notifications';
import {
  GraduationCap,
  Plus,
  Users,
  Download,
  Calendar,
  AlertCircle,
  XCircle,
  CheckCircle2
} from 'lucide-react';

export const AdminSeminars: React.FC = () => {
  const { seminars, addSeminar, updateSeminar } = useBusiness();
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(seminars[0] || null);
  const [isAddingSeminar, setIsAddingSeminar] = useState(false);

  // Sample registered attendees for the seminar
  const [participants, setParticipants] = useState([
    { name: 'Dr. Segun Balogun', phone: '08023456789', email: 'segun@example.com', registeredAt: '2026-10-08', status: 'confirmed' },
    { name: 'Mrs. Amina Yusuf', phone: '08134567890', email: 'amina@example.com', registeredAt: '2026-10-08', status: 'confirmed' },
    { name: 'Mr. Chukwuma Obi', phone: '09012345678', email: 'chukwuma@example.com', registeredAt: '2026-10-09', status: 'confirmed' },
  ]);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(15000);
  const [date, setDate] = useState('2026-11-20');
  const [time, setTime] = useState('10:00 AM (WAT)');
  const [venue, setVenue] = useState('AgroStream Training Center & Zoom Online');
  const [capacity, setCapacity] = useState(50);
  const [isOnline, setIsOnline] = useState(false);

  const handleExportCSV = () => {
    if (!selectedSeminar) return;
    const headers = 'Name,Phone,Email,Status,Registered At\n';
    const rows = participants
      .map((p) => `"${p.name}","${p.phone}","${p.email}","${p.status}","${p.registeredAt}"`)
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedSeminar.title.slice(0, 20)}_participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateSeminar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addSeminar({
      title: title.trim(),
      description: description.trim() || 'Practical hands-on training.',
      imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      registrationPrice: price,
      date,
      time,
      venue,
      isOnline,
      registrationDeadline: date,
      capacity,
      registeredCount: 0,
      status: 'upcoming',
    });

    setIsAddingSeminar(false);
    setTitle('');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#146C43]">Seminars & Training Management</h1>
          <p className="text-xs sm:text-sm text-[#146C43]">
            Control seat capacities, registration deadlines, and download participant rosters.
          </p>
        </div>

        <button
          onClick={() => setIsAddingSeminar(true)}
          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Seminar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Seminar list (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-[#0d472b] uppercase tracking-wider">
            All Masterclasses ({seminars.length})
          </h3>
          <div className="space-y-3">
            {seminars.map((s) => {
              const isSelected = selectedSeminar?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSeminar(s)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600'
                      : 'border-[#198754]/20 bg-white hover:border-[#198754]/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[#146C43] text-sm leading-snug">{s.title}</h4>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                      {s.status}
                    </span>
                  </div>
                  <div className="text-xs text-[#146C43] flex items-center justify-between">
                    <span>{s.date}</span>
                    <span className="font-bold text-[#146C43]">
                      {s.registeredCount} / {s.capacity} seats filled
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Seminar Details & Participant Rosters (7 cols) */}
        <div className="lg:col-span-7">
          {selectedSeminar ? (
            <div className="bg-white rounded-2xl border border-[#198754]/20 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#198754]/20">
                <div>
                  <h3 className="font-bold text-[#146C43] text-base">{selectedSeminar.title}</h3>
                  <div className="text-xs text-[#146C43] mt-1">
                    Date: <strong>{selectedSeminar.date}</strong> • Fee:{' '}
                    <Currency amount={selectedSeminar.registrationPrice} />
                  </div>
                </div>

                <button
                  onClick={handleExportCSV}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F0F8F2] hover:bg-[#F0F8F2] text-[#146C43] text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Roster table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#0d472b]">Registered Participants</span>
                  <span className="text-emerald-700 font-bold">
                    Capacity: {selectedSeminar.capacity - selectedSeminar.registeredCount} seats left
                  </span>
                </div>

                <div className="overflow-x-auto border border-[#198754]/20 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F0F8F2] text-[#146C43] uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Phone</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#198754]/10">
                      {participants.map((p, i) => (
                        <tr key={i} className="hover:bg-[#F0F8F2]">
                          <td className="py-2 px-3 font-semibold text-[#146C43]">{p.name}</td>
                          <td className="py-2 px-3 text-[#0d472b] font-mono">{p.phone}</td>
                          <td className="py-2 px-3 text-[#146C43]">{p.email}</td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-[#198754] text-xs">Select a seminar to view participants</div>
          )}
        </div>
      </div>

      {/* Add Seminar Modal */}
      {isAddingSeminar && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="font-bold text-[#146C43] text-base">Create Agricultural Seminar</h3>
            <form onSubmit={handleCreateSeminar} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">Seminar Topic / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d472b] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0d472b] mb-1">Price (NGN)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0d472b] mb-1">Capacity (Seats)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0d472b] mb-1">Event Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0d472b] mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#198754]/30"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSeminar(false)}
                  className="w-1/2 py-2 rounded-lg border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-lg bg-emerald-700 text-white text-xs font-bold"
                >
                  Save Seminar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
