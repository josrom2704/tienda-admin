import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';

/**
 * Formulario para añadir o editar una floristería. Si el parámetro `id`
 * está presente, se cargan los datos existentes para permitir la edición.
 * El formulario soporta subida de imagen para el logo.
 */
export default function FloristeriaForm() {
  const { token } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    url: '',
    logo: null
  });

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const axiosInstance = getAxiosInstance(token);
          const res = await axiosInstance.get(`/floristerias/${id}`);
          const { nombre, descripcion, url } = res.data;
          setForm({ nombre, descripcion, url, logo: null });
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion);
    formData.append('url', form.url);
    if (form.logo) formData.append('logo', form.logo);
    try {
      const axiosInstance = getAxiosInstance(token);
      if (id) {
        await axiosInstance.put(`/floristerias/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axiosInstance.post('/floristerias', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/admin/floristerias');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{id ? 'Editar' : 'Añadir'} Floristería</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-gray-700">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-gray-700">URL</label>
          <input
            type="text"
            name="url"
            value={form.url}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block text-gray-700">Logo</label>
          <input
            type="file"
            name="logo"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          {id ? 'Actualizar' : 'Crear'}
        </button>
      </form>
    </div>
  );
}