import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';
import { Plus, X, Check } from 'lucide-react';

/**
 * Formulario para crear o editar un arreglo/producto. Recibe un parámetro
 * opcional `id` para editar, y lee el parámetro de consulta `floristeria`
 * para asociar el producto a una floristería. Incluye campos para nombre,
 * descripción, precio, stock, categorías múltiples e imagen.
 */
export default function ProductForm() {
  const { token } = useAuth();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const floristeriaFromQuery = searchParams.get('floristeria');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ nombre: '', descripcion: '', icono: '🌸' });
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categorias: [], // ✨ CAMBIO: Ahora es un array
    imagen: null,
    floristeria: floristeriaFromQuery || ''
  });

  // ✨ NUEVO: Cargar categorías desde el backend
  useEffect(() => {
    fetchCategorias();
  }, [token]);

  // Cargar datos de producto existente
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const axiosInstance = getAxiosInstance(token);
          const res = await axiosInstance.get(`/flores/${id}`);
          const { nombre, descripcion, precio, stock, categorias, categoria, floristeria } = res.data;
          
          // ✨ NUEVO: Manejar categorías múltiples
          let categoriasArray = [];
          if (categorias && Array.isArray(categorias)) {
            categoriasArray = categorias.map(c => c._id || c);
          } else if (categoria) {
            // Compatibilidad hacia atrás: buscar categoría por nombre
            const categoriaDoc = categorias.find(c => c.nombre === categoria);
            if (categoriaDoc) {
              categoriasArray = [categoriaDoc._id];
            }
          }
          
          setForm({
            nombre,
            descripcion,
            precio,
            stock,
            categorias: categoriasArray,
            imagen: null,
            floristeria
          });
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [id, token]);

  // ✨ NUEVO: Función para cargar categorías
  const fetchCategorias = async () => {
    try {
      setLoadingCategorias(true);
      const axiosInstance = getAxiosInstance(token);
      const res = await axiosInstance.get('/categorias');
      setCategorias(res.data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      // Fallback a categorías hardcodeadas si el backend no está listo
      setCategorias([
        { _id: '1', nombre: 'Canastas con vino', icono: '🍷' },
        { _id: '2', nombre: 'Canastas con whisky', icono: '🥃' },
        { _id: '3', nombre: 'Canastas sin licor', icono: '🌺' },
        { _id: '4', nombre: 'Regalos navideños', icono: '🎄' },
        { _id: '5', nombre: 'Detalles pequeños', icono: '🎁' },
        { _id: '6', nombre: 'Canastas frutales', icono: '🍎' },
        { _id: '7', nombre: 'Flores', icono: '🌸' }
      ]);
    } finally {
      setLoadingCategorias(false);
    }
  };

  // ✨ NUEVO: Función para crear nueva categoría
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.nombre.trim()) return;

    try {
      const axiosInstance = getAxiosInstance(token);
      const res = await axiosInstance.post('/categorias', newCategory);
      
      // Agregar la nueva categoría a la lista
      setCategorias([...categorias, res.data]);
      
      // Seleccionar automáticamente la nueva categoría
      setForm({
        ...form,
        categorias: [...form.categorias, res.data._id]
      });
      
      // Limpiar formulario y cerrar
      setNewCategory({ nombre: '', descripcion: '', icono: '🌸' });
      setShowNewCategoryForm(false);
    } catch (error) {
      console.error('Error al crear categoría:', error);
      setError('Error al crear la nueva categoría');
    }
  };

  // ✨ NUEVO: Función para manejar selección de categorías
  const handleCategoryChange = (categoriaId) => {
    const isSelected = form.categorias.includes(categoriaId);
    if (isSelected) {
      // Remover categoría
      setForm({
        ...form,
        categorias: form.categorias.filter(id => id !== categoriaId)
      });
    } else {
      // Agregar categoría
      setForm({
        ...form,
        categorias: [...form.categorias, categoriaId]
      });
    }
  };

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
    
    // ✨ ACTUALIZADO: Validación para categorías múltiples
    if (!form.nombre || !form.precio || !form.stock || form.categorias.length === 0 || !form.floristeria) {
      setError('Por favor, completa todos los campos obligatorios y selecciona al menos una categoría');
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
    formData.append('floristeria', form.floristeria);
    
    // ✨ NUEVO: Agregar categorías múltiples
    form.categorias.forEach(categoriaId => {
      formData.append('categorias', categoriaId);
    });
    
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
              
              {/* ✨ NUEVO: Campo de floristería si no viene en la URL */}
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
            </div>
            
            {/* ✨ NUEVO: Campo de categorías múltiples */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-gray-700 font-semibold">
                  Categorías <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  <Plus size={16} />
                  Nueva Categoría
                </button>
              </div>
              
              {/* Formulario para nueva categoría */}
              {showNewCategoryForm && (
                <div className="mb-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-3">Crear Nueva Categoría</h4>
                  <form onSubmit={handleCreateCategory} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Nombre de la categoría"
                        value={newCategory.nombre}
                        onChange={(e) => setNewCategory({ ...newCategory, nombre: e.target.value })}
                        className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Descripción (opcional)"
                        value={newCategory.descripcion}
                        onChange={(e) => setNewCategory({ ...newCategory, descripcion: e.target.value })}
                        className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="text"
                        placeholder="Icono (ej: 🌸)"
                        value={newCategory.icono}
                        onChange={(e) => setNewCategory({ ...newCategory, icono: e.target.value })}
                        className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Check size={16} />
                        Crear
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewCategoryForm(false)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <X size={16} />
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Lista de categorías disponibles */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {loadingCategorias ? (
                  <div className="col-span-full text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Cargando categorías...</p>
                  </div>
                ) : (
                  categorias.map((categoria) => (
                    <label
                      key={categoria._id}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        form.categorias.includes(categoria._id)
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.categorias.includes(categoria._id)}
                        onChange={() => handleCategoryChange(categoria._id)}
                        className="sr-only"
                      />
                      <span className="text-xl">{categoria.icono}</span>
                      <span className="text-sm font-medium">{categoria.nombre}</span>
                      {form.categorias.includes(categoria._id) && (
                        <Check size={16} className="text-purple-500 ml-auto" />
                      )}
                    </label>
                  ))
                )}
              </div>
              
              {/* Mostrar categorías seleccionadas */}
              {form.categorias.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">
                    Categorías seleccionadas ({form.categorias.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.categorias.map((categoriaId) => {
                      const categoria = categorias.find(c => c._id === categoriaId);
                      return categoria ? (
                        <span
                          key={categoriaId}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {categoria.icono} {categoria.nombre}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
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