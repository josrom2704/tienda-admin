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
    formData.append('precio', form.precio);
    formData.append('stock', form.stock);
    formData.append('categoria', form.categoria);
    formData.append('floristeria', form.floristeria);
    if (form.imagen) formData.append('imagen', form.imagen);
    try {
      const axiosInstance = getAxiosInstance(token);
      if (id) {
        await axiosInstance.put(`/flores/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await axiosInstance.post('/flores', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate(`/admin/productos?floristeria=${form.floristeria}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{id ? 'Editar' : 'Añadir'} Arreglo</h2>
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
          <label className="block text-gray-700">Precio</label>
          <input
            type="number"
            step="0.01"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Stock</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Categoría</label>
          <select
            name="categoria"
            value={form.categoria}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          >
            <option value="">-- Seleccione --</option>
            <option value="Canastas con vino">Canastas con vino</option>
            <option value="Canastas con whisky">Canastas con whisky</option>
            <option value="Canastas sin licor">Canastas sin licor</option>
            <option value="Regalos navideños">Regalos navideños</option>
            <option value="Detalles pequeños">Detalles pequeños</option>
            <option value="Canastas frutales">Canastas frutales</option>
            <option value="Flores">Flores</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700">Imagen</label>
          <input
            type="file"
            name="imagen"
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