'use client';

import { useState } from 'react';
import { ChevronRight, Lock, Mail, Target, User } from 'lucide-react';
import { loginWithPassword, registerWithPassword } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { useOkrStore } from '../lib/store';

function readErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return 'Request failed';

  const raw = error.message || 'Request failed';
  try {
    const parsed = JSON.parse(raw) as { message?: string | string[] };
    if (Array.isArray(parsed.message)) return parsed.message.join('; ');
    if (typeof parsed.message === 'string') return parsed.message;
  } catch {
    // Keep raw message when response is not JSON.
  }
  return raw;
}

export default function Login() {
  const login = useOkrStore((s) => s.login);
  const { t, language } = useI18n();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isZh = language === 'zh';

  const labels = {
    signInTab: isZh ? '登录' : 'Sign In',
    registerTab: isZh ? '注册' : 'Register',
    email: isZh ? '邮箱' : 'Email',
    password: isZh ? '密码' : 'Password',
    displayName: isZh ? '显示名称' : 'Display Name',
    confirmPassword: isZh ? '确认密码' : 'Confirm Password',
    needAccount: isZh ? '还没有账号？' : 'Need an account?',
    haveAccount: isZh ? '已有账号？' : 'Already have an account?',
    goRegister: isZh ? '去注册' : 'Create one',
    goLogin: isZh ? '去登录' : 'Sign in now',
    creating: isZh ? '注册中...' : 'Creating...',
    signingIn: isZh ? '登录中...' : 'Signing in...',
    createAccount: isZh ? '创建账户' : 'Create Account',
    passwordMismatch: isZh ? '两次输入的密码不一致' : 'Passwords do not match',
    authFailed: isZh ? '登录或注册失败' : 'Authentication failed',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError(labels.authFailed);
      return;
    }

    if (mode === 'register') {
      if (!displayName.trim()) {
        setError(labels.authFailed);
        return;
      }
      if (password !== confirmPassword) {
        setError(labels.passwordMismatch);
        return;
      }
    }

    setSubmitting(true);
    try {
      const auth =
        mode === 'login'
          ? await loginWithPassword({ email: email.trim(), password })
          : await registerWithPassword({ displayName: displayName.trim(), email: email.trim(), password });

      login(auth.user.displayName, rememberMe);
    } catch (err) {
      setError(readErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 selection:bg-orange-100">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-[#8B5F2E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-900/20">
            <Target className="w-7 h-7" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-gray-900 bg-clip-text">Stitch<span className="text-[#8B5F2E]">OKR</span></span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 pt-10 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#D97706] to-[#8B5F2E]" />

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('loginWelcome')}</h2>
            <p className="text-sm text-gray-500">{t('loginSubtitle')}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {labels.signInTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              {labels.registerTab}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> {labels.displayName}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3.5 px-4 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B5F2E]/50 focus:border-[#8B5F2E]"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 tracking-wider uppercase flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> {labels.email}
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3.5 px-4 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B5F2E]/50 focus:border-[#8B5F2E]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 tracking-wider uppercase flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> {labels.password}
              </label>
              <input
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3.5 px-4 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B5F2E]/50 focus:border-[#8B5F2E]"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5" /> {labels.confirmPassword}
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3.5 px-4 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#8B5F2E]/50 focus:border-[#8B5F2E]"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group/node">
                <div 
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition ${rememberMe ? 'bg-[#D97706] border-[#D97706]' : 'bg-gray-50 border-gray-300 group-hover/node:border-gray-400'}`}
                >
                  {rememberMe && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className="text-xs font-semibold text-gray-500 group-hover/node:text-gray-700 transition-colors">
                  {t('rememberMe')}
                </span>
              </label>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full group relative flex items-center justify-center gap-2 bg-[#D97706] hover:bg-[#B45309] disabled:opacity-60 text-white py-3.5 px-4 rounded-lg font-bold transition-all shadow-md hover:shadow-lg overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {submitting
                  ? mode === 'login'
                    ? labels.signingIn
                    : labels.creating
                  : mode === 'login'
                    ? t('signIn')
                    : labels.createAccount}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-500">
            {mode === 'login' ? labels.needAccount : labels.haveAccount}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="font-semibold text-[#8B5F2E] hover:text-[#B45309]"
            >
              {mode === 'login' ? labels.goRegister : labels.goLogin}
            </button>
          </p>

          <p className="mt-4 text-center text-xs text-gray-400">
            {t('internalPlatform')} · Continental AG
          </p>
        </div>
      </div>
    </div>
  );
}
