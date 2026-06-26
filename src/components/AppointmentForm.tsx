import { useState, useEffect } from 'react';
import { BusinessCard } from '../lib/firebase';
import { submitContactShare, getBusinessCardBySlug } from '../services/firestore';
import { sendContactShareNotification } from '../services/telegramService';
import { getFreshAccessToken, getBusySlots, createCalendarEvent, BusySlot } from '../services/googleCalendar';
import { X, Calendar as CalendarIcon, Clock, Check, AlertCircle, ChevronRight, ChevronLeft, User, Mail, Phone, Building, MessageSquare } from 'lucide-react';

interface AppointmentFormProps {
  card: BusinessCard;
  onClose: () => void;
}

export default function AppointmentForm({ card, onClose }: AppointmentFormProps) {
  const hasEntities = card.card_type === 'company' && (
    (card.departments && card.departments.length > 0) ||
    (card.team_members && card.team_members.length > 0)
  );

  const [step, setStep] = useState<0 | 1 | 2>(hasEntities ? 0 : 1);
  const [bookingCard, setBookingCard] = useState<BusinessCard>(card);
  const [selectedEntity, setSelectedEntity] = useState<{
    name: string;
    type: 'department' | 'employee';
    role?: string;
  } | null>(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Available dates (next 7 days)
  const [dates, setDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);

  // Form details
  const [formData, setFormData] = useState({
    visitor_name: '',
    visitor_email: '',
    visitor_phone: '',
    visitor_company: '',
    visitor_notes: '',
  });

  const handleSelectEntity = async (name: string, type: 'department' | 'employee', slug: string | null | undefined) => {
    setSelectedEntity({ name, type });
    setError('');
    
    if (slug) {
      setLoadingSlots(true);
      try {
        const targetCard = await getBusinessCardBySlug(slug);
        if (targetCard) {
          setBookingCard(targetCard);
        } else {
          setBookingCard(card);
        }
      } catch (err) {
        console.error('Failed to fetch linked entity card:', err);
        setBookingCard(card);
      } finally {
        setLoadingSlots(false);
      }
    } else {
      setBookingCard(card);
    }
    
    setStep(1);
  };

  // Generate the next 7 days on mount
  useEffect(() => {
    const localDates: Date[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      // Skip weekends if desired, but here we include all 7 days for maximum flexibility
      localDates.push(d);
    }

    setDates(localDates);
    setSelectedDate(localDates[0]);
  }, []);

  // Fetch busy slots when the date changes
  useEffect(() => {
    if (selectedDate && step === 1) {
      fetchAvailability();
    }
  }, [selectedDate, bookingCard, step]);

  const fetchAvailability = async () => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    setError('');
    setSelectedSlot(null);

    try {
      const calendarId = bookingCard.google_calendar_id || 'primary';

      // Get a fresh token for the owner
      const accessToken = await getFreshAccessToken(bookingCard.id);

      // Define boundaries for the selected date (start of day to end of day)
      const timeMin = new Date(selectedDate);
      timeMin.setHours(0, 0, 0, 0);

      const timeMax = new Date(selectedDate);
      timeMax.setHours(23, 59, 59, 999);

      // Fetch busy blocks
      const busy = await getBusySlots(
        accessToken,
        calendarId,
        timeMin.toISOString(),
        timeMax.toISOString()
      );

      generateTimeSlots(selectedDate, busy);
    } catch (err: any) {
      console.error('Error fetching calendar availability:', err);
      setError('Could not fetch availability. Please try again.');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Generate 30-min slots between 9 AM and 5 PM and filter out busy/past slots
  const generateTimeSlots = (date: Date, busy: BusySlot[]) => {
    const slots: Date[] = [];
    const startHour = 9; // 9:00 AM
    const endHour = 17; // 5:00 PM
    const intervalMinutes = 30;

    const now = new Date();

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += intervalMinutes) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, min, 0, 0);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotStart.getMinutes() + intervalMinutes);

        // Skip past slots
        if (slotStart <= now) continue;

        // Check overlap with busy periods
        const isBusy = busy.some(b => {
          const busyStart = new Date(b.start);
          const busyEnd = new Date(b.end);
          return slotStart < busyEnd && slotEnd > busyStart;
        });

        if (!isBusy) {
          slots.push(slotStart);
        }
      }
    }

    setTimeSlots(slots);
  };

  const handleNextStep = () => {
    if (selectedSlot) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setError('');
    setSubmitting(true);

    try {
      const calendarId = bookingCard.google_calendar_id || 'primary';
      const slotStart = selectedSlot.toISOString();
      const slotEnd = new Date(selectedSlot.getTime() + 30 * 60 * 1000).toISOString();

      // 1. Refresh token & create Google Calendar Event
      const accessToken = await getFreshAccessToken(bookingCard.id);
      const googleEvent = await createCalendarEvent(accessToken, calendarId, {
        visitorName: formData.visitor_name,
        visitorEmail: formData.visitor_email,
        visitorPhone: formData.visitor_phone,
        visitorCompany: formData.visitor_company,
        visitorNotes: selectedEntity 
          ? `[Booked with ${selectedEntity.type}: ${selectedEntity.name}]\n${formData.visitor_notes}`
          : formData.visitor_notes,
        startTime: slotStart,
        endTime: slotEnd,
      });

      // 2. Save appointment to Firestore (within contact_shares collection)
      const contactData = {
        visitor_name: formData.visitor_name,
        visitor_email: formData.visitor_email,
        visitor_phone: formData.visitor_phone || null,
        visitor_company: formData.visitor_company || null,
        visitor_notes: selectedEntity 
          ? `[Booked with ${selectedEntity.type}: ${selectedEntity.name}]\n${formData.visitor_notes || ''}`
          : (formData.visitor_notes || null),
        appointment_start: slotStart,
        appointment_end: slotEnd,
        google_event_id: googleEvent.id || null,
      };

      await submitContactShare(card.id, contactData);

      // Send Telegram notification if service supports it
      sendContactShareNotification(card.user_id, card, contactData).catch(err => {
        console.error('Failed to send Telegram notification:', err);
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error('Failed to book appointment:', err);
      setError(err.message || 'Failed to complete appointment booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeLabel = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getFriendlySlotDetails = () => {
    if (!selectedSlot) return '';
    const end = new Date(selectedSlot.getTime() + 30 * 60 * 1000);
    return `${selectedSlot.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${formatTimeLabel(selectedSlot)} - ${formatTimeLabel(end)}`;
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-slate-200 text-center">
          <div className="w-16 h-16 bg-green-500 bg-opacity-10 border border-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Check size={32} className="text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Appointment Scheduled!</h3>
          <p className="text-slate-600 mb-4 text-sm">
            Your appointment with <span className="font-semibold text-slate-900">{card.full_name}</span> has been confirmed.
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-800 font-medium">
            {getFriendlySlotDetails()}
          </div>
          <p className="text-xs text-slate-500 mt-6">
            A calendar invitation has been sent to your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-slate-250 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {step === 1 && hasEntities && (
              <button
                onClick={() => setStep(0)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900">Book an Appointment</h2>
              <p className="text-xs text-slate-500 mt-1">
                {selectedEntity ? `With ${selectedEntity.name}` : `With ${card.full_name}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3 text-sm">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 0 ? (
            <div className="space-y-6">
              {card.departments && card.departments.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                    Choose Department
                  </label>
                  <div className="space-y-2">
                    {card.departments.map(dept => (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() => handleSelectEntity(dept.name, 'department', dept.card_slug)}
                        className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left hover:bg-slate-100 hover:border-slate-350 transition"
                      >
                        <span className="font-semibold text-slate-900 text-sm">{dept.name}</span>
                        <ChevronRight size={16} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {card.team_members && card.team_members.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                    Choose Employee
                  </label>
                  <div className="space-y-2">
                    {card.team_members.map(member => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleSelectEntity(member.name, 'employee', member.card_slug)}
                        className="w-full flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left hover:bg-slate-100 hover:border-slate-350 transition"
                      >
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.name} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-800 text-sm font-bold">
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{member.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{member.role}</p>
                        </div>
                        <ChevronRight size={16} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : step === 1 ? (
            <div className="space-y-6">
              {/* Date Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                  Select Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  {dates.map((d, index) => {
                    const isSelected = selectedDate?.toDateString() === d.toDateString();
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-center transition flex flex-col items-center min-w-[84px] ${isSelected
                            ? 'bg-slate-950 text-white border-slate-950'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                      >
                        <span className="text-[10px] uppercase font-bold tracking-tight opacity-60">
                          {d.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="text-lg font-bold mt-0.5">
                          {d.getDate()}
                        </span>
                        <span className="text-[9px] opacity-75 mt-0.5">
                          {d.toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider flex items-center justify-between">
                  <span>Select Time (Business Hours)</span>
                  <span className="text-[10px] text-slate-400 normal-case font-normal">Your local time</span>
                </label>

                {loadingSlots ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-800 mb-2"></div>
                    <span className="text-xs text-slate-500">Checking availability...</span>
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                    <Clock size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-700 font-medium">No slots available today</p>
                    <p className="text-xs text-slate-500 mt-1">Please try selecting another date</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot, index) => {
                      const isSelected = selectedSlot?.getTime() === slot.getTime();
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-2 rounded-xl text-center text-xs font-semibold border transition ${isSelected
                              ? 'bg-slate-950 text-white border-slate-950'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                          {formatTimeLabel(slot)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Next Step Button */}
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!selectedSlot}
                className="w-full flex items-center justify-center gap-2 bg-slate-950 text-white py-4 px-6 rounded-2xl hover:bg-slate-900 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                <span>Continue</span>
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Slot Recap */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-start gap-3">
                <CalendarIcon className="text-slate-800 mt-0.5" size={18} />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Selected Time</p>
                  <p className="text-xs text-slate-800 font-semibold mt-1">{getFriendlySlotDetails()}</p>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-blue-600 hover:underline font-medium mt-1"
                  >
                    Change date/time
                  </button>
                </div>
              </div>

              {/* Visitor Details */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.visitor_name}
                      onChange={(e) => setFormData({ ...formData, visitor_name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full bg-slate-50 border border-slate-200 text-black rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-slate-350 transition text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Your Email *
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={formData.visitor_email}
                      onChange={(e) => setFormData({ ...formData, visitor_email: e.target.value })}
                      placeholder="john@example.com"
                      className="w-full bg-slate-50 border border-slate-200 text-black rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-slate-350 transition text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Your Phone
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={formData.visitor_phone}
                      onChange={(e) => setFormData({ ...formData, visitor_phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full bg-slate-50 border border-slate-200 text-black rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-slate-350 transition text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Your Company
                  </label>
                  <div className="relative">
                    <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={formData.visitor_company}
                      onChange={(e) => setFormData({ ...formData, visitor_company: e.target.value })}
                      placeholder="Company Name"
                      className="w-full bg-slate-50 border border-slate-200 text-black rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-slate-350 transition text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                    Message / Goal of Meeting
                  </label>
                  <div className="relative">
                    <MessageSquare size={16} className="absolute left-4 top-4 text-slate-400" />
                    <textarea
                      rows={3}
                      value={formData.visitor_notes}
                      onChange={(e) => setFormData({ ...formData, visitor_notes: e.target.value })}
                      placeholder="What would you like to discuss?"
                      className="w-full bg-slate-50 border border-slate-200 text-black rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-slate-350 transition text-sm resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border border-slate-200 text-slate-700 font-semibold rounded-2xl hover:bg-slate-50 hover:text-slate-900 transition text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-slate-950 text-white font-semibold rounded-2xl hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    {submitting ? 'Scheduling...' : 'Schedule'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
