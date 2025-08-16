// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

/**
 * Página de inicio de sesión del Admin.
 * Usa VITE_API_URL o https://flores-backend-px2c.onrender.com/api por defecto.
 */
export default function Login() {
  const [username, setUsername] = useState('');   // admin
  const [password, setPassword] = useState('');   // admin123
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const API = import.meta.env.VITE_API_URL || 'https://flores-backend-px2c.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-4 text-center">Iniciar Sesión</h1>
        {error && <p className="text-red-500 mb-2">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700">Usuario</label>
          <input
            type="text"
            className="mt-1 w-full border rounded p-2"
            value={username}
            placeholder="admin"
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Contraseña</label>
          <input
            type="password"
            className="mt-1 w-full border rounded p-2"
            value={password}
            placeholder="admin123"
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
