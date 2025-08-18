// src/pages/Login.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
  Flower, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Crown, 
  Star,
  ArrowRight,
  Shield
} from 'lucide-react';

/**
 * Página de inicio de sesión del Admin.
 * Usa VITE_API_URL o https://flores-backend-px2c.onrender.com/api por defecto.
 */
export default function Login() {
  const [username, setUsername] = useState('');   // admin
  const [password, setPassword] = useState('');   // admin123
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [animate, setAnimate] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const API = import.meta.env.VITE_API_URL || 'https://flores-backend-px2c.onrender.com/api';

  useEffect(() => {
    // Iniciar animaciones después de un pequeño delay
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password });
      const { token, user } = res.data;

      // Guarda en contexto/localStorage según tu AuthContext
      login(token, user);

      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/usuario');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Fondo animado con partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Partículas grandes */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-36 h-36 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Partículas pequeñas */}
        <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-cyan-400 rounded-full animate-bounce"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 left-1/5 w-5 h-5 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 right-1/5 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Header mágico */}
          <div className={`text-center mb-8 transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <Flower className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
              🌸 Bienvenido a Panel Admin
            </h1>
            <p className="text-purple-200 text-lg">
              El puente más hermoso hacia la magia floral
            </p>
          </div>

          {/* Formulario Glass */}
          <div className={`backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transition-all duration-1000 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Elementos decorativos del formulario */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-30"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-30"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white text-center mb-6">
                Iniciar Sesión
              </h2>

              {/* Mensaje de error */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-400/30 rounded-2xl text-red-200 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Campo Usuario */}
                <div className="space-y-2">
                  <label className="block text-purple-200 font-semibold text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-pink-400" />
                      Usuario
                    </div>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                    value={username}
                    placeholder="admin"
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </div>

                {/* Campo Contraseña */}
                <div className="space-y-2">
                  <label className="block text-purple-200 font-semibold text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-pink-400" />
                      Contraseña
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-4 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm pr-12"
                      value={password}
                      placeholder="admin123"
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Accediendo...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3">
                      <span>Acceder</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500"></div>
                </button>
              </form>

              {/* Información adicional */}
              <div className="mt-6 text-center">
                <p className="text-purple-300 text-sm">
                  Credenciales de prueba:
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-purple-200 text-xs">
                    <span className="text-pink-300">Usuario:</span> admin
                  </p>
                  <p className="text-purple-200 text-xs">
                    <span className="text-pink-300">Contraseña:</span> admin123
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer mágico */}
          <div className={`text-center mt-8 transition-all duration-1000 delay-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-purple-300 text-sm"> Floristeria - Gestion de Flores</span>
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <p className="text-purple-400 text-xs">
              El puente más hermoso hacia la administración floral
            </p>
          </div>
        </div>
      </div>

      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
