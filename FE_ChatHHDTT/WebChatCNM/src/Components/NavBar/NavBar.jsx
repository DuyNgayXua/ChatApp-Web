
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";
import {  useDispatch, useSelector } from "react-redux";
import { createAxios } from "../../redux/createInstance";
import { logoutSuccess } from "../../redux/authSlice";
import { logout } from "../../redux/apiRequest";
const NavBar = () => {
  const user= useSelector((state)=> state.auth.login.currentUser)
  const dispatch= useDispatch();
  const accessToken=user?.accessToken;
  const id=user?._id;
  let axiosJWT= createAxios(user,dispatch,logoutSuccess);
  
const navigate =useNavigate();
  const handleLogout=()=>{
    logout(dispatch,id,navigate,accessToken,axiosJWT);


  }
  return (
    <nav className="navbar-container">
      <Link to="/" className="navbar-home"> Home </Link>
      {user? (
        <>
        <p className="navbar-user">Hi, <span> {user.username}  </span> </p>
        <Link to="/logout" className="navbar-logout" onClick={handleLogout} > Log out</Link>
        </>
      ) : (    
        <>
      <Link to="/login" className="navbar-login"> Login </Link>
            <Link to="/register" className="navbar-register"> Register</Link>
            <Link to="/chat-app" className="navbar-chatapp"> ChatApp</Link>
      </>
)}
    </nav>
  );
};

export default NavBar;
