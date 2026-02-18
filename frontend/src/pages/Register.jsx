import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("users/register/", form);
      alert("Registration successful");
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ width: "420px" }}>
        <h3 className="text-center mb-3">Sign Up</h3>

        <form onSubmit={handleSubmit}>
          <input name="username" className="form-control mb-2" placeholder="Name" onChange={handleChange}/>
          <input name="phone" className="form-control mb-2" placeholder="Phone" onChange={handleChange}/>
          <input name="email" className="form-control mb-2" placeholder="Email" onChange={handleChange}/>
          <input name="password" type="password" className="form-control mb-2" placeholder="Password" onChange={handleChange}/>
          <input name="address" className="form-control mb-2" placeholder="Address" onChange={handleChange}/>
          <input name="state" className="form-control mb-2" placeholder="State" onChange={handleChange}/>
          <input name="city" className="form-control mb-2" placeholder="City" onChange={handleChange}/>
          <input name="pincode" className="form-control mb-3" placeholder="Pincode" onChange={handleChange}/>

          <button className="btn btn-primary w-100 mb-2">
            Sign Up
          </button>
        </form>

        <p className="text-center mt-3">
          Do you have an account? <Link to="/login" className="btn btn-light w-10">Login</Link>
        </p>
        
      </div>
    </div>
  );
}

export default Register;
