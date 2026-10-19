import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setErrorMessage('Por favor ingresa tu nombre.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Las contraseñas no coinciden.');
          setIsSubmitting(false);
          return;
        }

        const res = await register(name, email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Error al crear la cuenta.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage('¡Cuenta creada con éxito!');
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {
          // ignore if canvas-confetti is not loaded
        }
        setTimeout(() => {
          onClose();
          resetForm();
        }, 800);
      } else {
        const res = await login(email, password);
        if (!res.success) {
          setErrorMessage(res.error || 'Credenciales inválidas.');
          setIsSubmitting(false);
          return;
        }

        setSuccessMessage('¡Bienvenido de nuevo!');
        setTimeout(() => {
          onClose();
          resetForm();
        }, 600);
      }
    } catch {
      setErrorMessage('Ocurrió un error inesperado. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header with gradient banner */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-amber-500/10 to-transparent border-b border-slate-800/80">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta Local'}
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Accede a tus cuadernos y notas de estudio guardados en tu equipo.'
              : 'Autenticación 100% privada con bcrypt y JWT en tu servidor Node.js local.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 mt-4 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleSwitchMode('login')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('register')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Crear Cuenta</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Status feedback */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs font-medium">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Name field (Register only) */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Nombre completo</label>
              <div className="relative flex items-center">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Correo Electrónico</label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Contraseña</label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {mode === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Confirmar Contraseña</label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* Local storage privacy badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
            <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>100% Local:</strong> Contraseñas encriptadas con bcrypt, sesiones con JWT. Sin servicios de terceros ni tarjetas.
            </span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar a Lumina</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Registrarme</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info & guest bypass */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>¿Prefieres explorar primero?</span>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-400 hover:text-amber-300 font-medium underline-offset-2 hover:underline cursor-pointer"
          >
            Modo Invitado &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
