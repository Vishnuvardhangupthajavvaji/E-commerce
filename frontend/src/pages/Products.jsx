import { useEffect, useState } from "react";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import { useContext } from "react";
import { CartContext } from "../context/CartContext";



function Products() {

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const { loadCartCount } = useContext(CartContext);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    API.get(`products/?search=${search}`)
      .then(res => setProducts(res.data))
      .catch(err => console.log(err));
  };

  const addToCart = (id) => {
    API.post("cart/add/", { product_id: id, quantity: 1 })
      .then(() => {alert("Added to cart"); 
        loadCartCount()
      })
      .catch(err => console.log(err));
  };

  return (
    <>
      <div className="container mt-4">
        <h3 className="mb-3">All Products</h3>

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

        <div className="row">
          {products.map(p => (
            <ProductCard key={p.id} product={p} addToCart={addToCart}/>
          ))}
        </div>
      </div>
    </>
  );
}

export default Products;
