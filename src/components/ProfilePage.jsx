import React, { useState, useEffect } from 'react';
import { Button, Avatar, Typography, TextField } from '@mui/material';
import { db } from '../firebase'; // Firebase config
import { updateDoc, doc } from 'firebase/firestore';
import useStore from '../store/store';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { ArrowBack } from '@mui/icons-material';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [image, setImage] = useState('https://via.placeholder.com/150'); // Default profile image
  const [loading, setLoading] = useState(true);

  const currentEmail = useStore((state) => state.currentEmail);
  const users = useStore((state) => state.users);

  const navigate = useNavigate(); // Initialize useNavigate

  // ✅ Ensure users and currentEmail are properly defined before accessing
  useEffect(() => {
    if (!users || !currentEmail) {
      setLoading(false);
      return;
    }

    const currentUser = users.find((user) => user?.email.trim() === currentEmail.trim()); // Added trim to avoid spaces
    if (currentUser) {
      setName(currentUser.username ?? '');
      setImage(currentUser.profileImage ?? 'https://via.placeholder.com/150');
    }
    setLoading(false);
  }, [currentEmail, users]);

  // ✅ Handle Save Operation
  const handleSave = async () => {
    if (!name) {
      alert('Please fill out your name.');
      return;
    }

    try {
      const currentUser = users?.find((user) => user?.email.trim() === currentEmail.trim());
      if (!currentUser) {
        alert('User not found.');
        return;
      }

      // Using the user ID (currentUser.uid) to reference the document
      const userRef = doc(db, 'users', currentUser.uid); // Use UID instead of email
      await updateDoc(userRef, {
        username: name,
        profileImage: image,
      });

      alert('Profile updated successfully!');
      navigate('/chatapp/'); // Navigate to home page after successful update
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('There was an error updating your profile. Please try again.');
    }
  };

  // ✅ Handle Image Upload
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 shadow-lg h-screen">
      <Button
        variant="contained"
        startIcon={<ArrowBack />}
        onClick={() => navigate('/chatapp/')}
        className="my-4 bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        Back to Home
      </Button>
      <Typography variant="h4" className="text-center my-6 text-3xl font-semibold text-gray-800">
        Profile Page
      </Typography>
      <Typography variant="subtitle1" className="text-center my-6 text-gray-600">
        Current Email: {currentEmail}
      </Typography>

      <div className="grid grid-cols-1  gap-6">
        <div className="flex flex-col items-center gap-3">
          <Avatar src={image} alt={name} sx={{ width: 100, height: 100 }} className="mb-4" />
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="icon-button-file"
            type="file"
            onChange={handleImageChange}
          />
          <label htmlFor="icon-button-file">
            <Button variant="contained" component="span" className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              Change Profile Picture
            </Button>
          </label>
        </div>

        <div>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            className="w-full"
          />
        </div>
      </div>

      <Button
      fullWidth
        variant="contained"
        color="primary"
        onClick={handleSave}
        className="mt-6 w-full sm:w-auto mx-auto block bg-indigo-600 hover:bg-indigo-700 text-white"
      >
        Save Changes
      </Button>
    </div>
  );
};

export default ProfilePage;
