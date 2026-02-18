import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function Profile(){
  const navigate = useNavigate();

  const [user,setUser] = useState(null);

  useEffect(()=>{
    API.get("users/me/")
      .then(res => setUser(res.data))
      .catch(err => console.log(err));
  },[]);

  if(!user) return <p className="text-center mt-5">Loading...</p>;

  return(
    <>
      <div className="container mt-4">
        <h3>My Profile</h3>

        <div className="card p-4 mt-3 w-50">

          <p><b>Name:</b> {user.username}</p>
          <p><b>Email:</b> {user.email}</p>
          <p><b>Phone:</b> {user.phone}</p>
          <p><b>Address:</b> {user.address}</p>
          <p><b>State:</b> {user.state}</p>
          <p><b>City:</b> {user.city}</p>
          <p><b>Pincode:</b> {user.pincode}</p>

        </div>
        <button
          className="btn btn-primary mt-3"
          onClick={()=>navigate("/profile/edit")}
        >
          Edit Profile
        </button>

        <button
          className="btn btn-warning mt-3 ms-2"
          onClick={()=>navigate("/change-password")}
        >
          Change Password
        </button>

      </div>
    </>
  )
}

export default Profile;
