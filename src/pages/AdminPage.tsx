import React, { useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { Link2, Copy, MessageSquareText, Sparkles } from 'lucide-react';
import { wedding } from '../config/wedding';
import {
  GUEST_PREFIXES,
  GuestPrefix,
  buildDisplayName,
  buildGreeting,
  buildInvitationLink,
  buildInvitationMessage,
  normalizeName,
} from '../lib/guest';

interface Generated {
  displayName: string;
  link: string;
  message: string;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback for older browsers / non-secure contexts
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

export const AdminPage: React.FC = () => {
  const [prefix, setPrefix] = useState<GuestPrefix>('Mr.');
  const [guestName, setGuestName] = useState('');
  const [generated, setGenerated] = useState<Generated | null>(null);

  const livePreview = useMemo(() => buildDisplayName(prefix, guestName), [prefix, guestName]);

  // Inputs changed after generating -> the generated link is out of date
  const isStale = generated !== null && generated.displayName !== livePreview;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normalizeName(guestName)) {
      toast.error('Please enter a guest name.');
      return;
    }
    const displayName = buildDisplayName(prefix, guestName);
    const link = buildInvitationLink(window.location.origin, prefix, guestName);
    const message = buildInvitationMessage({
      displayName,
      link,
      groomName: wedding.groomName,
      brideName: wedding.brideName,
    });
    setGenerated({ displayName, link, message });
  };

  const handleCopy = async (text: string, label: string) => {
    await copyText(text);
    toast.success(label);
  };

  const canCopy = generated !== null && !isStale;

  return (
    <div className="min-h-screen bg-royal font-sans text-brand-mocha px-4 py-10 sm:py-16">
      <Toaster position="top-center" />

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="uppercase tracking-[0.4em] text-[10px] sm:text-[11px] font-bold text-brand-sand">
            Admin · Invitation Links
          </span>
          <h1 className="font-display text-4xl sm:text-5xl mt-3 text-gold-shimmer">
            {wedding.brideName} & {wedding.groomName}
          </h1>
        </div>

        <form
          onSubmit={handleGenerate}
          className="glass rounded-3xl border border-brand-gold/30 p-6 sm:p-10 space-y-6 shadow-[0_30px_60px_rgba(142,107,184,0.15)]"
        >
          <div className="grid sm:grid-cols-[180px_1fr] gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sand mb-2">
                Prefix
              </label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value as GuestPrefix)}
                className="w-full bg-brand-pearl/80 px-4 py-3 rounded-xl border border-brand-gold/30 focus:ring-2 focus:ring-brand-gold/40 outline-none text-brand-mocha"
              >
                {GUEST_PREFIXES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sand mb-2">
                Guest Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g. Sanjaya"
                className="w-full bg-brand-pearl/80 px-4 py-3 rounded-xl border border-brand-gold/30 focus:ring-2 focus:ring-brand-gold/40 outline-none text-brand-mocha placeholder:text-brand-sand/40"
              />
            </div>
          </div>

          {livePreview && (
            <p className="text-sm text-brand-sand">
              Greeting: <span className="text-brand-mocha font-semibold">{buildGreeting(livePreview)}</span>
            </p>
          )}

          <div className="grid sm:grid-cols-3 gap-3">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-brand-mocha text-brand-ivory py-3 rounded-xl font-bold text-xs uppercase tracking-[0.15em] hover:brightness-110 transition"
            >
              <Link2 className="w-4 h-4" /> Generate Link
            </button>
            <button
              type="button"
              disabled={!canCopy}
              onClick={() => generated && handleCopy(generated.link, 'Link copied!')}
              className="flex items-center justify-center gap-2 border border-brand-gold/50 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-brand-gold/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy className="w-4 h-4" /> Copy Link Only
            </button>
            <button
              type="button"
              disabled={!canCopy}
              onClick={() => generated && handleCopy(generated.message, 'Message copied!')}
              className="flex items-center justify-center gap-2 border border-brand-gold/50 py-3 rounded-xl font-bold text-xs uppercase tracking-[0.15em] hover:bg-brand-gold/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <MessageSquareText className="w-4 h-4" /> Copy Full Message
            </button>
          </div>

          {isStale && (
            <p className="text-xs text-brand-sand/80 text-center">
              Details changed – click <strong>Generate Link</strong> again to update.
            </p>
          )}
        </form>

        {generated && (
          <div className="mt-8 space-y-6">
            <div className="glass rounded-2xl border border-brand-gold/30 p-5">
              <span className="block text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sand mb-2">
                Generated Link
              </span>
              <a
                href={generated.link}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-brand-mocha underline decoration-brand-gold/40 underline-offset-4 hover:text-brand-gold"
              >
                {generated.link}
              </a>
            </div>

            <div className="glass rounded-2xl border border-brand-gold/30 p-5">
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-brand-sand mb-3">
                <Sparkles className="w-3 h-3" /> Message Preview
              </span>
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-brand-mocha">
                {generated.message}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
