import { NavLink, Routes, Route } from 'react-router-dom';
import FloristeriaList from './FloristeriaList';
import FloristeriaForm from './FloristeriaForm';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import UserList from './UserList';
import UserForm from './UserForm';
import { useAuth } from '../context/AuthContext';

/**
 * Dashboard principal para el rol de administrador. Muestra un menú lateral
 * con las secciones de floristerías, productos y usuarios, y renderiza el
 * contenido correspondiente según la ruta. Permite cerrar sesión.
 */
export default function AdminDashboard() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 font-bold text-xl border-b">Panel Admin</div>
        <nav className="flex flex-col gap-2 p-4 text-gray-700">
          <NavLink
            to="floristerias"
            className={({ isActive }) =>
              isActive ? 'text-red-600 font-semibold' : 'hover:text-red-600'
            }
          >
            Floristerías
          </NavLink>
          <NavLink
            to="productos"
            className={({ isActive }) =>
              isActive ? 'text-red-600 font-semibold' : 'hover:text-red-600'
            }
          >
            Arreglos
          </NavLink>
          <NavLink
            to="usuarios"
            className={({ isActive }) =>
              isActive ? 'text-red-600 font-semibold' : 'hover:text-red-600'
            }
          >
            Usuarios
          </NavLink>
          <button onClick={logout} className="mt-4 text-left hover:text-red-600">
            Cerrar sesión
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        <Routes>
          <Route index element={<div>Seleccione una opción del menú.</div>} />
          <Route path="floristerias" element={<FloristeriaList />} />
          <Route path="floristerias/nuevo" element={<FloristeriaForm />} />
          <Route path="floristerias/:id" element={<FloristeriaForm />} />
          <Route path="productos" element={<ProductList />} />
          <Route path="productos/nuevo" element={<ProductForm />} />
          <Route path="productos/:id" element={<ProductForm />} />
          <Route path="usuarios" element={<UserList />} />
          <Route path="usuarios/nuevo" element={<UserForm />} />
        </Routes>
      </main>
    </div>
  );
}