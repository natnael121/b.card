import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import PublicCard from './components/PublicCard';

function AppContent() {
  const { user, loading } = useAuth();
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    const path = window.location.pathname;
    const cardMatch = path.match(/^\/c\/([^/]+)$/);
    if (cardMatch) {
      setSlug(cardMatch[1]);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (slug) {
    return <PublicCard slug={slug} />;
  }

  if (!user) {
    return <AuthForm />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
