import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';

/**
 * Formulario para crear o editar un arreglo/producto. Recibe un parámetro
 * opcional `id` para editar, y lee el parámetro de consulta `floristeria`
 * para asociar el producto a una floristería. Incluye campos para nombre,
 * descripción, precio, stock, categoría e imagen.
 */
export default function ProductForm() {
  const { token } = useAuth();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const floristeriaFromQuery = searchParams.get('floristeria');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagen: null,
    floristeria: floristeriaFromQuery || ''
  });

  // Cargar datos de producto existente
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const axiosInstance = getAxiosInstance(token);
          const res = await axiosInstance.get(`/flores/${id}`);
          const { nombre, descripcion, precio, stock, categoria, floristeria } = res.data;
          setForm({
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagen: null,
            floristeria
          });
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      const file = files[0];
      
      // Validación de imagen
      if (name === 'imagen') {
        // Verificar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          setError('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)');
          return;
        }
        
        // Verificar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          setError('La imagen debe ser menor a 5MB');
          return;
        }
        
        setError(''); // Limpiar errores previos
      }
      
      setForm({ ...form, [name]: file });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!form.nombre || !form.precio || !form.stock || !form.categoria || !form.floristeria) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    
    // Agregar campos básicos
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion);
    formData.append('precio', form.precio);
    formData.append('stock', form.stock);
    formData.append('categoria', form.categoria);
    formData.append('floristeria', form.floristeria);
    
    // Agregar imagen si existe
    if (form.imagen) {
      formData.append('imagen', form.imagen, form.imagen.name);
    }
    
    try {
      const axiosInstance = getAxiosInstance(token);
      
      if (id) {
        await axiosInstance.put(`/flores/${id}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
      } else {
        await axiosInstance.post('/flores', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          }
        });
      }
      
      navigate(`/admin/productos?floristeria=${form.floristeria}`);
    } catch (error) {
      console.error('Error en la operación:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Error al procesar la solicitud.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header con glass effect */}
        <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 mb-8 shadow-xl border border-white/20">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {id ? '✏️ Editar' : '✨ Añadir'} Arreglo
          </h1>
          <p className="text-gray-600">Completa los datos del nuevo arreglo floral</p>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Formulario */}
        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Nombre del Arreglo</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ej: Canasta de Rosas"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Categoría</label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">-- Seleccione categoría --</option>
                  <option value="Canastas con vino">🍷 Canastas con vino</option>
                  <option value="Canastas con whisky">🥃 Canastas con whisky</option>
                  <option value="Canastas sin licor">🌺 Canastas sin licor</option>
                  <option value="Regalos navideños">🎄 Regalos navideños</option>
                  <option value="Detalles pequeños">🎁 Detalles pequeños</option>
                  <option value="Canastas frutales">🍎 Canastas frutales</option>
                  <option value="Flores">🌸 Flores</option>
                </select>
              </div>
            </div>
            
            {/* Campo de floristería si no viene en la URL */}
            {!floristeriaFromQuery && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Floristería</label>
                <select
                  name="floristeria"
                  value={form.floristeria}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">-- Seleccione floristería --</option>
                  <option value="floristeria1">🏪 Floristería 1</option>
                  <option value="floristeria2">🏪 Floristería 2</option>
                  <option value="floristeria3">🏪 Floristería 3</option>
                </select>
              </div>
            )}
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Descripción</label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                rows="3"
                placeholder="Describe el arreglo floral..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="precio"
                  value={form.precio}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Stock Disponible</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="0"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Imagen del Arreglo</label>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
                form.imagen 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-purple-400'
              }`}>
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                  id="imagen-input"
                />
                <label htmlFor="imagen-input" className="cursor-pointer">
                  <div className="text-4xl mb-2">
                    {form.imagen ? '🖼️' : '📸'}
                  </div>
                  
                  {form.imagen ? (
                    <div className="space-y-2">
                      <p className="text-green-700 font-medium">
                        ✅ Imagen seleccionada
                      </p>
                      <p className="text-green-600 text-sm">
                        {form.imagen.name}
                      </p>
                      <p className="text-green-500 text-xs">
                        {(form.imagen.size / 1024 / 1024).toFixed(2)} MB • {form.imagen.type}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">
                        Haz clic para seleccionar una imagen
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF, WebP hasta 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
              
              {/* Botón para quitar imagen */}
              {form.imagen && (
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imagen: null })}
                    className="text-red-600 hover:text-red-800 text-sm underline"
                  >
                    🗑️ Quitar imagen
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                ← Volver
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="group relative inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="mr-2">{id ? '💾' : '✨'}</span>
                    {id ? 'Actualizar' : 'Crear'} Arreglo
                  </>
                )}
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}