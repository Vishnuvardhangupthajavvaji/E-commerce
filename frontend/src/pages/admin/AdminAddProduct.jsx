import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

function AdminAddProduct() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    product_name: "",
    price: "",
    category: "",
    description: "",
    brand: "",
    color: "",
  });

  const [image, setImage] = useState(null);

  const handleChange = e => {
    setForm({...form, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(form).forEach(key => {
      data.append(key, form[key]);
    });

    data.append("product_picture", image);

    try {
      await API.post("products/create/", data, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      navigate("/admin/products");

    } catch(err){
      console.log(err);
      alert("Error creating product");
    }
  };

  return (
    <div className="card p-4">
      <h3>Add Product</h3>

      <form onSubmit={handleSubmit}>

        <input name="product_name" className="form-control mb-2" placeholder="Product name" onChange={handleChange}/>
        <input name="price" className="form-control mb-2" placeholder="Price" onChange={handleChange}/>
        <input name="category" className="form-control mb-2" placeholder="Category" onChange={handleChange}/>
        <input name="brand" className="form-control mb-2" placeholder="Brand" onChange={handleChange}/>
        <input name="color" className="form-control mb-2" placeholder="Color" onChange={handleChange}/>

        <textarea name="description" className="form-control mb-2" placeholder="Description" onChange={handleChange}></textarea>

        <input type="file" className="form-control mb-3" onChange={e => setImage(e.target.files[0])}/>

        <button className="btn btn-primary">Create</button>

      </form>
    </div>
  );
}

export default AdminAddProduct;
