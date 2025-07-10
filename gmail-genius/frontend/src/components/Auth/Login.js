import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth';
import { EnvelopeIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      const errorMessage = authService.handleOAuthError(error);
      toast.error(errorMessage);
    }
  }, [error]);

  const handleGoogleLogin = () => {
    authService.loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <EnvelopeIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Gmail Genius
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Smart email management with AI-powered insights
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Sign in to continue
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Connect your Gmail account to get started with AI-powered email management
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <ShieldCheckIcon className="h-5 w-5 text-green-500" />
              <span>Secure OAuth 2.0 authentication</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <SparklesIcon className="h-5 w-5 text-blue-500" />
              <span>AI-powered email analysis</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <EnvelopeIcon className="h-5 w-5 text-purple-500" />
              <span>Smart filtering and organization</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Your data is encrypted and never shared with third parties
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;