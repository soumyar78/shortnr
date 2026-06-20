import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { IconLogo } from '../components/Logo';
import { Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      return api.post<{ token: string; user: any }>('/auth/login', data);
    },
    onSuccess: (res) => {
      loginStore(res.user, res.token);
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setErrorMsg(err.message || 'Invalid email or password');
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Back to Home Link */}
        <div className="flex justify-start">
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary hover:text-brand-primary transition-colors">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>

        <div className="bg-white px-8 py-10 rounded-2xl border border-border-color shadow-soft">
          <div className="flex flex-col items-center text-center mb-8">
            <IconLogo size={42} className="mb-3" />
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Sign in to your account</h2>
            <p className="mt-2 text-xs text-text-secondary">
              Welcome back to Shortnr
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium">
                <AlertCircle size={16} className="flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-text-secondary" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="block w-full pl-10 pr-3 py-2.5 border border-border-color rounded-xl text-text-primary placeholder:text-text-secondary/50 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-brand-primary hover:text-brand-accent"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-text-secondary" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="block w-full pl-10 pr-10 py-2.5 border border-border-color rounded-xl text-text-primary placeholder:text-text-secondary/50 focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs font-semibold text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-brand-primary hover:bg-brand-accent focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-all cursor-pointer disabled:opacity-50"
            >
              {mutation.isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs">
            <span className="text-text-secondary">Don't have an account? </span>
            <Link
              to="/signup"
              className="font-semibold text-brand-primary hover:text-brand-accent"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
