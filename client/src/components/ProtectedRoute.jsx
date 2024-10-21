import { Navigate, Outlet, useLocation  } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { path } from '../ultils/constant';

const ProtectedRoute = ({ element }) => {
    const location = useLocation();
    const { isLoggedIn } = useAuthStore();

    return isLoggedIn ? <Outlet /> : <Navigate to={path.LOGIN} state={{ from: location }} />;
};

export default ProtectedRoute;
