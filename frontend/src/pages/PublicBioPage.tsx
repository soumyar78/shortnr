import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Globe, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

interface BioLink {
  id: number;
  title: string;
  url: string;
}

interface BioProfile {
  name?: string;
  display_name?: string;
  username: string;
  bio: string;
  avatar_url: string;
  bio_links: BioLink[];
}

const getInitials = (name?: string, fallback: string = 'A') => {
  if (!name) return fallback.slice(0, 2).toUpperCase();
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
};

const isManuallyUploadedAvatar = (url?: string | null) => {
  if (!url) return false;
  if (url.includes('api.dicebear.com')) return false;
  return true;
};


export const PublicBioPage: React.FC = () => {
  const { username, slug } = useParams<{ username?: string; slug?: string }>();

  // Clean the username prefix if it has '@'
  const rawUsername = username || slug || '';
  const targetUsername = rawUsername.replace(/^@/, '');

  const { data: profile, isLoading, isError } = useQuery<BioProfile>({
    queryKey: ['publicBio', targetUsername],
    queryFn: () => api.get<BioProfile>(`/bio/${targetUsername}`),
    enabled: !!targetUsername,
    retry: false
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-bg flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-brand-primary mb-2" size={32} />
        <span className="text-sm font-semibold text-text-secondary">Loading profile...</span>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-secondary-bg flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-text-primary mb-2">Profile Not Found</h1>
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          The Link-in-bio profile you are trying to view does not exist or has been removed.
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
    <div className="min-h-screen bg-secondary-bg flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Profile Avatar */}
        <div className={`w-24 h-24 rounded-full overflow-hidden border-2 border-brand-primary shadow-soft flex items-center justify-center mb-4 ${!isManuallyUploadedAvatar(profile.avatar_url) ? 'bg-brand-primary' : 'bg-white'}`}>
          {isManuallyUploadedAvatar(profile.avatar_url) ? (
            <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-2xl text-white uppercase select-none">
              {getInitials(profile.display_name || profile.name || profile.username)}
            </span>
          )}
        </div>

        {/* Display Name */}
        <h1 className="text-xl font-bold text-text-primary text-center">
          {profile.display_name || profile.name || profile.username}
        </h1>
        
        {/* Username Handle */}
        <span className="text-xs text-text-secondary mt-0.5 mb-6">@{profile.username}</span>

        {/* Biography */}
        {profile.bio && (
          <p className="text-text-secondary text-sm text-center max-w-xs mt-2 mb-8 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Bio links list */}
        <div className="w-full space-y-3.5 mb-12">
          {profile.bio_links && profile.bio_links.length > 0 ? (
            profile.bio_links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center py-4 bg-white hover:bg-brand-light/30 rounded-2xl border border-border-color hover:border-brand-primary text-sm font-semibold text-text-primary transition-all duration-200 transform hover:-translate-y-0.5 shadow-xs"
              >
                {link.title}
              </a>
            ))
          ) : (
            <div className="text-center py-8 text-text-secondary border border-dashed border-border-color rounded-2xl bg-white/50">
              <Globe className="mx-auto text-border-color mb-2" size={24} />
              <p className="text-xs font-semibold">This profile has no links yet.</p>
            </div>
          )}
        </div>

        {/* Branding Footer */}
        <Link to="/" className="inline-flex items-center gap-1 mt-auto select-none group text-xs text-text-secondary hover:text-text-primary transition-colors">
          <span>Powered by</span>
          <span className="font-extrabold text-text-primary group-hover:text-brand-primary transition-colors">
            Short<span className="text-brand-primary">nr</span>
          </span>
        </Link>
      </div>
    </div>
  );
};
