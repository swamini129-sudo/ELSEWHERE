
import React, { useState, useEffect } from 'react';
import { X, User, Lock, Mail, ArrowRight, LogOut } from 'lucide-react';
import { authService } from '../services/auth';
import { UserProfile } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile | null) => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setSuccessMsg(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setMode('signin');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    resetForm();
    setMode('signin');
    onClose();
  };

  const handleModeChange = (newMode: 'signin' | 'signup') => {
    resetForm();
    setMode(newMode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const user = await authService.signIn(email.trim(), password);
        onUserChange(user);
        resetForm();
        setMode('signin');
        onClose();
      } else {
        const user = await authService.signUp(
          email.trim(),
          password,
          displayName.trim()
        );

        onUserChange(user);
        resetForm();
        setMode('signin');
        onClose();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setLoading(true);

    try {
      await authService.signOut();
      onUserChange(null);
      resetForm();
      setMode('signin');
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to sign out.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-ivory rounded-lg border border-sage/40 shadow-elevated overflow-hidden animate-modal-pop">
        {/* Header */}
        <div className="px-6 py-4 bg-forest text-ivory flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-sage-light" />
            <h3 className="text-lg font-serif tracking-wide font-medium">
              {currentUser
                ? 'Student Account'
                : mode === 'signin'
                ? 'Sign In'
                : 'Create Student Account'}
            </h3>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-ivory/70 hover:text-ivory transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-sage/20 border border-sage/40 rounded-md">
                <p className="text-xs text-charcoal-muted uppercase font-mono tracking-wider">
                  Signed in as
                </p>
                <p className="text-lg font-serif font-bold text-forest mt-0.5">
                  {currentUser.display_name}
                </p>
                <p className="text-xs text-charcoal-muted font-mono">
                  {currentUser.email}
                </p>
              </div>

              <p className="text-xs text-charcoal-muted leading-relaxed">
                You can report lost or found belongings, submit ownership
                claims, and review claims on items you reported.
              </p>

              {error && (
                <div className="p-3 bg-rust/10 border border-rust/40 text-rust text-xs rounded">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-rust/10 text-rust border border-rust/30 rounded font-medium text-xs uppercase tracking-wider hover:bg-rust hover:text-ivory transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>{loading ? 'Signing Out...' : 'Sign Out'}</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              {/* Mode tabs */}
              <div className="flex border-b border-sage/30 pb-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
                  className={`flex-1 pb-1 text-xs uppercase tracking-widest font-medium transition-colors ${
                    mode === 'signin'
                      ? 'text-forest border-b-2 border-forest font-bold'
                      : 'text-charcoal-muted hover:text-forest'
                  }`}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => handleModeChange('signup')}
                  className={`flex-1 pb-1 text-xs uppercase tracking-widest font-medium transition-colors ${
                    mode === 'signup'
                      ? 'text-forest border-b-2 border-forest font-bold'
                      : 'text-charcoal-muted hover:text-forest'
                  }`}
                >
                  New Account
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rust/10 border border-rust/40 text-rust text-xs rounded">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-sage/30 border border-sage text-forest text-xs rounded">
                  {successMsg}
                </div>
              )}

              {/* Display name: signup only */}
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="auth-display-name"
                    className="block text-xs uppercase font-mono tracking-wider text-charcoal-muted mb-1"
                  >
                    Full Name / Display Name
                  </label>

                  <div className="relative">
                    <User className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5" />
                    <input
                      id="auth-display-name"
                      name="new-display-name"
                      type="text"
                      required
                      autoComplete="off"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Clara Oswald"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-ivory-light border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs uppercase font-mono tracking-wider text-charcoal-muted mb-1"
                >
                  Campus Email
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5" />
                  <input
                    id="auth-email"
                    name="auth-email"
                    type="email"
                    required
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@campus.edu"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-ivory-light border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-xs uppercase font-mono tracking-wider text-charcoal-muted mb-1"
                >
                  Password
                </label>

                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-muted absolute left-3 top-2.5" />
                  <input
                    id="auth-password"
                    name="auth-password"
                    type="password"
                    required={isSupabaseConfigured}
                    autoComplete={
                      mode === 'signin'
                        ? 'current-password'
                        : 'new-password'
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-ivory-light border border-sage/40 rounded focus:outline-none focus:border-forest text-charcoal"
                  />
                </div>

                {!isSupabaseConfigured && (
                  <p className="text-[11px] text-charcoal-muted/80 mt-1 italic">
                    In local demo mode, any password will sign you in.
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center space-x-2 px-4 py-2.5 bg-forest text-ivory rounded font-medium text-xs uppercase tracking-wider hover:bg-forest-surface transition-colors disabled:opacity-50"
              >
                <span>
                  {loading
                    ? 'Authenticating...'
                    : mode === 'signin'
                    ? 'Sign In'
                    : 'Register Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
