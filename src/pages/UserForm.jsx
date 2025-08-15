import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';

/**
 * Formulario para crear un nuevo usuario. Permite seleccionar rol y
 * asignar una floristería al usuario. Sólo visible para el rol admin.
 */
export default function UserForm() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    role: 'usuario',
    floristeria: ''
  });
  const [floristerias, setFloristerias] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const axiosInstance = getAxiosInstance(token);
        const res = await axiosInstance.get('/floristerias');
        setFloristerias(res.data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const axiosInstance = getAxiosInstance(token);
      await axiosInstance.post('/users', form);
      navigate('/admin/usuarios');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Crear Usuario</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-gray-700">Usuario</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Contraseña</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Rol</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Floristería</label>
          <select
            name="floristeria"
            value={form.floristeria}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">-- Ninguna --</option>
            {floristerias.map((flo) => (
              <option key={flo._id} value={flo._id}>
                {flo.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Crear
        </button>
      </form>
    </div>
  );
}