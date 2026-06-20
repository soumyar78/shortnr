import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { IconLogo } from '../components/Logo';
import { PublicBioPage } from './PublicBioPage';

export const RedirectPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [errorMsg, setErrorMsg] = useState('');
  const calledForSlug = useRef<string | null>(null);

  if (slug?.startsWith('@')) {
    return <PublicBioPage />;
  }

  useEffect(() => {
    if (!slug) return;
    if (calledForSlug.current === slug) return;
    calledForSlug.current = slug;

    const resolveSlug = async () => {
      try {
        const data = await api.get<{ original_url: string }>(`/links/resolve/${slug}`);
        if (data.original_url) {
          // Perform full browser redirection
          window.location.replace(data.original_url);
        } else {
          setErrorMsg('Destination not found');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Link could not be resolved');
      }
    };

    resolveSlug();
  }, [slug]);

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-secondary-bg flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Short Link Not Found</h1>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          The link you are trying to access doesn't exist, is incorrect, or has expired.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 px-4 py-2 border border-border-color bg-white rounded-xl text-xs font-semibold text-text-primary shadow-xs hover:bg-secondary-bg transition-all"
        >
          <ArrowLeft size={14} /> Back to Shortnr
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-bg flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center text-center space-y-4 max-w-xs">
        <IconLogo size={48} className="animate-pulse text-brand-primary" />
        <h2 className="text-base font-bold text-text-primary">Redirecting you...</h2>
        <p className="text-xs text-text-secondary">
          We are redirecting you to your destination. Please hold on a moment.
        </p>
        <Loader2 className="animate-spin text-brand-primary mt-4" size={24} />
      </div>
    </div>
  );
};
