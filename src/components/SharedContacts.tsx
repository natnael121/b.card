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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-slate-600">Loading shared contacts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Shared Contacts</h2>
        <p className="text-slate-600">People who have shared their contact information with you</p>
      </div>

      {contacts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Shared Contacts Yet</h3>
          <p className="text-slate-600 mb-4">
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
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-slate-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {contact.visitor_name}
                    </h3>
                    {contact.appointment_start && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
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
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 font-medium">Email</p>
                    <p className="text-sm text-slate-900 truncate">{contact.visitor_email}</p>
                  </div>
                </a>

                {contact.visitor_phone && (
                  <a
                    href={`tel:${contact.visitor_phone}`}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition">
                      <Phone size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 font-medium">Phone</p>
                      <p className="text-sm text-slate-900">{contact.visitor_phone}</p>
                    </div>
                  </a>
                )}

                {contact.visitor_company && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 font-medium">Company</p>
                      <p className="text-sm text-slate-900">{contact.visitor_company}</p>
                    </div>
                  </div>
                )}
              </div>

              {contact.appointment_start && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 mb-4 flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">Scheduled Appointment</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">
                        {formatDateRange(contact.appointment_start, contact.appointment_end)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {contact.visitor_notes && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare size={16} className="text-blue-600 mt-0.5" />
                    <p className="text-xs font-medium text-blue-900">Message</p>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{contact.visitor_notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
