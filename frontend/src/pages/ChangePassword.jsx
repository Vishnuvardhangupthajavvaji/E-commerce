import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";

function ChangePassword(){
    const navigate = useNavigate();

  const [form,setForm] = useState({
    old_password:"",
    new_password:""
  });
  const [ErrorMsg, setErrorMsg] = useState("")
  const [newErrorMsg, setNewErrorMsg] = useState("")
  const [oldErrorMsg, setOldErrorMsg] = useState("")

  const handleChange = e =>{
    setErrorMsg("");
    setNewErrorMsg("");
    setOldErrorMsg("");
    setForm({...form,[e.target.name]:e.target.value});
  };

  const handleSubmit = e =>{
    e.preventDefault();

    API.post("users/change-password/",form)
        .then(()=>{
        setErrorMsg("");
        alert("Password changed successfully");
        navigate('/profile');
        })
        .catch(err=>{
        console.log("Error in changing passowrd : ",err);
        if(err.response && err.response.data){
            const data = err.response.data;

            if(data.new_password){
            setNewErrorMsg(data.new_password[0]);
            }
            else if(data.old_password){
            setOldErrorMsg(data.old_password[0]);
            }
            else{
            setErrorMsg("Something went wrong");
            }
        }
      });
  };

  return(
    <>
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <div className="card p-4">

              <h4 className="text-center mb-3">Change Password</h4>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Old Password</label>
                    <input name="old_password" type="password"
                    className="form-control"
                    onChange={handleChange}/>
                    {oldErrorMsg && (
                        <p className="text-danger text-center">{oldErrorMsg}</p>
                        )}
                </div>

                <div className="mb-3">
                    <label>New Password</label>
                    <input name="new_password" type="password"
                    className="form-control"
                    onChange={handleChange}/>

                    {newErrorMsg && (
                        <p className="text-danger text-center">{newErrorMsg}</p>
                        )}
                </div>

                {ErrorMsg && (
                    <p className="text-danger text-center">{ErrorMsg}</p>
                    )}

                <button className="btn btn-primary w-100">
                  Change Password
                </button>
              </form>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChangePassword;
