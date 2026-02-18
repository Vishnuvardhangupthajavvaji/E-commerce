import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function EditProfile(){

  const [form,setForm] = useState({});
  const navigate = useNavigate();

  useEffect(()=>{
    API.get("users/me/")
      .then(res => setForm(res.data));
  },[]);

  const handleChange = e =>{
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = e =>{
    e.preventDefault();

    API.put("users/me/update/", form)
      .then(()=>{
        alert("Profile updated");
        navigate("/profile");
      });
  };

  return(
    <>

      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">

            <div className="card p-4 shadow">
              <h3 className="text-center mb-4">Edit Profile</h3>

              <form onSubmit={handleSubmit}>

                <label className="form-label">Name</label>
                <input
                  name="name"
                  value={form.username || ""}
                  onChange={handleChange}
                  className="form-control mb-3"
                />

                <label className="form-label">Phone</label>
                <input
                  name="phone"
                  value={form.phone || ""}
                  onChange={handleChange}
                  className="form-control mb-3"
                />

                <label className="form-label">Address</label>
                <input
                  name="address"
                  value={form.address || ""}
                  onChange={handleChange}
                  className="form-control mb-3"
                />

                <label className="form-label">State</label>
                <input
                  name="state"
                  value={form.state || ""}
                  onChange={handleChange}
                  className="form-control mb-3"
                />

                <label className="form-label">City</label>
                <input
                  name="city"
                  value={form.city || ""}
                  onChange={handleChange}
                  className="form-control mb-3"
                />

                <label className="form-label">Pincode</label>
                <input
                  name="pincode"
                  value={form.pincode || ""}
                  onChange={handleChange}
                  className="form-control mb-3"
                />

                <button className="btn btn-primary w-100">
                  Update Profile
                </button>

              </form>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default EditProfile;
