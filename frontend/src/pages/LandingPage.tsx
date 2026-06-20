import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { QRCodeSVG } from 'qrcode.react';
import {
  Link as LinkIcon,
  QrCode,
  FileText,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  Copy,
  Check,
  Download,
  HelpCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortenedLink {
  id: number;
  original_url: string;
  slug: string;
  click_count: number;
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

export const LandingPage: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [urlInput, setUrlInput] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const qrRef = useRef<HTMLDivElement>(null);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // API Call for guest shortening
  const mutation = useMutation({
    mutationFn: async (payload: { original_url: string; slug?: string }) => {
      return api.post<ShortenedLink>('/links', payload);
    },
    onSuccess: () => {
      setErrorMsg('');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Failed to shorten URL');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    // Add default protocol if missing
    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    mutation.mutate({
      original_url: targetUrl,
      slug: customSlug.trim() || undefined
    });
  };

  const generatedShortUrl = mutation.data
    ? `${window.location.origin}/${mutation.data.slug}`
    : '';

  const handleCopy = () => {
    if (!generatedShortUrl) return;
    navigator.clipboard.writeText(generatedShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = (format: 'png' | 'svg') => {
    if (!qrRef.current) return;
    const svgElement = qrRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);

    if (format === 'svg') {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr_${mutation.data?.slug || 'shortnr'}.svg`;
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
          link.download = `qr_${mutation.data?.slug || 'shortnr'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
  };

  const faqs = [
    {
      q: "How does the short link redirection work?",
      a: "When someone visits your custom short link (e.g., shortnr.app/abc), our server immediately logs the click and redirects the visitor to the original long URL. Redirections happen in milliseconds."
    },
    {
      q: "Can I customize the link slug?",
      a: "Yes! If you are logged in, or using the homepage widget, you can optionally specify a custom slug like '/portfolio' or '/my-resume' instead of getting a random alphanumeric code."
    },
    {
      q: "What is a Link-in-Bio page?",
      a: "It's a beautiful, responsive single-page profile (shortnr.app/@username) designed to hold all your important links: portfolios, social accounts, contact pages, and resumes. It's fully customizable and easy to share."
    },
    {
      q: "Is Shortnr free to use?",
      a: "Yes! Shortnr is fully functional and free. You can create short links, customize slugs, generate QR codes, and design your bio page."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-primary-bg bg-grid-pattern overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Decorative background gradients */}
        <div className="absolute top-0 left-1/4 -z-10 w-96 h-96 bg-brand-primary/10 rounded-full filter blur-3xl opacity-60 animate-pulse" />
        <div className="absolute top-1/3 right-1/4 -z-10 w-96 h-96 bg-brand-highlight/10 rounded-full filter blur-3xl opacity-50 animate-pulse" />

        {/* Premium badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-border-color shadow-xs text-brand-primary text-xs font-semibold mb-6 select-none"
        >
          <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-pulse" />
          Modern Link Ecosystem
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-text-primary max-w-3xl leading-[1.1] mb-6"
        >
          Shorten, Share and Track Links <span className="text-brand-primary">Effortlessly</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-text-secondary max-w-2xl mb-8 leading-relaxed"
        >
          Create short links, generate QR codes, and build your personal bio page in seconds.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          <a
            href="#shorten-widget"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 py-3.5 text-base font-semibold text-white shadow-soft hover:bg-brand-accent transition-all transform hover:-translate-y-0.5"
          >
            Create Short Link
          </a>
          <Link
            to={isAuthenticated ? "/dashboard" : "/signup"}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-color bg-white px-6 py-3.5 text-base font-semibold text-text-primary shadow-xs hover:bg-secondary-bg transition-all transform hover:-translate-y-0.5"
          >
            Get Started
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* URL Shortener Live Widget */}
      <section id="shorten-widget" className="px-4 md:px-8 py-20 bg-linear-to-b from-primary-bg via-secondary-bg/50 to-primary-bg border-y border-border-color/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Try it right now</h2>
            <p className="text-text-secondary text-sm">Paste a long URL and see the generated short link and QR code instantly.</p>
          </div>

          <div className="bg-white/80 border border-white/60 shadow-xl shadow-brand-primary/5 backdrop-blur-md rounded-3xl p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-5 text-text-secondary" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Paste a link to shorten... (e.g. google.com)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 border border-border-color rounded-xl text-text-primary placeholder:text-text-secondary/70 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-brand-primary text-white hover:bg-brand-accent font-semibold px-6 py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                >
                  {mutation.isPending ? 'Shortening...' : 'Shorten'}
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Advanced Slug Customization Toggle */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-primary transition-colors cursor-pointer"
                >
                  {showAdvanced ? 'Hide advanced settings' : 'Customize link slug'}
                  <ChevronDown size={14} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="flex items-center border border-border-color rounded-xl overflow-hidden text-sm max-w-sm">
                        <span className="bg-secondary-bg px-3 py-2 text-text-secondary border-r border-border-color select-none">
                          shortnr/
                        </span>
                        <input
                          type="text"
                          placeholder="custom-slug"
                          value={customSlug}
                          onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9_\-]/g, ''))}
                          className="flex-1 px-3 py-2 focus:outline-hidden text-text-primary placeholder:text-text-secondary/50"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Results Display */}
            <AnimatePresence>
              {mutation.isSuccess && mutation.data && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 pt-8 border-t border-border-color flex flex-col md:flex-row gap-6 items-center justify-between"
                >
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                        Original Link
                      </span>
                      <a
                        href={mutation.data.original_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-text-primary text-sm font-medium hover:underline flex items-center gap-1 break-all"
                      >
                        {mutation.data.original_url}
                        <ExternalLink size={14} className="text-text-secondary flex-shrink-0" />
                      </a>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                        Shortnr URL
                      </span>
                      <div className="flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          readOnly
                          value={generatedShortUrl}
                          className="flex-1 px-3 py-2 bg-secondary-bg border border-border-color rounded-lg text-sm text-text-primary font-semibold focus:outline-hidden"
                        />
                        <button
                          onClick={handleCopy}
                          className="p-2 border border-border-color rounded-lg hover:bg-secondary-bg text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                          title="Copy Link"
                        >
                          {copied ? <Check size={18} className="text-brand-success" /> : <Copy size={18} />}
                        </button>
                        <a
                          href={generatedShortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 border border-border-color rounded-lg hover:bg-secondary-bg text-text-secondary hover:text-text-primary transition-all flex items-center justify-center"
                        >
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* QR Code generator preview card */}
                  <div className="flex flex-col items-center gap-3 p-4 bg-secondary-bg border border-border-color rounded-2xl w-48">
                    <div ref={qrRef} className="bg-white p-2 rounded-lg border border-border-color">
                      <QRCodeSVG
                        value={generatedShortUrl}
                        size={120}
                        bgColor="#FFFFFF"
                        fgColor={mutation.data ? getQrColor(mutation.data.slug) : '#4F46E5'}
                        level="M"
                      />
                    </div>
                    <div className="flex gap-1.5 w-full">
                      <button
                        onClick={() => downloadQR('png')}
                        className="flex-1 flex items-center justify-center gap-1 bg-white border border-border-color rounded-lg py-1.5 text-[11px] font-semibold text-text-primary hover:bg-secondary-bg transition-all cursor-pointer"
                      >
                        <Download size={10} /> PNG
                      </button>
                      <button
                        onClick={() => downloadQR('svg')}
                        className="flex-1 flex items-center justify-center gap-1 bg-white border border-border-color rounded-lg py-1.5 text-[11px] font-semibold text-text-primary hover:bg-secondary-bg transition-all cursor-pointer"
                      >
                        <Download size={10} /> SVG
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-4">
            Everything you need, nothing you don't
          </h2>
          <p className="text-text-secondary text-lg">
            Essential tools for modern builders, optimized for high speed and beautiful presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white border border-border-color rounded-2xl p-6 shadow-xs hover:shadow-soft transition-all duration-300">
            <div className="w-10 h-10 bg-brand-light text-brand-primary flex items-center justify-center rounded-xl mb-4">
              <LinkIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">URL Shortener</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Transform messy, long tracking links into sleek, short URLs with a single click. Fast and reliable redirects.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-border-color rounded-2xl p-6 shadow-xs hover:shadow-soft transition-all duration-300">
            <div className="w-10 h-10 bg-brand-light text-brand-primary flex items-center justify-center rounded-xl mb-4">
              <QrCode size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">QR Code Generator</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Every shortlink instantly gets a corresponding high-quality vector QR code, ready for download in PNG/SVG formats.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-border-color rounded-2xl p-6 shadow-xs hover:shadow-soft transition-all duration-300">
            <div className="w-10 h-10 bg-brand-light text-brand-primary flex items-center justify-center rounded-xl mb-4">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Link-in-Bio Page</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Create a personalized, clean index page showing all your resumes, socials, websites, and portfolios under one handle.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-border-color rounded-2xl p-6 shadow-xs hover:shadow-soft transition-all duration-300">
            <div className="w-10 h-10 bg-brand-light text-brand-primary flex items-center justify-center rounded-xl mb-4">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">Click Tracker</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Keep an eye on total link engagements. Simple counts displayed in your dashboard help monitor reach.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-border-color rounded-2xl p-6 shadow-xs hover:shadow-soft transition-all duration-300">
            <div className="w-10 h-10 bg-brand-light text-brand-primary flex items-center justify-center rounded-xl mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">JWT Authentication</h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Secured signup/login flows ensure only you can manage your links, profiles, and password parameters.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white border border-border-color rounded-2xl p-6 shadow-xs hover:shadow-soft transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-brand-light text-brand-primary flex items-center justify-center rounded-xl mb-4">
                <Check size={20} />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Developer Friendly</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Built with React 19, Vite, Tailwind v4 and Rails 8 API. Completely responsive, lightweight, and modern.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Link-in-Bio Showcase Section */}
      <section className="px-4 md:px-8 py-20 bg-secondary-bg border-y border-border-color">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Text content */}
          <div className="flex-1 space-y-6">
            <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider block">
              LINK-IN-BIO
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
              One link to connect all your profiles
            </h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              Ditch the scattered links. Consolidate your professional identity. Build a single, beautiful landing page for your GitHub, LinkedIn, portfolios, and blogs in under 2 minutes.
            </p>
            <div className="pt-2">
              <Link
                to={isAuthenticated ? "/dashboard" : "/signup"}
                className="inline-flex items-center gap-1.5 font-semibold text-brand-primary hover:text-brand-accent text-sm group"
              >
                Create your bio handle
                <ArrowRight size={16} className="transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Mock-up phone preview */}
          <div className="flex-1 flex justify-center w-full">
            <div className="relative w-72 h-[500px] bg-white border-[8px] border-text-primary rounded-[36px] shadow-premium overflow-hidden flex flex-col items-center p-6">
              {/* Speaker notch */}
              <div className="absolute top-2 w-20 h-4 bg-text-primary rounded-full" />

              {/* Profile mock items */}
              <div className="w-16 h-16 rounded-full bg-brand-light border-2 border-brand-primary flex items-center justify-center text-brand-primary font-bold text-xl mt-6 mb-3">
                JD
              </div>
              <h3 className="font-bold text-text-primary text-base">John Doe</h3>
              <p className="text-text-secondary text-xs text-center max-w-[200px] mb-6">
                Product Designer & Full Stack Dev. Building the future of link sharing.
              </p>

              <div className="w-full space-y-2.5 overflow-y-auto max-h-[220px] pr-1">
                <div className="w-full text-center py-2.5 bg-secondary-bg hover:bg-brand-light/30 rounded-xl border border-border-color text-xs font-semibold text-text-primary cursor-pointer transition-all">
                  Personal Website
                </div>
                <div className="w-full text-center py-2.5 bg-secondary-bg hover:bg-brand-light/30 rounded-xl border border-border-color text-xs font-semibold text-text-primary cursor-pointer transition-all">
                  GitHub
                </div>
                <div className="w-full text-center py-2.5 bg-secondary-bg hover:bg-brand-light/30 rounded-xl border border-border-color text-xs font-semibold text-text-primary cursor-pointer transition-all">
                  LinkedIn
                </div>
                <div className="w-full text-center py-2.5 bg-secondary-bg hover:bg-brand-light/30 rounded-xl border border-border-color text-xs font-semibold text-text-primary cursor-pointer transition-all">
                  My Resume
                </div>
              </div>

              {/* Logo footer */}
              <div className="mt-auto pt-2 flex items-center gap-1 select-none">
                <span className="text-[10px] text-text-secondary">Powered by</span>
                <span className="text-[10px] font-bold text-text-primary">Shortnr</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-3xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-text-secondary">Have questions? We've got answers.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-border-color rounded-xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between px-6 py-4 font-semibold text-text-primary text-left hover:bg-secondary-bg transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-brand-primary flex-shrink-0" />
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`text-text-secondary transform transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-border-color"
                  >
                    <p className="px-6 py-4 text-sm text-text-secondary leading-relaxed bg-secondary-bg/50">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border-color py-12 px-4 md:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-text-primary">
              Short<span className="text-brand-primary">nr</span>
            </span>
            <span className="text-xs text-text-secondary font-medium">
              © {new Date().getFullYear()} All rights reserved. • Developed & designed by <a href="https://codewithsoumya.com" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline font-semibold">codewithsoumya.com</a>
            </span>
          </div>

          <div className="flex gap-6 text-sm text-text-secondary">
            <a href="#features" className="hover:text-brand-primary transition-colors">Features</a>
            <a href="#faq" className="hover:text-brand-primary transition-colors">FAQ</a>
            <Link to="/login" className="hover:text-brand-primary transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-brand-primary transition-colors">Signup</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
