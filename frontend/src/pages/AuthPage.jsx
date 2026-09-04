import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  Heart,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Zap
} from 'lucide-react';
import { api } from '../api/client.js';

export default function AuthPage({ onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Demo users loaded from database
  const [demoUsers, setDemoUsers] = useState([]);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('priya.sharma@email.com');
  const [signInPassword, setSignInPassword] = useState('password123');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpPhone, setSignUpPhone] = useState('');
  const [signUpAge, setSignUpAge] = useState('30');
  const [signUpGender, setSignUpGender] = useState('Female');
  const [signUpBloodGroup, setSignUpBloodGroup] = useState('O+');

  // Load demo users from backend DB
  useEffect(() => {
    async function fetchDemoUsers() {
      try {
        const res = await api.getDemoUsers();
        if (res.success && res.data) {
          setDemoUsers(res.data);
        }
      } catch (err) {
        console.warn('Could not load demo users:', err);
      }
    }
    fetchDemoUsers();
  }, []);

  const handleSignIn = async (e, directEmail = null, directPass = null) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const emailToUse = directEmail || signInEmail;
    const passToUse = directPass || signInPassword;

    try {
      const res = await api.login(emailToUse, passToUse);
      if (res.success && res.user) {
        setSuccessMsg(`Welcome back, ${res.user.name}! Access granted.`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(res.user);
        }, 600);
      } else {
        setErrorMsg(res.error || 'Failed to sign in. Please verify credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error connecting to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword.trim()) {
      setErrorMsg('Please enter your Name, Email, and Password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.signup({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        password: signUpPassword.trim(),
        phone: signUpPhone.trim() || '+91 98765 00000',
        age: parseInt(signUpAge) || 28,
        gender: signUpGender,
        bloodGroup: signUpBloodGroup
      });

      if (res.success && res.user) {
        setSuccessMsg(`Account created for ${res.user.name}! Logging you in...`);
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(res.user);
        }, 800);
      } else {
        setErrorMsg(res.error || 'Could not register account. Email may already exist.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error communicating with registration service.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (user) => {
    setSignInEmail(user.email);
    setSignInPassword('password123');
    handleSignIn(null, user.email, 'password123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/25">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-base tracking-wide text-white">LifeLink / HealthTrack AI</span>
            <span className="text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              Autonomous Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isSignUp ? 'Create your Health Account' : 'Sign in to your Health Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Autonomous Multi-Agent AI monitoring your lab reports, tablet schedule, insurance pre-auth, and emergency hospital triage.
          </p>
        </div>

        {/* Single Demo User Details Box */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl mb-6 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20 shrink-0">
                PS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">Demo Account: Priya Sharma</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    O+ • Score 78
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2">
                  <span>Email: <code className="text-blue-300 font-mono">priya.sharma@email.com</code></span>
                  <span>•</span>
                  <span>Password: <code className="text-blue-300 font-mono">password123</code></span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setSignInEmail('priya.sharma@email.com');
                setSignInPassword('password123');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-semibold transition-all self-start sm:self-auto shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Fill Credentials</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
          {/* Tabs: Sign In vs Sign Up */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 text-center transition-all ${
                !isSignUp
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In to Existing Account
            </button>
            <button
              onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
              className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 text-center transition-all ${
                isSignUp
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create New Health Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          {!isSignUp ? (
            /* SIGN IN FORM */
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Demo pass: <code className="text-blue-400 font-mono">password123</code>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span>Remember on this computer</span>
                </label>
                <span className="text-xs text-blue-400 hover:underline cursor-pointer">
                  Need Help?
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Health Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    placeholder="e.g. Ramesh Reddy"
                    className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      placeholder="ramesh@email.com"
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-10 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={signUpPhone}
                      onChange={(e) => setSignUpPhone(e.target.value)}
                      placeholder="+91 98765..."
                      className="w-full pl-10 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={signUpAge}
                    onChange={(e) => setSignUpAge(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    value={signUpBloodGroup}
                    onChange={(e) => setSignUpBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                      <option key={bg} value={bg} className="bg-slate-800 text-white">{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Gender
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Female', 'Male', 'Other'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSignUpGender(g)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        signUpGender === g
                          ? 'bg-blue-600/30 border-blue-500 text-white'
                          : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Creating Health Record...</span>
                  </>
                ) : (
                  <>
                    <span>Register New Health Track Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security & HIPAA Footer */}
        <div className="mt-6 text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit Encrypted • HIPAA-Compliant Data Vault • Multi-Agent Autonomous Security</span>
          </div>
          <p className="text-[10px] text-slate-600">
            LifeLink Clinical AI Platform • Active Patient Vault v2.4
          </p>
        </div>
      </div>
    </div>
  );
}
