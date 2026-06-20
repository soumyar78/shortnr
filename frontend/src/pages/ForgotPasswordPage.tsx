import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { IconLogo } from '../components/Logo';
import { Mail, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const forgotSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const ForgotPasswordPage: React.FC = () => {
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormValues) => {
    setIsPending(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await axios.post<{ message: string }>(
        `${API_URL}/passwords/forgot`,
        data
      );
      setSuccessMsg(response.data.message);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.error || 'Failed to submit request. Please try again.'
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8">
        {/* Back button */}
        <div className="flex justify-start">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </div>

        {/* Card Container with Sleek Glassmorphism border and shadow */}
        <div className="bg-white dark:bg-slate-800 px-8 py-10 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-xl shadow-slate-100/50 dark:shadow-none">
          <div className="flex flex-col items-center text-center mb-8">
            <IconLogo size={42} className="mb-3" />
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Forgot password?
            </h2>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              No worries, we will send you password reset instructions.
            </p>
          </div>

          {successMsg ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center p-5 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-3" />
                <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                  Instructions Sent
                </h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 leading-relaxed">
                  {successMsg}
                </p>
              </div>
              <div className="text-center">
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition-all text-center cursor-pointer shadow-sm shadow-indigo-200 dark:shadow-none"
                >
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-200 dark:border-rose-900/30">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    {...register('email')}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400/70 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 dark:focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-indigo-500 text-sm transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-100 dark:shadow-none"
              >
                {isPending ? 'Sending link...' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
