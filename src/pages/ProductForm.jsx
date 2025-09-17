// src/pages/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, Check, Flower, Sparkles } from 'lucide-react';
import api from '../api';

const ProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [floristerias, setFloristerias] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    floristeria: '',
    imagen: null
  });

  // ✅ NUEVO: Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categorias');
        setCategories(response.data);
        console.log('✅ Categorías cargadas:', response.data.length);
      } catch (error) {
        console.error('❌ Error cargando categorías:', error);
      }
    };

    const fetchFloristerias = async () => {
      try {
        const response = await api.get('/floristerias');
        setFloristerias(response.data);
        console.log('✅ Floristerías cargadas:', response.data.length);
      } catch (error) {
        console.error('❌ Error cargando floristerías:', error);
      }
    };

    fetchCategories();
    fetchFloristerias();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'imagen') {
      if (files && files[0]) {
        const file = files[0];
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          setError('Por favor selecciona un archivo de imagen válido');
          return;
        }
        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
          setError('La imagen debe ser menor a 5MB');
          return;
        }
        setFormData(prev => ({ ...prev, [name]: files[0] }));
        setError('');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ NUEVO: Manejar selección de categorías
  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // ✅ NUEVO: Crear nueva categoría
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    try {
      const response = await api.post('/categorias', {
        nombre: newCategoryName.trim(),
        descripcion: `Categoría ${newCategoryName.trim()}`,
        icono: '🌸',
        floristeria: formData.floristeria
      });
      
      const newCategory = response.data;
      setCategories(prev => [...prev, newCategory]);
      setSelectedCategories(prev => [...prev, newCategory._id]);
      setNewCategoryName('');
      console.log('✅ Nueva categoría creada:', newCategory.nombre);
    } catch (error) {
      console.error('❌ Error creando categoría:', error);
      setError('Error al crear la nueva categoría');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('nombre', formData.nombre);
      submitData.append('descripcion', formData.descripcion);
      submitData.append('precio', formData.precio);
      submitData.append('stock', formData.stock);
      submitData.append('floristeria', formData.floristeria);
      
      // ✅ NUEVO: Enviar categorías múltiples
      if (selectedCategories.length > 0) {
        selectedCategories.forEach(categoryId => {
          submitData.append('categorias', categoryId);
        });
      }
      
      if (formData.imagen) {
        submitData.append('imagen', formData.imagen);
      }

      const response = await api.post('/flores', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Producto creado exitosamente:', response.data);
      navigate('/admin/productos');
    } catch (error) {
      console.error('❌ Error creando producto:', error);
      setError(error.response?.data?.message || 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Partículas de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/productos')}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Productos
          </button>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
                <Flower className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Crear Nuevo Producto</h1>
            </div>
            <p className="text-white/70">Agrega un nuevo arreglo floral a tu tienda</p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ej: Ramo de Rosas Rojas"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Precio *
                </label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              {/* Floristería */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">
                  Floristería *
                </label>
                <select
                  name="floristeria"
                  value={formData.floristeria}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="" className="bg-gray-800">Seleccionar Floristería</option>
                  {floristerias.map(floristeria => (
                    <option key={floristeria._id} value={floristeria._id} className="bg-gray-800">
                      {floristeria.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6">
              <label className="block text-white/80 text-sm font-medium mb-2">
                Descripción *
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                placeholder="Describe el producto, sus características y detalles especiales..."
              />
            </div>
          </div>

          {/* ✅ NUEVO: Sección de Categorías */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400" />
              Categorías
            </h2>
            
            {/* Categorías existentes */}
            <div className="mb-6">
              <label className="block text-white/80 text-sm font-medium mb-3">
                Seleccionar Categorías
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map(category => (
                  <label key={category._id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleCategoryChange(category._id)}
                      className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-white/80 text-sm">{category.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Crear nueva categoría */}
            <div className="border-t border-white/20 pt-6">
              <label className="block text-white/80 text-sm font-medium mb-3">
                Crear Nueva Categoría
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Nombre de la nueva categoría"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || !formData.floristeria}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear
                </button>
              </div>
              {!formData.floristeria && (
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠️ Selecciona una floristería para crear categorías
                </p>
              )}
            </div>
          </div>

          {/* Imagen */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Imagen del Producto
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-white/60" />
                    <p className="mb-2 text-sm text-white/60">
                      <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                    </p>
                    <p className="text-xs text-white/40">PNG, JPG, JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    name="imagen"
                    onChange={handleChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
              
              {formData.imagen && (
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <Check className="w-5 h-5 text-green-400" />
                  <span className="text-white/80 text-sm">{formData.imagen.name}</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, imagen: null }))}
                    className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/productos')}
              className="flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Crear Producto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;