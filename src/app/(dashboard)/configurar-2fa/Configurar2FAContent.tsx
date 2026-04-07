'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { initTotpSetup, confirmTotpSetup } from '@/actions/totp';
import { Shield, KeyRound, QrCode, Copy, Check } from 'lucide-react';

export function Configurar2FAContent() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'setup' | 'verify'>('intro');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleStartSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await initTotpSetup();
      setQrDataUrl(result.qrDataUrl);
      setManualKey(result.manualKey);
      setStep('setup');
    } catch {
      setError('Error al generar el código QR. Intente de nuevo.');
    }
    setLoading(false);
  };

  const handleCopyKey = async () => {
    await navigator.clipboard.writeText(manualKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setCode(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Ingrese el código completo de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmTotpSetup(fullCode);
      if (result.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(result.error ?? 'Código incorrecto');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Error al verificar el código');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-policia-dark via-policia-primary to-policia-dark flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-policia-secondary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-policia-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-policia-secondary rounded-full mb-4 shadow-lg">
            <Shield size={40} className="text-policia-dark" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Configurar Autenticación 2FA
          </h1>
          <p className="text-white/60 text-sm">
            Proteja su cuenta con verificación de dos factores
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-fadeIn">
              {error}
            </div>
          )}

          {step === 'intro' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <KeyRound className="text-policia-primary" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">
                  Verificación obligatoria
                </h2>
              </div>

              <div className="space-y-4 text-sm text-gray-600">
                <p>
                  Para acceder al sistema SIGEP, debe configurar la autenticación
                  de dos factores (2FA) usando una aplicación autenticadora.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-800 mb-2">
                    Aplicaciones compatibles:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Google Authenticator</li>
                    <li>Microsoft Authenticator</li>
                    <li>Authy</li>
                  </ul>
                </div>
                <p>
                  Descargue una de estas aplicaciones en su celular antes de
                  continuar.
                </p>
              </div>

              <button
                onClick={handleStartSetup}
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <QrCode size={20} />
                    Generar Código QR
                  </>
                )}
              </button>
            </div>
          )}

          {step === 'setup' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <QrCode className="text-policia-primary" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">
                  Escanear código QR
                </h2>
              </div>

              <p className="text-sm text-gray-600">
                Abra su aplicación autenticadora y escanee el siguiente código QR:
              </p>

              {qrDataUrl && (
                <div className="flex justify-center">
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                    <img
                      src={qrDataUrl}
                      alt="Código QR para configurar 2FA"
                      width={256}
                      height={256}
                    />
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">
                  Si no puede escanear el QR, ingrese esta clave manualmente:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-white border border-gray-200 rounded px-3 py-2 break-all select-all">
                    {manualKey}
                  </code>
                  <button
                    onClick={handleCopyKey}
                    className="p-2 text-gray-500 hover:text-policia-primary transition-colors"
                    title="Copiar clave"
                  >
                    {copied ? (
                      <Check size={18} className="text-green-500" />
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('verify');
                  setTimeout(() => inputRefs.current[0]?.focus(), 100);
                }}
                className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center gap-2"
              >
                Ya escaneé el código
              </button>
            </div>
          )}

          {step === 'verify' && (
            <form onSubmit={handleConfirm} className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <KeyRound className="text-policia-primary" size={24} />
                <h2 className="text-xl font-semibold text-gray-800">
                  Confirmar configuración
                </h2>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Ingrese el código de 6 dígitos que aparece en su aplicación
                autenticadora para confirmar la configuración:
              </p>

              <div className="flex justify-center gap-2" onPaste={handleCodePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleCodeChange(i, e.target.value)}
                    onKeyDown={e => handleCodeKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-policia-primary focus:ring-2 focus:ring-policia-primary/20 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || code.join('').length !== 6}
                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Activar 2FA'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep('setup')}
                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Volver a ver el código QR
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © 2024-2025 Policía de Tucumán. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
