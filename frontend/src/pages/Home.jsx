import { useEffect, useState } from "react";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";

function Home() {

  const [featured, setFeatured] = useState([]);
  const [remaining, setRemaining] = useState([]);

  useEffect(() => {
    API.get("products/featured/")
      .then(res => setFeatured(res.data))
      .catch(err => console.log(err));

    API.get("products/")
    .then((res)=> setRemaining(res.data))
    .catch(err => console.log(err))
  }, []);

  return (
    <>
      <div className="container mt-4">
        <h3 className="text-center mb-4">Welcome to JVVG Store</h3>

        <h4 className="mb-3">Featured Products</h4>

        <div className="row">
          {featured.map(p => (
            <ProductCard key={p.id} product={p}/>
          ))}
        </div>
        
        <h4 className="mb-3">Our Products</h4>

        <div className="row">
          {remaining.map(p => (
            <ProductCard key={p.id} product={p}/>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
