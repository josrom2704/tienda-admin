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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-2 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header elegante - Completamente responsive */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
            {id ? 'Editar' : 'Añadir'} Floristería
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-300 px-1 sm:px-2 md:px-4">
            {id ? 'Modifica los datos de la floristería' : 'Crea una nueva floristería para tu catálogo'}
          </p>
        </div>

        {/* Formulario con diseño premium - Completamente responsive */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
          {/* Campo Nombre */}
          <div className="group">
            <label className="block text-xs sm:text-sm md:text-base font-medium text-yellow-400 mb-1 sm:mb-2">
              Nombre de la Floristería
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/10 border-2 border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:border-yellow-400 
                       focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300
                       backdrop-blur-sm text-xs sm:text-sm md:text-base
                       min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
              placeholder="Ej: Flores del Paraíso"
              required
            />
          </div>

          {/* Campo Descripción */}
          <div className="group">
            <label className="block text-xs sm:text-sm md:text-base font-medium text-yellow-400 mb-1 sm:mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="3"
              className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/10 border-2 border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:border-yellow-400 
                       focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300
                       backdrop-blur-sm resize-none text-xs sm:text-sm md:text-base
                       min-h-[80px] sm:min-h-[88px] md:min-h-[96px]"
              placeholder="Describe los servicios y especialidades de la floristería..."
              required
            />
          </div>

          {/* Campo URL */}
          <div className="group">
            <label className="block text-xs sm:text-sm md:text-base font-medium text-yellow-400 mb-1 sm:mb-2">
              URL del Sitio Web
            </label>
            <input
              type="url"
              name="url"
              value={form.url}
              onChange={handleChange}
              className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-white/10 border-2 border-gray-600 rounded-lg 
                       text-white placeholder-gray-400 focus:border-yellow-400 
                       focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300
                       backdrop-blur-sm text-xs sm:text-sm md:text-base
                       min-h-[40px] sm:min-h-[44px] md:min-h-[48px]"
              placeholder="https://www.ejemplo.com"
              required
            />
          </div>

          {/* Campo Logo - Completamente responsive */}
          <div className="group">
            <label className="block text-xs sm:text-sm md:text-base font-medium text-yellow-400 mb-1 sm:mb-2">
              Logo de la Floristería
            </label>
            <div className="flex flex-col space-y-2 sm:space-y-3 md:flex-row md:space-y-0 md:space-x-3 lg:space-x-4">
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
                className="w-full md:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 
                         font-semibold rounded-lg cursor-pointer transition-all duration-300
                         transform hover:scale-105 hover:shadow-lg text-center text-xs sm:text-sm md:text-base
                         min-h-[40px] sm:min-h-[44px] md:min-h-[48px] flex items-center justify-center"
              >
                Seleccionar Logo
              </label>
              <span className="text-gray-400 text-xs sm:text-sm w-full md:w-auto text-center md:text-left flex items-center justify-center md:justify-start
                             min-h-[40px] sm:min-h-[44px] md:min-h-[48px] px-2">
                {form.logo ? form.logo.name : 'Sin archivos seleccionados'}
              </span>
            </div>
          </div>

          {/* Botones de acción - Completamente responsive */}
          <div className="flex flex-col space-y-2 sm:space-y-3 md:flex-row md:space-y-0 md:space-x-3 lg:space-x-4 pt-3 sm:pt-4 md:pt-5 lg:pt-6">
            <button
              type="submit"
              className="w-full md:flex-1 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 
                       hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-bold 
                       rounded-lg transition-all duration-300 transform hover:scale-105 
                       hover:shadow-xl focus:ring-4 focus:ring-yellow-400/30 text-xs sm:text-sm md:text-base
                       min-h-[44px] sm:min-h-[48px] md:min-h-[52px] flex items-center justify-center"
            >
              ✨ {id ? 'Actualizar' : 'Crear'} Floristería
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/floristerias')}
              className="w-full md:w-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold 
                       rounded-lg transition-all duration-300 hover:shadow-lg text-xs sm:text-sm md:text-base
                       min-h-[44px] sm:min-h-[48px] md:min-h-[52px] flex items-center justify-center"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}