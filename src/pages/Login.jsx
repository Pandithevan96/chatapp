import React, { useState } from 'react';
import { Button, Typography, TextField, IconButton } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { auth, db } from '../firebase'; // Import from your Firebase config
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import useUserStore from "../store/store";
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {onlineEmail,setOnlineEmail}= useUserStore();

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user in Firestore
      const q = query(collection(db, "users"), where("email", "==", user.email));
      setOnlineEmail(user.email)
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) { 
        navigate('#/chatapp');
      } else {
        setError("User not found in the database.");
      }
    } catch (error) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="login flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm ">
        <Typography variant="h4" className="text-center font-semibold text-gray-800 mb-6 my-2" gutterBottom>Login</Typography>
        {error && <Typography variant="body2" color="error" className="text-center mb-4">{error}</Typography>}
        <form className="space-y-4" onSubmit={handleLogin}>
          <TextField label="Email"  variant="outlined" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField
          
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              ),
            }}
          />
          <Button variant="contained" color="primary" fullWidth size="large" type="submit">Login</Button>
        </form>
        <div className="text-center mt-4">
          <Typography variant="body2" color="textSecondary">
            Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link>
          </Typography>
        </div>
      </div>
    </div>
  );
};

export default Login;
