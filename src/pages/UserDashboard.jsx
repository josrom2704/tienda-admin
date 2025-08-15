import { Link, Routes, Route } from 'react-router-dom';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import { useAuth } from '../context/AuthContext';

/**
 * Dashboard para el rol de usuario. Muestra únicamente las opciones
 * relacionadas con la gestión de arreglos asociados a la floristería del
 * usuario.
 */
export default function UserDashboard() {
  const { logout, user } = useAuth();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 font-bold text-xl border-b">Panel Usuario</div>
        <nav className="flex flex-col gap-2 p-4 text-gray-700">
          <Link to="productos" className="hover:text-red-600">
            Mis Arreglos
          </Link>
          <button onClick={logout} className="mt-4 text-left hover:text-red-600">
            Cerrar sesión
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        <Routes>
          <Route index element={<div>Bienvenido, gestiona tus arreglos.</div>} />
          <Route
            path="productos"
            element={<ProductList floristeriaId={user?.floristeria} />}
          />
          <Route
            path="productos/nuevo"
            element={<ProductForm />}
          />
          <Route
            path="productos/:id"
            element={<ProductForm />}
          />
        </Routes>
      </main>
    </div>
  );
}