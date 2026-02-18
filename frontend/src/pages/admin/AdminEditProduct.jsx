import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";

function AdminEditProduct(){

  const { id } = useParams();
  const navigate = useNavigate();

  const [preview,setPreview] = useState(null);


  const [form,setForm] = useState({
    product_name:"",
    price:"",
    description:"",
    color:"",
    brand:"",
    category:"",
    product_picture:null
  });

  useEffect(()=>{
    API.get(`products/${id}`)
        .then(res => {
        setForm({...res.data, product_picture:null});
        setPreview(res.data.product_picture); 
        });
    },[id]);

  const handleChange = e =>{
    const {name,value,files} = e.target;

    if(files){
        setForm({...form,[name]:files[0]});
        setPreview(URL.createObjectURL(files[0]));   // new preview
    }else{
        setForm({...form,[name]:value});
    }
    };


  const handleSubmit = async e =>{
    e.preventDefault();

    const data = new FormData();

    Object.keys(form).forEach(key=>{
      if(form[key] !== null){
        data.append(key,form[key]);
      }
    });

    console.log("Form Data : ", data);

    await API.patch(`products/update/${id}/`, data, {
      headers: {"Content-Type":"multipart/form-data"}
    });

    navigate("/admin/products");
  };

  return(
    <div className="container">
      <h3>Edit Product</h3>

      <form onSubmit={handleSubmit}>

        <label className="form-label">Product Name</label>
        <input
            name="product_name"
            className="form-control mb-3"
            value={form.product_name}
            onChange={handleChange}
        />

        <label className="form-label">Price</label>
        <input
            name="price"
            className="form-control mb-3"
            value={form.price}
            onChange={handleChange}
        />

        <label className="form-label">Category</label>
        <input
            name="category"
            className="form-control mb-3"
            value={form.category}
            onChange={handleChange}
        />

        <label className="form-label">Brand</label>
        <input
            name="brand"
            className="form-control mb-3"
            value={form.brand || ""}
            onChange={handleChange}
        />

        <label className="form-label">Color</label>
        <input
            name="color"
            className="form-control mb-3"
            value={form.color || ""}
            onChange={handleChange}
        />

        <label className="form-label">Description</label>
        <textarea
            name="description"
            className="form-control mb-3"
            value={form.description || ""}
            onChange={handleChange}
        />

        {preview && (
            <div className="mb-3">
                <label className="form-label">Current Image</label><br/>
                <img src={preview} alt="preview" width="120" className="border"/>
            </div>
            )}


        <label className="form-label">Change Image</label>
        <input
            type="file"
            name="product_picture"
            className="form-control mb-4"
            onChange={handleChange}
        />

        <button className="btn btn-success">Update Product</button>

        </form>

    </div>
  );
}

export default AdminEditProduct;
