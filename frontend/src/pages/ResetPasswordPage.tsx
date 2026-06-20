import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { IconLogo } from '../components/Logo';
import { Lock, Key, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const resetSchema = z
  .object({
    token: z.string().min(1, { message: 'Reset token is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ['confirmPassword'],
  });

type ResetFormValues = z.infer<typeof resetSchema>;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

  // Prefill token from URL search query
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setValue('token', token);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: ResetFormValues) => {
    setIsPending(true);
    setErrorMsg('');

    try {
      await axios.post<{ message: string }>(`${API_URL}/passwords/reset`, {
        token: data.token,
        password: data.password,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error || 'Token is invalid or has expired.'
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        {/* Card Container with Sleek Glassmorphism border and shadow */}
        <div className="bg-white dark:bg-slate-800 px-8 py-10 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-100/50 dark:shadow-none">
          <div className="flex flex-col items-center text-center mb-8">
            <IconLogo size={42} className="mb-3" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Choose a new password
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Update your account credentials below
            </p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/30">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Reset Token Input */}
              <div>
                <label
                  htmlFor="token"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  Reset Token
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="token"
                    type="text"
                    placeholder="Enter reset token"
                    {...register('token')}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm font-mono transition-all"
                  />
                </div>
                {errors.token && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {errors.token.message}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm transition-all"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100 dark:shadow-none"
              >
                {isPending ? 'Updating password...' : 'Update password'}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="flex flex-col items-center p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-3" />
                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  Password Reset Successfully
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 leading-relaxed">
                  Your credentials have been successfully updated. You can now use your new password to sign in.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full inline-flex justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-all text-center cursor-pointer shadow-sm shadow-indigo-200 dark:shadow-none"
              >
                Sign in to your account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
