// src/pages/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Plus, X, Check, Flower, Sparkles, Pencil, Trash2 } from 'lucide-react';
import api from '../api';

const ProductForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [floristerias, setFloristerias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [newCategoriaName, setNewCategoriaName] = useState('');
  const [selectedCategorias, setSelectedCategorias] = useState([]);
  const [editingCategoriaId, setEditingCategoriaId] = useState(null);
  const [editingCategoriaName, setEditingCategoriaName] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    precio: '',
    stock: '',
    floristeria: '',
    imagen: null
  });

  // Cargar floristerías al montar el componente
  useEffect(() => {
    const fetchFloristerias = async () => {
      try {
        const response = await api.get('/floristerias');
        setFloristerias(response.data);
        console.log('✅ Floristerías cargadas:', response.data.length);
      } catch (error) {
        console.error('❌ Error cargando floristerías:', error);
      }
    };

    fetchFloristerias();
  }, []);

  // Cargar categorías cuando se selecciona una floristería
  useEffect(() => {
    const fetchCategorias = async () => {
      if (!formData.floristeria) {
        setCategorias([]);
        return;
      }

      try {
        const response = await api.get(`/categorias/floristeria/${formData.floristeria}`);
        setCategorias(response.data);
        console.log('✅ Categorías cargadas:', response.data.length);
      } catch (error) {
        console.error('❌ Error cargando categorías:', error);
      }
    };

    fetchCategorias();
  }, [formData.floristeria]);

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

  // Manejar selección de categorías
  const handleCategoriaToggle = (categoriaId) => {
    setSelectedCategorias(prev => {
      if (prev.includes(categoriaId)) {
        return prev.filter(id => id !== categoriaId);
      } else {
        return [...prev, categoriaId];
      }
    });
  };

  // Crear nueva categoría
  const handleCreateCategoria = async () => {
    if (!newCategoriaName.trim()) {
      setError('Por favor ingresa un nombre para la categoría');
      return;
    }

    if (!formData.floristeria) {
      setError('Por favor selecciona una floristería primero');
      return;
    }

    try {
      const response = await api.post('/categorias', {
        nombre: newCategoriaName,
        floristeria: formData.floristeria,
        descripcion: `Categoría ${newCategoriaName}`,
        icono: '🌸'
      });

      // Agregar la nueva categoría a la lista y seleccionarla
      setCategorias(prev => [...prev, response.data]);
      setSelectedCategorias(prev => [...prev, response.data._id]);
      setNewCategoriaName('');
      console.log('✅ Nueva categoría creada:', response.data);
    } catch (error) {
      console.error('❌ Error creando categoría:', error);
      setError(error.response?.data?.message || 'Error al crear la categoría');
    }
  };

  // Iniciar edición de categoría
  const handleStartEditCategoria = (categoria) => {
    setEditingCategoriaId(categoria._id);
    setEditingCategoriaName(categoria.nombre);
  };

  // Cancelar edición
  const handleCancelEditCategoria = () => {
    setEditingCategoriaId(null);
    setEditingCategoriaName('');
  };

  // Guardar edición
  const handleSaveEditCategoria = async () => {
    if (!editingCategoriaId || !editingCategoriaName.trim()) return;
    try {
      const res = await api.put(`/categorias/${editingCategoriaId}`, {
        nombre: editingCategoriaName,
        slug: editingCategoriaName.toLowerCase().replace(/\s+/g, '-')
      });
      setCategorias(prev => prev.map(c => (c._id === editingCategoriaId ? res.data : c)));
      setEditingCategoriaId(null);
      setEditingCategoriaName('');
    } catch (error) {
      console.error('❌ Error actualizando categoría:', error);
      setError(error.response?.data?.message || 'Error al actualizar la categoría');
    }
  };

  // Eliminar categoría
  const handleDeleteCategoria = async (categoriaId) => {
    if (!window.confirm('¿Eliminar esta categoría? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/categorias/${categoriaId}`);
      setCategorias(prev => prev.filter(c => c._id !== categoriaId));
      setSelectedCategorias(prev => prev.filter(id => id !== categoriaId));
      if (editingCategoriaId === categoriaId) {
        setEditingCategoriaId(null);
        setEditingCategoriaName('');
      }
    } catch (error) {
      console.error('❌ Error eliminando categoría:', error);
      setError(error.response?.data?.message || 'Error al eliminar la categoría');
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
      
      // Enviar categorías múltiples si hay seleccionadas
      if (selectedCategorias.length > 0) {
        submitData.append('categorias', JSON.stringify(selectedCategorias));
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

          {/* Sección de Categorías */}
          {formData.floristeria && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Categorías
              </h2>
              
              {/* Categorías existentes */}
              {categorias.length > 0 && (
                <div className="mb-6">
                  <label className="block text-white/80 text-sm font-medium mb-3">
                    Seleccionar Categorías
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categorias.map(categoria => (
                      <div
                        key={categoria._id}
                        className="flex items-center gap-3 p-3 bg-white/5 border border-white/20 rounded-lg"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategorias.includes(categoria._id)}
                          onChange={() => handleCategoriaToggle(categoria._id)}
                          className="w-4 h-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                        />
                        {editingCategoriaId === categoria._id ? (
                          <>
                            <input
                              type="text"
                              value={editingCategoriaName}
                              onChange={(e) => setEditingCategoriaName(e.target.value)}
                              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <button
                              type="button"
                              onClick={handleSaveEditCategoria}
                              className="p-2 rounded bg-green-500/20 hover:bg-green-500/30 border border-green-400/40"
                              title="Guardar"
                            >
                              <Check className="w-4 h-4 text-green-300" />
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEditCategoria}
                              className="p-2 rounded bg-white/10 hover:bg-white/20 border border-white/20"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4 text-white/70" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-white/80 text-sm">{categoria.nombre}</span>
                            <button
                              type="button"
                              onClick={() => handleStartEditCategoria(categoria)}
                              className="p-2 rounded bg-white/10 hover:bg-white/20 border border-white/20"
                              title="Editar"
                            >
                              <Pencil className="w-4 h-4 text-white/70" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategoria(categoria._id)}
                              className="p-2 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-400/40"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-red-300" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crear nueva categoría */}
              <div className="border-t border-white/20 pt-4">
                <label className="block text-white/80 text-sm font-medium mb-3">
                  Crear Nueva Categoría
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoriaName}
                    onChange={(e) => setNewCategoriaName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Nombre de la nueva categoría"
                  />
                  <button
                    type="button"
                    onClick={handleCreateCategoria}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Crear
                  </button>
                </div>
              </div>
            </div>
          )}

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