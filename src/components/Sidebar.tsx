import { LayoutGrid, BarChart3, Settings, LogOut, Menu, X, Users, FileText } from 'lucide-react';
import { useState } from 'react';
import { BusinessCard } from '../lib/firebase';
import BusinessCardPDFGenerator from './BusinessCardPDFGenerator';

interface SidebarProps {
  activeView: 'cards' | 'analytics' | 'contacts' | 'settings';
  onViewChange: (view: 'cards' | 'analytics' | 'contacts' | 'settings') => void;
  userEmail?: string;
  onSignOut: () => void;
  selectedCard?: BusinessCard | null;
}

export default function Sidebar({ activeView, onViewChange, userEmail, onSignOut, selectedCard }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);

  const menuItems = [
    { id: 'cards', label: 'My Cards', icon: LayoutGrid },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'contacts', label: 'Shared Contacts', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 lg:hidden bg-white rounded-lg shadow-md hover:shadow-lg transition"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 lg:translate-x-0 lg:relative lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">Orvion</h1>
            {userEmail && <p className="text-sm text-slate-600 mt-2 truncate">{userEmail}</p>}
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id as 'cards' | 'analytics' | 'contacts' | 'settings');
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      activeView === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-slate-200 space-y-2">
            {selectedCard && (
              <button
                onClick={() => {
                  setShowPDFGenerator(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <FileText size={20} />
                <span className="font-medium">Print Card</span>
              </button>
            )}
            <button
              onClick={() => {
                onSignOut();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="hidden lg:block" />

      {showPDFGenerator && selectedCard && (
        <BusinessCardPDFGenerator
          card={selectedCard}
          onClose={() => setShowPDFGenerator(false)}
        />
      )}
    </>
  );
}
