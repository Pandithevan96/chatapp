import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { auth, db, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "../firebase";
import useUserStore from "../store/store"; // Import the Zustand store
import { collection, getDocs, setDoc, doc } from "firebase/firestore"; // Fix typo here
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const { users, setUsers } = useUserStore(); // Use Zustand store to access users
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loading state for user fetching
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Fetch users from Firestore when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      if (users.length > 0) return; // Prevent redundant fetches
      setLoading(true); // Set loading state to true
      try {
        const usersCollection = collection(db, "users");
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => doc.data());
        setUsers(userList); // Store the fetched users in Zustand store
      } catch (error) {
        console.error("Error fetching users:", error.message);
      } finally {
        setLoading(false); // Set loading state to false after fetch
      }
    };
    fetchUsers();
  }, [users, setUsers]); // Only re-run if the users are empty or `setUsers` changes

  // Handle Google Sign Up
  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider); // signInWithPopup works with the 'auth' instance
      const user = result.user;
      const username = user.displayName || "User";
      const email = user.email;

      // Save user data to Firestore with a default profile image
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        profileImage: "https://via.placeholder.com/150", // Default image URL
        createdAt: new Date(),
      });

      // Update Zustand store with new user data
      setUsers([...users, { username, email, profileImage: "https://via.placeholder.com/150" }]);

      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error signing up with Google:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  // Handle form submission (Email/Password sign up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password } = formData;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data to Firestore with a default profile image
      const defaultProfileImage = "https://via.placeholder.com/150"; // Empty or default image URL
      await setDoc(doc(db, "users", user.uid), {
        uid:user.uid,
        username: username,
        email: email,
        profileImage: defaultProfileImage, // Include the default image field
        createdAt: new Date(),
      });

      // Update Zustand store with new user data
      setUsers([...users, { username, email, profileImage: defaultProfileImage }]);

      navigate("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error signing up:", error.message);
      alert(`Error: ${error.message}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-lg max-w-4xl w-full">
        <div className="flex justify-center items-center">
          <img
            src="../src/assets/signup.jpg"
            alt="Signup"
            className="lg:w-80 lg:h-80 h-52 w-52 object-cover rounded-lg"
          />
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <Typography variant="h4" className="text-center font-semibold text-gray-800">
            Sign Up
          </Typography>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              required
              className="bg-gray-50"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              aria-label="Enter your username"
            />
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              required
              className="bg-gray-50"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              aria-label="Enter your email"
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              name="password"
              fullWidth
              required
              value={formData.password}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: (
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              type="submit"
            >
              Sign Up
            </Button>
          </form>
          <div className="text-center">
            <Typography variant="body2" color="textSecondary">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
