/**
 * Auth Required Component
 * Handles authentication flow for main app
 * Shows Login/Signup screens with Google OAuth support
 */

import React, { useState } from 'react';
import { ForgotPassword } from './ForgotPassword';
import { Login } from './Login';
import { Signup } from './Signup';

type AuthScreen = 'login' | 'signup' | 'forgot';

export const AuthRequired: React.FC = () => {
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');

  const handleLogin = () => {
    // Login is handled by auth context
    // This component will unmount when auth.isAuthenticated becomes true
  };

  if (authScreen === 'signup') {
    return (
      <Signup
        onSignup={handleLogin}
        onLoginClick={() => setAuthScreen('login')}
      />
    );
  }

  if (authScreen === 'forgot') {
    return (
      <ForgotPassword
        onBackToLogin={() => setAuthScreen('login')}
      />
    );
  }

  return (
    <Login
      onLogin={handleLogin}
      onSignupClick={() => setAuthScreen('signup')}
      onForgotPasswordClick={() => setAuthScreen('forgot')}
    />
  );
};