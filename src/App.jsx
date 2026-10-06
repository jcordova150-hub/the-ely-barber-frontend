import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import BarberLogin from "./pages/BarberLogin";
import BarberAppointments from "./pages/BarberAppointments";
import Booking from "./pages/Booking";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminBarbers from "./pages/admin/AdminBarbers";
import AdminServices from "./pages/admin/AdminServices";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminClients from "./pages/admin/AdminClients";
import AdminLoyalty from "./pages/admin/AdminLoyalty";
import AdminFinance from "./pages/admin/AdminFinance";
import LoyaltyCard from "./pages/LoyaltyCard";

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

function RequireBarber({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "barber") return <Navigate to="/barbero" replace />;
  return children;
}

function SiteLayout({ children }) {
  const location = useLocation();
  const isPublicLoyaltyCard = location.pathname.startsWith("/fidelidad/");

  return (
    <>
      {!isPublicLoyaltyCard && <Navbar />}
      {children}
      {!isPublicLoyaltyCard && <Footer />}
    </>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <SiteLayout>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/barbero" element={<BarberLogin />} />
        <Route path="/mis-citas" element={<RequireBarber><BarberAppointments /></RequireBarber>} />
        <Route path="/reservar" element={<Booking />} />
        <Route path="/fidelidad/:publicCode" element={<LoyaltyCard />} />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="citas" replace />} />
          <Route path="citas" element={<AdminAppointments />} />
          <Route path="barberos" element={<AdminBarbers />} />
          <Route path="articulos" element={<AdminServices />} />
          <Route path="clientes" element={<AdminClients />} />
          <Route path="fidelidad" element={<AdminLoyalty />} />
          <Route path="finanzas" element={<AdminFinance />} />
        </Route>
        </Routes>
      </SiteLayout>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
