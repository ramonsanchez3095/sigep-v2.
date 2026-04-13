'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/actions/auth';
import { recoverTotpAccess, verifyTotpLogin } from '@/actions/totp';
import { Eye, EyeOff, Lock, User, BarChart3, Shield, KeyRound, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado 2FA
  const [requires2fa, setRequires2fa] = useState(false);
  const [userId2fa, setUserId2fa] = useState('');
  const [totpCode, setTotpCode] = useState(['', '', '', '', '', '']);
  const [localRecoveryAvailable, setLocalRecoveryAvailable] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setLocalRecoveryAvailable(
      window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1'
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginAction(username, password);
      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else if ('requires2fa' in result && result.requires2fa) {
        setRequires2fa(true);
        setUserId2fa(result.userId!);
        setError('');
      } else {
        setError(result.error ?? 'Usuario o contraseña incorrectos');
      }
    } catch {
      setError('Error de conexión con el servidor');
    }

    setLoading(false);
  };

  const handleTotpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...totpCode];
    newCode[index] = value.slice(-1);
    setTotpCode(newCode);

    // Auto-advance al siguiente input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleTotpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !totpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleTotpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setTotpCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const code = totpCode.join('');
    if (code.length !== 6) {
      setError('Ingrese el código completo de 6 dígitos');
      setLoading(false);
      return;
    }

    try {
      const result = await verifyTotpLogin(userId2fa, code, username, password);
      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error ?? 'Código incorrecto');
        setTotpCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Error de conexión con el servidor');
    }

    setLoading(false);
  };

  const handleBack = () => {
    setRequires2fa(false);
    setUserId2fa('');
    setTotpCode(['', '', '', '', '', '']);
    setError('');
  };

  const handleRecover2fa = async () => {
    const confirmed = window.confirm(
      'Esto restablecera el 2FA de este usuario en el entorno local y le permitira volver a generar el QR. ¿Desea continuar?'
    );

    if (!confirmed) {
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await recoverTotpAccess(username, password);

      if (result.success) {
        window.location.href = result.redirectTo;
        return;
      }

      setError(result.error ?? 'No se pudo recuperar el acceso 2FA.');
    } catch {
      setError('Error al recuperar el acceso 2FA.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-policia-dark via-policia-primary to-policia-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-policia-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-policia-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-policia-secondary rounded-full mb-4 shadow-lg">
            <BarChart3 size={40} className="text-policia-dark" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SIGEP</h1>
          <p className="text-policia-secondary font-medium">
            Sistema de Gestión Estadística Policial
          </p>
          <p className="text-white/60 text-sm mt-1">Policía de Tucumán</p>
        </div>

        <form
          onSubmit={requires2fa ? handleVerify2fa : handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-8"
        >
          <div className="flex items-center justify-center gap-2 mb-6 pb-6 border-b border-gray-100">
            {requires2fa ? (
              <>
                <KeyRound className="text-policia-primary" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">
                  Verificación 2FA
                </h2>
              </>
            ) : (
              <>
                <Shield className="text-policia-primary" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">
                  Iniciar Sesión
                </h2>
              </>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fadeIn">
              {error}
            </div>
          )}

          {requires2fa ? (
            <div className="space-y-5">
              <p className="text-sm text-gray-600 text-center">
                Ingrese el código de 6 dígitos de su aplicación autenticadora
              </p>

              <div className="flex justify-center gap-2" onPaste={handleTotpPaste}>
                {totpCode.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleTotpChange(i, e.target.value)}
                    onKeyDown={e => handleTotpKeyDown(i, e)}
                    autoFocus={i === 0}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-policia-primary focus:ring-2 focus:ring-policia-primary/20 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || totpCode.join('').length !== 6}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Verificar Código'
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft size={16} />
                Volver al inicio de sesión
              </button>

              {localRecoveryAvailable ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                  <p className="text-sm font-medium text-amber-900">
                    Recuperación local visible
                  </p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Si perdió el QR o cambió de dispositivo, puede restablecer el 2FA localmente y volver a generar un nuevo código QR sin tocar la base manualmente.
                  </p>
                  <button
                    type="button"
                    onClick={handleRecover2fa}
                    disabled={loading}
                    className="mt-3 inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Regenerar acceso y volver al QR
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="input-field !pl-11"
                    placeholder="Ingrese su usuario"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field !pl-11 !pr-11"
                    placeholder="Ingrese su contraseña"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Ingresar al Sistema'
                )}
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-sm text-gray-500">
              Departamento de Inteligencia Criminal
            </p>
            <p className="text-center text-xs text-gray-400 mt-1">
              Sección Análisis Delictual
            </p>
          </div>
        </form>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2024-2025 Policía de Tucumán. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
