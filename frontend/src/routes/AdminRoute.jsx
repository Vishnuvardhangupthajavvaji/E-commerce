import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  console.log(user);
  if (!user) return <Navigate to="/login" />;
  console.log(user.is_staff);
  if (!user.is_staff) return <Navigate to="/" />;

  return children;
};

export default AdminRoute;
