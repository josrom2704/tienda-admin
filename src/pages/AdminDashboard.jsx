import { NavLink, Routes, Route } from 'react-router-dom';
import { 
  Store, 
  Flower, 
  Users, 
  LogOut, 
  Home,
  Plus,
  Settings
} from 'lucide-react';
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
  const { logout, user } = useAuth();
  
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar Glass Elegante */}
      <aside className="w-72 backdrop-blur-xl bg-white/10 border-r border-white/20 shadow-2xl">
        {/* Header del Sidebar */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Panel Admin</h1>
              <p className="text-purple-200 text-sm">Gestión Completa</p>
            </div>
          </div>
        </div>

        {/* Navegación Principal */}
        <nav className="p-4 space-y-2">
          <NavLink
            to="floristerias"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25' 
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Store className="w-5 h-5" />
            <span className="font-medium">Floristerías</span>
            {({ isActive }) => isActive && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </NavLink>

          <NavLink
            to="productos"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25' 
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Flower className="w-5 h-5" />
            <span className="font-medium">Arreglos</span>
            {({ isActive }) => isActive && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </NavLink>

          <NavLink
            to="usuarios"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25' 
                  : 'text-purple-200 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Usuarios</span>
            {({ isActive }) => isActive && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </NavLink>
        </nav>

        {/* Sección de Usuario */}
        <div className="p-4 border-t border-white/20">
          <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {user?.name || 'Administrador'}
                </p>
                <p className="text-purple-200 text-xs">
                  {user?.role || 'admin'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Footer del Sidebar */}
        <div className="p-4 mt-auto">
          <div className="text-center">
            <p className="text-purple-300 text-xs">
              🌸 Tienda de Flores
            </p>
            <p className="text-purple-400 text-xs mt-1">
              Panel Administrativo
            </p>
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route index element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 text-center border border-white/20 shadow-2xl">
                <div className="text-6xl mb-4">🌸</div>
                <h2 className="text-3xl font-bold text-white mb-2">Bienvenido al Panel Admin</h2>
                <p className="text-purple-200 mb-6">Selecciona una opción del menú para comenzar</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10">
                    <Store className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold">Floristerías</h3>
                    <p className="text-purple-200 text-sm">Gestiona tus tiendas</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10">
                    <Flower className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold">Arreglos</h3>
                    <p className="text-purple-200 text-sm">Catálogo de productos</p>
                  </div>
                  <div className="backdrop-blur-sm bg-white/5 rounded-xl p-4 border border-white/10">
                    <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <h3 className="text-white font-semibold">Usuarios</h3>
                    <p className="text-purple-200 text-sm">Gestión de cuentas</p>
                  </div>
                </div>
              </div>
            </div>
          } />
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