import { useEffect, useState } from "react";
import API from "../../api/axios";
import { Link } from "react-router-dom";

function AdminProducts(){

  const [products,setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    API.get(`products/?search=${search}`)
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  const handleDelete = async (id)=>{
    if(!window.confirm("Delete this product?")) return;

    await API.delete(`products/delete/${id}/`);
    fetchProducts();
  };

  return(
    <div>
        <div className="d-flex mb-4">
          <input
            className="form-control me-2"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={fetchProducts}>
            Search
          </button>
        </div>
      <div className="d-flex justify-content-between mb-3">
        <h3>Products</h3>
        <Link to="/admin/products/add" className="btn btn-primary">
          Add Product
        </Link>
      </div>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map(p=>(
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>
                {p.product_picture &&
                  <img src={p.product_picture} width="60"/>
                }
              </td>
              <td>{p.product_name}</td>
              <td>₹{p.price}</td>

              <td>
                <Link
                  to={`/admin/products/edit/${p.id}`}
                  className="btn btn-warning btn-sm me-2"
                >
                  Edit
                </Link>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={()=>handleDelete(p.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default AdminProducts;
