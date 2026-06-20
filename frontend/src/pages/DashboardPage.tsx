import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import {
  Link as LinkIcon,
  QrCode,
  FileText,
  Settings,
  Plus,
  Copy,
  Check,
  Download,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  ArrowUp,
  ArrowDown,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface ShortLink {
  id: number;
  original_url: string;
  slug: string;
  click_count: number;
  created_at: string;
}

interface PaginatedLinks {
  links: ShortLink[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_count: number;
  };
}

interface Stats {
  total_links: number;
  total_clicks: number;
  qr_codes_generated: number;
}

interface BioLink {
  id: number;
  title: string;
  url: string;
  position: number;
}

interface BioProfile {
  id: number;
  username: string;
  display_name?: string;
  bio: string;
  avatar_url: string;
  bio_links: BioLink[];
}

const getQrColor = (slug: string) => {
  if (!slug) return '#4F46E5';
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#4F46E5', // Indigo
    '#0891B2', // Cyan
    '#059669', // Emerald
    '#7C3AED', // Violet
    '#DB2777', // Pink
    '#D97706', // Amber
    '#2563EB', // Blue
    '#9333EA', // Purple
  ];
  return colors[Math.abs(hash) % colors.length];
};

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


export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'links' | 'bio' | 'settings'>('links');
  
  // Links tab state
  const [linksPage, setLinksPage] = useState(1);
  const [urlInput, setUrlInput] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [linkError, setLinkError] = useState('');
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<number | null>(null);
  
  // QR Modal state
  const [qrModalLink, setQrModalLink] = useState<ShortLink | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  // Bio tab state
  const [bioUsername, setBioUsername] = useState(user?.username || '');
  const [bioDisplayName, setBioDisplayName] = useState('');
  const [bioBio, setBioBio] = useState('');
  const [bioAvatar, setBioAvatar] = useState('');
  const [bioError, setBioError] = useState('');
  const [bioSuccess, setBioSuccess] = useState(false);
  
  // Bio Links sub-state
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkError, setNewLinkError] = useState('');
  const [editingBioLink, setEditingBioLink] = useState<BioLink | null>(null);
  const [editBioLinkTitle, setEditBioLinkTitle] = useState('');
  const [editBioLinkUrl, setEditBioLinkUrl] = useState('');

  // Settings state
  const [settingsName, setSettingsName] = useState(user?.name || '');
  const settingsEmail = user?.email || '';
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsError, setSettingsError] = useState('');

  // ------------------
  // Queries & Mutations
  // ------------------

  // 1. Fetch dashboard stats
  const { data: stats, isLoading: isStatsLoading } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => api.get<Stats>('/links/stats'),
  });

  // 2. Fetch paginated links
  const { data: linksData, isLoading: isLinksLoading } = useQuery<PaginatedLinks>({
    queryKey: ['links', linksPage],
    queryFn: () => api.get<PaginatedLinks>(`/links?page=${linksPage}&per_page=7`),
  });

  // 3. Fetch Bio profile
  const { data: bioProfile, isLoading: isBioLoading } = useQuery<BioProfile>({
    queryKey: ['bioProfile'],
    queryFn: async () => {
      const res = await api.get<BioProfile>('/profile');
      setBioUsername(res.username);
      setBioDisplayName(res.display_name || '');
      setBioBio(res.bio || '');
      setBioAvatar(res.avatar_url || '');
      return res;
    },
  });

  // Create link mutation
  const createLinkMutation = useMutation({
    mutationFn: (payload: { original_url: string; slug?: string }) => {
      return api.post<ShortLink>('/links', payload);
    },
    onSuccess: () => {
      setUrlInput('');
      setCustomSlug('');
      setLinkError('');
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (err: any) => {
      setLinkError(err.message || 'Failed to create link');
    }
  });

  // Update link mutation
  const updateLinkMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { original_url: string; slug: string } }) => {
      return api.put<ShortLink>(`/links/${id}`, payload);
    },
    onSuccess: () => {
      setEditingLink(null);
      queryClient.invalidateQueries({ queryKey: ['links'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to update link');
    }
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: (id: number) => {
      return api.delete(`/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete link');
    }
  });

  // Update Bio Profile Mutation
  const updateBioMutation = useMutation({
    mutationFn: (payload: { username: string; display_name: string; bio: string; avatar_url: string }) => {
      return api.put<BioProfile>('/profile', payload);
    },
    onSuccess: (res) => {
      setBioSuccess(true);
      setBioError('');
      updateUser(user?.name || '', res.username);
      queryClient.invalidateQueries({ queryKey: ['bioProfile'] });
      setTimeout(() => setBioSuccess(false), 3000);
    },
    onError: (err: any) => {
      setBioError(err.message || 'Failed to update profile');
    }
  });

  // Add Bio Link Mutation
  const addBioLinkMutation = useMutation({
    mutationFn: (payload: { title: string; url: string }) => {
      return api.post<BioLink>('/profile/links', payload);
    },
    onSuccess: () => {
      setNewLinkTitle('');
      setNewLinkUrl('');
      setNewLinkError('');
      queryClient.invalidateQueries({ queryKey: ['bioProfile'] });
    },
    onError: (err: any) => {
      setNewLinkError(err.message || 'Failed to add link');
    }
  });

  // Edit Bio Link Mutation
  const editBioLinkMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { title: string; url: string } }) => {
      return api.put<BioLink>(`/profile/links/${id}`, payload);
    },
    onSuccess: () => {
      setEditingBioLink(null);
      queryClient.invalidateQueries({ queryKey: ['bioProfile'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to edit link');
    }
  });

  // Delete Bio Link Mutation
  const deleteBioLinkMutation = useMutation({
    mutationFn: (id: number) => {
      return api.delete(`/profile/links/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bioProfile'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete link');
    }
  });

  // Reorder Bio Links Mutation
  const reorderBioLinksMutation = useMutation({
    mutationFn: (linkIds: number[]) => {
      return api.patch<{ message: string; links: BioLink[] }>('/profile/links/reorder', { link_ids: linkIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bioProfile'] });
    }
  });

  // Update Settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (payload: { name: string; password?: string }) => {
      // In Rails backend, current_user can update name / password in standard user controller.
      // For this MVP, we can update it via profile / auth actions, let's keep name sync.
      // We will make a PUT /profile endpoint handle username update, and name update.
      // Wait, we can implement it directly in user profile updating. Let's make profile PUT 
      // accept name. We'll verify if user name can be updated.
      return api.put('/profile', payload);
    },
    onSuccess: () => {
      setSettingsSuccess(true);
      setSettingsError('');
      updateUser(settingsName, user?.username || '');
      setTimeout(() => setSettingsSuccess(false), 3000);
    },
    onError: (err: any) => {
      setSettingsError(err.message || 'Failed to update settings');
    }
  });

  // ------------------
  // Actions & Handlers
  // ------------------

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    createLinkMutation.mutate({
      original_url: targetUrl,
      slug: customSlug.trim() || undefined
    });
  };

  const handleStartEditLink = (link: ShortLink) => {
    setEditingLink(link);
    setEditUrl(link.original_url);
    setEditSlug(link.slug);
  };

  const handleUpdateLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    let targetUrl = editUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    updateLinkMutation.mutate({
      id: editingLink.id,
      payload: {
        original_url: targetUrl,
        slug: editSlug.trim()
      }
    });
  };

  const handleCopy = (linkId: number, slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    updateBioMutation.mutate({
      username: bioUsername,
      display_name: bioDisplayName,
      bio: bioBio,
      avatar_url: bioAvatar
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const webpBase64 = canvas.toDataURL('image/webp', 0.6);
          setBioAvatar(webpBase64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleAddBioLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

    let targetUrl = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    addBioLinkMutation.mutate({
      title: newLinkTitle.trim(),
      url: targetUrl
    });
  };

  const handleStartEditBioLink = (link: BioLink) => {
    setEditingBioLink(link);
    setEditBioLinkTitle(link.title);
    setEditBioLinkUrl(link.url);
  };

  const handleSaveEditBioLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBioLink) return;

    let targetUrl = editBioLinkUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    editBioLinkMutation.mutate({
      id: editingBioLink.id,
      payload: {
        title: editBioLinkTitle.trim(),
        url: targetUrl
      }
    });
  };

  const handleMoveLink = (index: number, direction: 'up' | 'down') => {
    if (!bioProfile?.bio_links) return;
    const newLinks = [...bioProfile.bio_links];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newLinks.length) return;
    
    // Swap
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;
    
    const orderedIds = newLinks.map(l => l.id);
    reorderBioLinksMutation.mutate(orderedIds);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      name: settingsName,
      password: settingsPassword || undefined
    });
  };

  const downloadQR = (format: 'png' | 'svg') => {
    if (!qrRef.current || !qrModalLink) return;
    const svgElement = qrRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const fileName = `qr_${qrModalLink.slug}`;

    if (format === 'svg') {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = 300;
        canvas.height = 300;
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, 300, 300);
          
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `${fileName}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
  };

  return (
    <div className="min-h-screen bg-secondary-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Header Summary */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Dashboard</h1>
            <p className="text-xs text-text-secondary">Welcome back, {user?.name}</p>
          </div>
          
          <div className="flex bg-white rounded-xl border border-border-color p-1 shadow-xs">
            <button
              onClick={() => setActiveTab('links')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'links' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <LinkIcon size={14} /> Links
            </button>
            <button
              onClick={() => setActiveTab('bio')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'bio' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <FileText size={14} /> Link-in-Bio
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-brand-primary text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Settings size={14} /> Settings
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-border-color shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-light text-brand-primary rounded-xl flex items-center justify-center">
              <LinkIcon size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Total Links</span>
              <span className="text-2xl font-bold text-text-primary">{isStatsLoading ? '...' : stats?.total_links}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border-color shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-light text-brand-primary rounded-xl flex items-center justify-center">
              <Activity size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Total Clicks</span>
              <span className="text-2xl font-bold text-text-primary">{isStatsLoading ? '...' : stats?.total_clicks}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-border-color shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-light text-brand-primary rounded-xl flex items-center justify-center">
              <QrCode size={24} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">QR Generated</span>
              <span className="text-2xl font-bold text-text-primary">{isStatsLoading ? '...' : stats?.qr_codes_generated}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Panels */}
        <AnimatePresence mode="wait">
          {activeTab === 'links' && (
            <motion.div
              key="links"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Shortener Tool form */}
              <div className="bg-white rounded-2xl border border-border-color p-6 shadow-xs">
                <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Plus size={18} className="text-brand-primary" /> Create new short link
                </h3>
                <form onSubmit={handleCreateLink} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        required
                        placeholder="Destination URL (e.g. portfolio.com/resume)"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        className="block w-full px-4 py-2.5 border border-border-color rounded-xl text-text-primary placeholder:text-text-secondary/50 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Custom Slug (optional)"
                        value={customSlug}
                        onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, ''))}
                        className="block w-full px-4 py-2.5 border border-border-color rounded-xl text-text-primary placeholder:text-text-secondary/50 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
                      />
                    </div>
                  </div>
                  {linkError && (
                    <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                      <AlertCircle size={14} /> {linkError}
                    </p>
                  )}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={createLinkMutation.isPending}
                      className="bg-brand-primary hover:bg-brand-accent text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {createLinkMutation.isPending ? 'Shortening...' : 'Create link'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Links List */}
              <div className="bg-white rounded-2xl border border-border-color shadow-xs overflow-hidden">
                <div className="px-6 py-4 border-b border-border-color">
                  <h3 className="text-base font-bold text-text-primary">My Short Links</h3>
                </div>

                {isLinksLoading ? (
                  <div className="py-20 flex items-center justify-center text-text-secondary gap-2">
                    <Loader2 className="animate-spin text-brand-primary" size={24} />
                    <span>Loading links...</span>
                  </div>
                ) : !linksData?.links || linksData.links.length === 0 ? (
                  <div className="py-20 text-center text-text-secondary">
                    <LinkIcon className="mx-auto text-border-color mb-4" size={48} />
                    <p className="font-medium text-sm">No links generated yet.</p>
                    <p className="text-xs mt-1">Shorten your first link above to get started.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border-color">
                    {linksData.links.map((link) => (
                      <div key={link.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-secondary-bg/30 transition-all">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary text-sm break-all">
                              {window.location.origin}/{link.slug}
                            </span>
                            <button
                              onClick={() => handleCopy(link.id, link.slug)}
                              className="p-1 text-text-secondary hover:text-text-primary rounded-md transition-all cursor-pointer"
                              title="Copy URL"
                            >
                              {copiedLinkId === link.id ? (
                                <Check size={14} className="text-brand-success" />
                              ) : (
                                <Copy size={14} />
                              )}
                            </button>
                            <a
                              href={`${window.location.origin}/${link.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-text-secondary hover:text-text-primary rounded-md"
                              title="Open shortlink"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                          
                          <p className="text-xs text-text-secondary truncate max-w-lg" title={link.original_url}>
                            {link.original_url}
                          </p>

                          <div className="flex items-center gap-4 text-[10px] text-text-secondary font-medium">
                            <span className="bg-brand-light text-brand-accent px-2 py-0.5 rounded-full font-bold">
                              {link.click_count} {link.click_count === 1 ? 'click' : 'clicks'}
                            </span>
                            <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <button
                            onClick={() => setQrModalLink(link)}
                            className="p-2 border border-border-color rounded-xl text-text-secondary hover:text-text-primary hover:bg-white bg-secondary-bg/50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                            title="View QR Code"
                          >
                            <QrCode size={14} className="text-brand-primary" /> QR Code
                          </button>
                          <button
                            onClick={() => handleStartEditLink(link)}
                            className="p-2 border border-border-color rounded-xl text-text-secondary hover:text-text-primary hover:bg-white bg-secondary-bg/50 transition-all cursor-pointer"
                            title="Edit URL"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this link?')) {
                                deleteLinkMutation.mutate(link.id);
                              }
                            }}
                            className="p-2 border border-border-color rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 bg-secondary-bg/50 transition-all cursor-pointer"
                            title="Delete Link"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {linksData.pagination.total_pages > 1 && (
                      <div className="px-6 py-4 flex items-center justify-between border-t border-border-color text-xs">
                        <span className="text-text-secondary">
                          Page {linksData.pagination.current_page} of {linksData.pagination.total_pages}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <button
                            disabled={linksPage <= 1}
                            onClick={() => setLinksPage(linksPage - 1)}
                            className="p-2 border border-border-color rounded-lg bg-white text-text-primary hover:bg-secondary-bg disabled:opacity-50 transition-all cursor-pointer"
                          >
                            <ChevronLeft size={16} />
                          </button>
                          <button
                            disabled={linksPage >= linksData.pagination.total_pages}
                            onClick={() => setLinksPage(linksPage + 1)}
                            className="p-2 border border-border-color rounded-lg bg-white text-text-primary hover:bg-secondary-bg disabled:opacity-50 transition-all cursor-pointer"
                          >
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Edit shortlink inline dialog */}
              {editingLink && (
                <div className="fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl border border-border-color p-6 max-w-md w-full shadow-premium">
                    <h3 className="text-base font-bold text-text-primary mb-4">Edit short link</h3>
                    <form onSubmit={handleUpdateLinkSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                          Original URL
                        </label>
                        <input
                          type="text"
                          required
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                          Slug
                        </label>
                        <input
                          type="text"
                          required
                          value={editSlug}
                          onChange={(e) => setEditSlug(e.target.value)}
                          className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingLink(null)}
                          className="px-4 py-2 border border-border-color text-xs font-semibold rounded-xl hover:bg-secondary-bg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-accent cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* QR Code Modal */}
              {qrModalLink && (
                <div className="fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl border border-border-color p-6 max-w-sm w-full text-center shadow-premium relative">
                    <button
                      onClick={() => setQrModalLink(null)}
                      className="absolute top-4 right-4 text-text-secondary hover:text-text-primary font-bold text-sm"
                    >
                      ✕
                    </button>
                    <h3 className="text-base font-bold text-text-primary mb-1">QR Code</h3>
                    <p className="text-[11px] text-text-secondary mb-6 break-all">
                      {window.location.origin}/{qrModalLink.slug}
                    </p>

                    <div className="flex justify-center mb-6">
                      <div ref={qrRef} className="bg-white p-3 rounded-xl border border-border-color shadow-xs">
                        <QRCodeSVG
                          value={`${window.location.origin}/${qrModalLink.slug}`}
                          size={180}
                          bgColor="#FFFFFF"
                          fgColor={getQrColor(qrModalLink.slug)}
                          level="H"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={() => downloadQR('png')}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-secondary-bg hover:bg-border-color border border-border-color rounded-xl py-2.5 text-xs font-semibold text-text-primary transition-all cursor-pointer"
                      >
                        <Download size={14} /> Download PNG
                      </button>
                      <button
                        onClick={() => downloadQR('svg')}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-secondary-bg hover:bg-border-color border border-border-color rounded-xl py-2.5 text-xs font-semibold text-text-primary transition-all cursor-pointer"
                      >
                        <Download size={14} /> Download SVG
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'bio' && (
            <motion.div
              key="bio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* Left Column: Editor controls */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Profile fields card */}
                <div className="bg-white rounded-2xl border border-border-color p-6 shadow-xs">
                  <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-1.5">
                    <User size={18} className="text-brand-primary" /> Profile Customization
                  </h3>
                  
                  {isBioLoading ? (
                    <div className="py-6 flex items-center justify-center">
                      <Loader2 className="animate-spin text-brand-primary" size={20} />
                    </div>
                  ) : (
                    <form onSubmit={handleSaveBio} className="space-y-4">
                      {bioSuccess && (
                        <p className="text-xs text-brand-success font-semibold">Profile saved successfully!</p>
                      )}
                      {bioError && (
                        <p className="text-xs text-red-500 font-semibold">{bioError}</p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            Display Name
                          </label>
                          <input
                            type="text"
                            placeholder="John Doe"
                            value={bioDisplayName}
                            onChange={(e) => setBioDisplayName(e.target.value)}
                            className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            Bio Handle
                          </label>
                          <div className="flex items-center border border-border-color rounded-xl overflow-hidden text-sm">
                            <span className="bg-secondary-bg px-3 py-2 text-text-secondary border-r border-border-color select-none">
                              @
                            </span>
                            <input
                              type="text"
                              required
                              value={bioUsername}
                              onChange={(e) => setBioUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_\-]/g, ''))}
                              className="flex-1 px-3 py-2 focus:outline-hidden text-text-primary"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Avatar Image Uploader */}
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            Avatar Image
                          </label>
                          <div className="flex items-center gap-3">
                            <div className={`relative w-12 h-12 rounded-full overflow-hidden border border-border-color flex-shrink-0 flex items-center justify-center ${!isManuallyUploadedAvatar(bioAvatar) ? 'bg-brand-primary' : 'bg-secondary-bg'}`}>
                              {isManuallyUploadedAvatar(bioAvatar) ? (
                                <img src={bioAvatar} alt="preview" className="w-full h-full object-cover" />
                              ) : (
                                <span className="font-bold text-sm text-white uppercase select-none">
                                  {getInitials(bioDisplayName || user?.name || bioUsername)}
                                </span>
                              )}
                              {isManuallyUploadedAvatar(bioAvatar) && (
                                <button
                                  type="button"
                                  onClick={() => setBioAvatar('')}
                                  className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-[9px] font-semibold cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            
                            <div className="flex-grow">
                              <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-border-color hover:border-brand-primary rounded-lg bg-white hover:bg-brand-light/20 text-xs font-semibold text-text-primary cursor-pointer transition-all">
                                <Plus size={12} className="text-brand-primary" />
                                <span>Upload Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                />
                              </label>
                              <p className="text-[10px] text-text-secondary mt-0.5">
                                Compressed to light WebP format.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Bio Description */}
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            Bio Description
                          </label>
                          <textarea
                            placeholder="Tell your profile visitors about yourself..."
                            rows={2}
                            value={bioBio}
                            onChange={(e) => setBioBio(e.target.value)}
                            className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary resize-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={updateBioMutation.isPending}
                          className="bg-brand-primary hover:bg-brand-accent text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          {updateBioMutation.isPending ? 'Saving...' : 'Save Profile'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Add new Bio Link card */}
                <div className="bg-white rounded-2xl border border-border-color p-6 shadow-xs">
                  <h3 className="text-base font-bold text-text-primary mb-4 flex items-center gap-1.5">
                    <Plus size={18} className="text-brand-primary" /> Add Link to Bio
                  </h3>
                  <form onSubmit={handleAddBioLink} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Link Title (e.g. My GitHub)"
                        value={newLinkTitle}
                        onChange={(e) => setNewLinkTitle(e.target.value)}
                        className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary"
                      />
                      <input
                        type="text"
                        required
                        placeholder="URL (e.g. github.com/username)"
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary"
                      />
                    </div>
                    {newLinkError && (
                      <p className="text-xs text-red-500 font-semibold">{newLinkError}</p>
                    )}
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={addBioLinkMutation.isPending}
                        className="bg-brand-primary hover:bg-brand-accent text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {addBioLinkMutation.isPending ? 'Adding...' : 'Add Link'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Links order listing */}
                <div className="bg-white rounded-2xl border border-border-color shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-border-color">
                    <h3 className="text-base font-bold text-text-primary">Bio Page Links</h3>
                  </div>

                  {!bioProfile?.bio_links || bioProfile.bio_links.length === 0 ? (
                    <div className="py-12 text-center text-text-secondary">
                      <Globe className="mx-auto text-border-color mb-3" size={32} />
                      <p className="font-semibold text-xs">No links added to profile yet.</p>
                      <p className="text-[11px] mt-0.5">Use the widget above to populate your bio list.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border-color">
                      {bioProfile.bio_links.map((link, idx) => (
                        <div key={link.id} className="p-4 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-text-primary text-sm">{link.title}</span>
                            <span className="block text-[11px] text-text-secondary truncate">{link.url}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Reorder actions */}
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveLink(idx, 'up')}
                              className="p-1 border border-border-color rounded-lg bg-white text-text-secondary hover:text-text-primary disabled:opacity-40 transition-all cursor-pointer"
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              disabled={idx === bioProfile.bio_links.length - 1}
                              onClick={() => handleMoveLink(idx, 'down')}
                              className="p-1 border border-border-color rounded-lg bg-white text-text-secondary hover:text-text-primary disabled:opacity-40 transition-all cursor-pointer"
                            >
                              <ArrowDown size={14} />
                            </button>
                            
                            {/* Edit Action */}
                            <button
                              onClick={() => handleStartEditBioLink(link)}
                              className="p-1.5 border border-border-color rounded-lg text-text-secondary hover:text-text-primary hover:bg-secondary-bg transition-all cursor-pointer ml-2"
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Delete Action */}
                            <button
                              onClick={() => {
                                if (confirm('Remove this link from bio profile?')) {
                                  deleteBioLinkMutation.mutate(link.id);
                                }
                              }}
                              className="p-1.5 border border-border-color rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Edit Bio Link Dialog */}
                {editingBioLink && (
                  <div className="fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl border border-border-color p-6 max-w-md w-full shadow-premium">
                      <h3 className="text-base font-bold text-text-primary mb-4">Edit bio link</h3>
                      <form onSubmit={handleSaveEditBioLink} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            required
                            value={editBioLinkTitle}
                            onChange={(e) => setEditBioLinkTitle(e.target.value)}
                            className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                            URL
                          </label>
                          <input
                            type="text"
                            required
                            value={editBioLinkUrl}
                            onChange={(e) => setEditBioLinkUrl(e.target.value)}
                            className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary"
                          />
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setEditingBioLink(null)}
                            className="px-4 py-2 border border-border-color text-xs font-semibold rounded-xl hover:bg-secondary-bg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-xl hover:bg-brand-accent cursor-pointer"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Phone Mock-up Live Preview */}
              <div className="lg:col-span-5 flex flex-col items-center sticky top-24">
                <span className="text-xs font-bold text-text-secondary mb-3 uppercase tracking-wider">
                  Live Bio Profile Preview
                </span>

                <div className="relative w-64 h-[440px] bg-white border-[6px] border-text-primary rounded-[30px] shadow-premium overflow-hidden flex flex-col items-center p-4">
                  {/* Speaker notch */}
                  <div className="absolute top-1.5 w-16 h-3.5 bg-text-primary rounded-full" />
                  
                  {/* Profile Mock Avatar */}
                  <div className={`w-14 h-14 rounded-full overflow-hidden border border-border-color flex items-center justify-center mt-4 mb-2 ${!isManuallyUploadedAvatar(bioAvatar) ? 'bg-brand-primary' : 'bg-secondary-bg'}`}>
                    {isManuallyUploadedAvatar(bioAvatar) ? (
                      <img src={bioAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-sm text-white uppercase select-none">
                        {getInitials(bioDisplayName || user?.name || bioUsername)}
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-text-primary text-sm text-center leading-tight">
                    {bioDisplayName || user?.name || bioUsername || 'Your Name'}
                  </h4>
                  <span className="text-[10px] text-text-secondary">@{bioUsername || 'username'}</span>
                  
                  <p className="text-text-secondary text-[10px] text-center max-w-[180px] mb-4 mt-1 line-clamp-3">
                    {bioBio || 'Tell your visitors about yourself...'}
                  </p>

                  <div className="w-full space-y-2 overflow-y-auto max-h-[190px] pr-0.5">
                    {bioProfile?.bio_links?.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full text-center py-2 bg-secondary-bg hover:bg-brand-light/30 rounded-lg border border-border-color text-[10px] font-semibold text-text-primary transition-all"
                      >
                        {link.title}
                      </a>
                    ))}
                  </div>

                  {/* Logo footer */}
                  <div className="mt-auto pt-2 flex items-center gap-1 select-none">
                    <span className="text-[9px] text-text-secondary">Powered by</span>
                    <span className="text-[9px] font-extrabold text-text-primary">Shortnr</span>
                  </div>
                </div>

                <a
                  href={`${window.location.origin}/@${bioUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center gap-1 text-xs font-semibold text-brand-primary hover:text-brand-accent transition-all"
                >
                  View Public Bio Page <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-xl mx-auto"
            >
              <div className="bg-white rounded-2xl border border-border-color p-6 md:p-8 shadow-xs">
                <h3 className="text-base font-bold text-text-primary mb-6">Account Settings</h3>
                
                <form onSubmit={handleSettingsSubmit} className="space-y-5">
                  {settingsSuccess && (
                    <p className="text-xs text-brand-success font-semibold">Settings saved successfully!</p>
                  )}
                  {settingsError && (
                    <p className="text-xs text-red-500 font-semibold">{settingsError}</p>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsName}
                      onChange={(e) => setSettingsName(e.target.value)}
                      className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={settingsEmail}
                      className="block w-full px-3 py-2 border border-border-color rounded-xl bg-secondary-bg text-text-secondary text-sm focus:outline-hidden cursor-not-allowed"
                    />
                    <span className="text-[10px] text-text-secondary mt-1 block">Email address cannot be changed.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={settingsPassword}
                      onChange={(e) => setSettingsPassword(e.target.value)}
                      className="block w-full px-3 py-2 border border-border-color rounded-xl text-text-primary text-sm focus:outline-hidden focus:border-brand-primary"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={updateSettingsMutation.isPending}
                      className="bg-brand-primary hover:bg-brand-accent text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {updateSettingsMutation.isPending ? 'Updating...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
