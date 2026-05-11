import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Loader2, Lock, Mail, User, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

function getAuthErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  if (code.includes('email-already-in-use')) return 'That email already has an account.';
  if (code.includes('invalid-credential')) return 'Email or password does not look right.';
  if (code.includes('weak-password')) return 'Use at least 6 characters for your password.';
  if (code.includes('invalid-email')) return 'Enter a valid email address.';
  if (code.includes('too-many-requests')) return 'Too many attempts. Try again in a little while.';
  if (code.includes('unauthorized-domain')) return 'This domain is not authorized in Firebase Authentication settings.';
  if (code.includes('popup-blocked')) return 'The browser blocked the Google sign-in popup.';
  if (code.includes('popup-closed-by-user')) return 'Google sign-in was closed before it finished.';
  if (code.includes('operation-not-allowed')) return 'This sign-in method is not enabled in Firebase.';

  if (error instanceof Error && error.message) return error.message;

  return code ? `Authentication failed: ${code}` : 'Authentication failed. Please try again.';
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { authError, clearAuthError, firebaseReady, signIn, signInWithGoogle, signUp } = useAuth();
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isSignUp = mode === 'sign-up';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    clearAuthError();
    setBusy(true);

    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    clearAuthError();
    setBusy(true);

    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-void/70 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 8 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-sm rounded-xl border border-border bg-surface shadow-modal overflow-hidden"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 w-8 h-8 rounded-md flex items-center justify-center text-ink-dim hover:text-ink hover:bg-surface-raised transition-colors"
              title="Close"
            >
              <X size={16} />
            </button>

            <div className="px-6 pt-8 pb-5 border-b border-border">
              <div className="w-11 h-11 rounded-lg bg-glow-gold/10 border border-glow-gold/30 flex items-center justify-center mb-4">
                <Lock size={20} className="text-glow-gold" />
              </div>
              <h2 className="font-display text-xl text-ink">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="mt-1 text-sm text-ink-muted font-body">
                Save your Life Skill Atlas progress across devices.
              </p>
            </div>

            {!firebaseReady ? (
              <div className="px-6 py-5">
                <div className="rounded-lg border border-glow-gold/30 bg-glow-gold/10 p-3 text-sm text-ink-muted">
                  Add your Firebase web config to `.env` using `.env.example`, then restart the dev server to enable accounts.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={busy}
                  className="w-full h-11 rounded-lg border border-border bg-surface-raised text-ink font-heading font-bold text-sm hover:bg-surface-high disabled:cursor-wait disabled:opacity-70 transition-all flex items-center justify-center gap-3"
                >
                  <span className="text-base font-body font-bold text-[#4285F4]">G</span>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-ink-dim">
                    or
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                {isSignUp && (
                  <label className="block">
                    <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-ink-dim">
                      Name
                    </span>
                    <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 focus-within:border-glow-gold/50">
                      <User size={15} className="text-ink-dim" />
                      <input
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-dim"
                        placeholder="Optional"
                        autoComplete="name"
                      />
                    </div>
                  </label>
                )}

                <label className="block">
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-ink-dim">
                    Email
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 focus-within:border-glow-gold/50">
                    <Mail size={15} className="text-ink-dim" />
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-dim"
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-ink-dim">
                    Password
                  </span>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-surface-raised px-3 focus-within:border-glow-gold/50">
                    <Lock size={15} className="text-ink-dim" />
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-dim"
                      placeholder="At least 6 characters"
                      type="password"
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      required
                      minLength={6}
                    />
                  </div>
                </label>

                {(error || authError) && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-ink-muted">
                    <AlertCircle size={14} className="mt-0.5 flex-shrink-0 text-destructive" />
                    <span>{error || authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full h-11 rounded-lg bg-glow-gold text-void font-heading font-bold text-sm hover:brightness-110 disabled:cursor-wait disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                >
                  {busy && <Loader2 size={15} className="animate-spin" />}
                  {isSignUp ? 'Create account' : 'Sign in'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode(isSignUp ? 'sign-in' : 'sign-up');
                    setError('');
                    clearAuthError();
                  }}
                  className="w-full text-center text-xs text-ink-muted hover:text-ink transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
