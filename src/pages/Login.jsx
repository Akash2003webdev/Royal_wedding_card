import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { signInWithEmail, signUpWithEmail, signInWithGoogle } from '../supabase/auth.js';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.redirect || '/account';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
        toast.success('Welcome back!');
      } else {
        await signUpWithEmail(email, password);
        toast.success('Account created! You can now sign in.');
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      toast.error(err.message || 'Google sign-in failed.');
    }
  };

  return (
    <div className="pt-32 pb-20 max-w-md mx-auto px-6">
      <h1 className="text-3xl font-heading font-bold mb-2 text-center">
        {mode === 'signin' ? 'Sign In' : 'Create Account'}
      </h1>
      <p className="text-center text-neutral-500 mb-8 text-sm">
        {location.state?.redirect
          ? 'Please sign in to continue with your purchase.'
          : 'Sign in to manage your account and orders.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="relative">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform disabled:opacity-60"
        >
          {submitting ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
        <span className="text-xs text-neutral-400">OR</span>
        <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
      </div>

      <button
        onClick={handleGoogle}
        className="w-full border border-neutral-300 dark:border-neutral-700 py-3 rounded-full font-semibold hover:bg-accent dark:hover:bg-neutral-900 transition-colors mb-6"
      >
        Continue with Google
      </button>

      <p className="text-center text-sm text-neutral-500">
        {mode === 'signin' ? (
          <>
            New here?{' '}
            <button onClick={() => setMode('signup')} className="text-primary font-semibold underline">
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button onClick={() => setMode('signin')} className="text-primary font-semibold underline">
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="text-center text-xs text-neutral-400 mt-8">
        <Link to="/" className="hover:text-primary">← Continue browsing without signing in</Link>
      </p>
    </div>
  );
}
