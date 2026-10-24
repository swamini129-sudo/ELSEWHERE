import React from 'react';
import { X, CheckCircle, Database, ExternalLink, Copy, Check } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BackendStatusModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const copyEnvSample = () => {
    navigator.clipboard.writeText(`VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOi...`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-ivory rounded-lg border border-sage/40 shadow-elevated overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="px-6 py-4 bg-forest text-ivory flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Database className="w-5 h-5 text-sage-light" />
            <h3 className="text-lg font-serif tracking-wide font-medium">Backend Architecture &amp; Database Status</h3>
          </div>
          <button
            onClick={onClose}
            className="text-ivory/70 hover:text-ivory transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm text-charcoal">
          {isSupabaseConfigured ? (
            <div className="p-4 bg-sage/20 border border-sage rounded-md flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-forest mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-forest">Live Supabase Database Connected</p>
                <p className="text-xs text-charcoal-muted mt-1">
                  The application is actively reading and writing to your live PostgreSQL database, Row Level Security policies, and Supabase Storage bucket for photographs.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rust/10 border border-rust/30 rounded-md">
              <div className="flex items-start space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-rust mt-1.5 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="font-semibold text-forest">Running in Local Persistence Demo Mode</p>
                  <p className="text-xs text-charcoal-muted mt-1 leading-relaxed">
                    Supabase environment variables are currently using placeholders. The application is completely functional: reports, uploaded photos (saved as persistent data URLs), search filters, Memory Match, claims, and status transitions are <strong>fully persistent in your browser storage across page refreshes</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-serif text-base text-forest font-semibold mb-2">How to Connect Shared Supabase PostgreSQL &amp; Storage</h4>
            <ol className="list-decimal list-inside space-y-2 text-xs text-charcoal-muted leading-relaxed">
              <li>
                Create a free project at{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-rust underline inline-flex items-center gap-1 font-medium"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>.
              </li>
              <li>
                Open the Supabase SQL Editor and run the included schema script located at{' '}
                <code className="bg-ivory-dark px-1.5 py-0.5 rounded text-forest font-mono">
                  supabase/schema.sql
                </code>{' '}
                to create tables, foreign keys, RLS security policies, and storage bucket.
              </li>
              <li>
                In your project root, add your project credentials to <code className="bg-ivory-dark px-1.5 py-0.5 rounded text-forest font-mono">.env</code>:
              </li>
            </ol>

            <div className="mt-3 relative bg-forest-deep text-ivory/90 p-3 rounded font-mono text-xs overflow-x-auto">
              <div className="flex justify-between items-center mb-1 text-[11px] text-sage">
                <span>.env</span>
                <button
                  onClick={copyEnvSample}
                  className="flex items-center gap-1 hover:text-ivory transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-sage" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p>VITE_SUPABASE_URL=https://&lt;your-project&gt;.supabase.co</p>
              <p>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</p>
            </div>
          </div>

          <div className="pt-2 border-t border-sage/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-forest text-ivory text-xs uppercase tracking-wider font-medium rounded hover:bg-forest-surface transition-colors"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
