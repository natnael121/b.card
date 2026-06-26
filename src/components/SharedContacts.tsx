import { useEffect, useState } from 'react';
import { ContactShare } from '../lib/firebase';
import { getContactSharesByUser } from '../services/firestore';
import { Mail, Phone, Building, Calendar, MessageSquare, Users } from 'lucide-react';

interface SharedContactsProps {
  userId: string;
}

export default function SharedContacts({ userId }: SharedContactsProps) {
  const [contacts, setContacts] = useState<ContactShare[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, [userId]);

  const loadContacts = async () => {
    try {
      const data = await getContactSharesByUser(userId);
      setContacts(data);
    } catch (error) {
      console.error('Error loading shared contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateRange = (startStr: string, endStr: string | null | undefined) => {
    const start = new Date(startStr);
    const dateFormatted = start.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStart = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    
    if (endStr) {
      const end = new Date(endStr);
      const timeEnd = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${dateFormatted} at ${timeStart} - ${timeEnd}`;
    }
    
    return `${dateFormatted} at ${timeStart}`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <div className="text-slate-400">Loading shared contacts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-100 mb-2">Shared Contacts</h2>
        <p className="text-slate-400">People who have shared their contact information with you</p>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-slate-950/40 border border-slate-850 p-12 rounded-2xl text-center">
          <div className="w-16 h-16 bg-slate-900 border border-slate-850 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-100 mb-2">No Shared Contacts Yet</h3>
          <p className="text-slate-400 mb-4">
            When visitors share their contact information through your business cards, they will appear here.
          </p>
          <p className="text-sm text-slate-500">
            Enable "Allow Contact Sharing" in your card settings to start receiving contacts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-slate-950/40 border border-slate-850 rounded-2xl hover:border-slate-800 transition p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold text-slate-100">
                      {contact.visitor_name}
                    </h3>
                    {contact.appointment_start && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Meeting Booked
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <Calendar size={14} />
                    <span>{formatDate(contact.created_at)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <a
                  href={`mailto:${contact.visitor_email}`}
                  className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-850 rounded-xl hover:bg-slate-900 transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center group-hover:bg-blue-950/80 transition">
                    <Mail size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 font-medium">Email</p>
                    <p className="text-sm text-slate-200 truncate">{contact.visitor_email}</p>
                  </div>
                </a>

                {contact.visitor_phone && (
                  <a
                    href={`tel:${contact.visitor_phone}`}
                    className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-850 rounded-xl hover:bg-slate-900 transition group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center group-hover:bg-blue-950/80 transition">
                      <Phone size={18} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-medium">Phone</p>
                      <p className="text-sm text-slate-200">{contact.visitor_phone}</p>
                    </div>
                  </a>
                )}

                {contact.visitor_company && (
                  <div className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-850 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-950/40 border border-blue-900/30 flex items-center justify-center">
                      <Building size={18} className="text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500 font-medium">Company</p>
                      <p className="text-sm text-slate-200">{contact.visitor_company}</p>
                    </div>
                  </div>
                )}
              </div>

              {contact.appointment_start && (
                <div className="p-4 bg-blue-950/20 rounded-xl border border-blue-900/30 mb-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Scheduled Appointment</p>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5">
                        {formatDateRange(contact.appointment_start, contact.appointment_end)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {contact.visitor_notes && (
                <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-850">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare size={16} className="text-blue-400 mt-0.5" />
                    <p className="text-xs font-medium text-slate-400">Message</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{contact.visitor_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
