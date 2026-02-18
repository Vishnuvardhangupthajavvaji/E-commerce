import { Link, Outlet } from "react-router-dom";

function AdminDashboard() {
  return (
    <div className="container-fluid">
      <div className="row">

        {/* Sidebar */}
        <div className="col-md-2 bg-dark text-white vh-100 p-3">
          <h4 className="mb-4">Admin Panel</h4>

          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link className="nav-link text-white" to="/admin/products">
                Products
              </Link>
            </li>

            <li className="nav-item mb-2">
              <Link className="nav-link text-white" to="/admin/products/add">
                Add Product
              </Link>
            </li>
          </ul>
        </div>

        {/* Content area */}
        <div className="col-md-10 p-4">
          <Outlet />
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
