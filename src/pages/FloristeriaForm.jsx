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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header elegante */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {id ? 'Editar' : 'Añadir'} Floristería
          </h1>
          <p className="text-gray-300 text-lg">
            {id ? 'Modifica los datos de la floristería' : 'Crea una nueva floristería para tu catálogo'}
          </p>
        </div>

        {/* Formulario con diseño premium */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Nombre */}
          <div className="group">
            <label className="block text-sm font-medium text-yellow-400 mb-2">
              Nombre de la Floristería
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border-2 border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:border-yellow-400 
                       focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300
                       backdrop-blur-sm"
              placeholder="Ej: Flores del Paraíso"
              required
            />
          </div>

          {/* Campo Descripción */}
          <div className="group">
            <label className="block text-sm font-medium text-yellow-400 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-3 bg-white/10 border-2 border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:border-yellow-400 
                       focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300
                       backdrop-blur-sm resize-none"
              placeholder="Describe los servicios y especialidades de la floristería..."
              required
            />
          </div>

          {/* Campo URL */}
          <div className="group">
            <label className="block text-sm font-medium text-yellow-400 mb-2">
              URL del Sitio Web
            </label>
            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white/10 border-2 border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:border-yellow-400 
                       focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300
                       backdrop-blur-sm"
              placeholder="https://www.ejemplo.com"
              required
            />
          </div>

          {/* Campo Logo */}
          <div className="group">
            <label className="block text-sm font-medium text-yellow-400 mb-2">
              Logo de la Floristería
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                name="logo"
                onChange={handleChange}
                accept="image/*"
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 
                         font-semibold rounded-lg cursor-pointer transition-all duration-300
                         transform hover:scale-105 hover:shadow-lg"
              >
                Seleccionar Logo
              </label>
              <span className="text-gray-400 text-sm">
                {form.logo ? form.logo.name : 'Sin archivos seleccionados'}
              </span>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 
                       hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold 
                       rounded-lg transition-all duration-300 transform hover:scale-105 
                       hover:shadow-xl focus:ring-4 focus:ring-yellow-400/30"
            >
              ✨ {id ? 'Actualizar' : 'Crear'} Floristería
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/floristerias')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold 
                       rounded-lg transition-all duration-300 hover:shadow-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}