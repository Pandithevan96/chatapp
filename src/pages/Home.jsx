  import React, { useEffect, useState } from "react";
  import {
    Button,
    TextField,
    IconButton,
    Avatar,
    Typography,
    Drawer,
    Tooltip,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,Badge
  } from "@mui/material";
  import { Link, useNavigate } from "react-router-dom";
  import {
    Message,
    Send,
    Logout,
    Cancel,
    MoreVert,
    Delete,
  } from "@mui/icons-material";
  import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
  } from "firebase/firestore";
  import { db, auth, signOut } from "../firebase";
  import useUserStore from "../store/store";
  import { styled } from '@mui/material/styles';
  
  // Define an array of colors
  const colors = [
    "#FF5722",
    "#3F51B5",
    "#8BC34A",
    "#F44336",
    "#9C27B0",
    "#E91E63",
    "#FFC107",
    "#2196F3",
    "#009688",
    "#00BCD4",
  ];
  const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
      backgroundColor: '#44b700',
      color: '#44b700',
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        animation: 'ripple 1.2s infinite ease-in-out',
        border: '1px solid currentColor',
        content: '""',
      },
    },
    '@keyframes ripple': {
      '0%': {
        transform: 'scale(.8)',
        opacity: 1,
      },
      '100%': {
        transform: 'scale(2.4)',
        opacity: 0,
      },
    },
  }));
  // Function to get a color based on the user (email)
  const getUserColor = (email) => {
    const index = email.toLowerCase().charCodeAt(0) % colors.length; // Assign a color based on the first character of email
    return colors[index];
  };

  const Home = () => {
    const navigate = useNavigate();

    const { users, setUsers, selectedUser, setSelectedUser,currentEmail,setCurrentEmail } = useUserStore();
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState([]);
    const [menuAnchor, setMenuAnchor] = useState(null);
 
    const [logoutFlag, setLogoutFlag] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false); // State for dialog visibility
    const [drawerOpen, setDrawerOpen] = useState(false); // State for drawer visibility
    const handleUserClick = (e) => {
      setSelectedUser(e);
      setDrawerOpen(false);
    };
    // Function to format timestamp to 12-hour AM/PM format
    const formatTimestamp = (timestamp) => {
      const date = new Date(timestamp);
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;
      const timeStr = `${hours}:${minutesFormatted} ${ampm}`;
      return timeStr;
    };
    const [anchorEl, setAnchorEl] = useState(null);
    const open2 = Boolean(anchorEl);
    const [selectedMessage, setSelectedMessage] = useState(null);

      // Handle opening the menu
      const handleMenuClick = (event) => {
        setMenuAnchor(event.currentTarget);
      };
    
      // Handle closing the menu
      const handleMenuClose = () => {
        setMenuAnchor(null);
      };  
    // Open the dialog
    const handleClick = (event, msg) => {
      setSelectedMessage(msg); // Set the selected message
      setDialogOpen(true); // Open the dialog
    };

    const ToProfile = () => {
      navigate("/profilePage")
    }
    // Delete the selected message
    const handleDeleteMessage = async () => {
      if (!selectedMessage) return;
      try {
        await deleteDoc(doc(db, "messages", selectedMessage.id)); // Delete message from Firestore
        setDialogOpen(false); // Close the dialog
        setSelectedMessage(null); // Clear the selected message
        console.log("Message deleted successfully");
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    };

    // Close the dialog
    const handleCloseDialog = () => {
      setDialogOpen(false);
      setSelectedMessage(null);
    };

    useEffect(() => {
      const user = auth.currentUser;
      if (user && !currentEmail) {
        setCurrentEmail(user.email);
        localStorage.setItem("currentEmail", user.email);
        setCurrentEmail(user.email)
      }
    }, [currentEmail]);

    // Fetch users from Firestore
    useEffect(() => {
      const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map((doc) => doc.data());
        setUsers(usersData); // Update Zustand store with users
      });

      return () => unsubscribe();
    }, [setUsers]);

    // Fetch messages in real-time
    useEffect(() => {
      if (!selectedUser) return;

      const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs
          .map((doc) => ({
            id: doc.id, // Include the message ID
            ...doc.data(),
          }))
          .filter(
            (msg) =>
              (msg.sender === currentEmail && msg.receiver === selectedUser) ||
              (msg.sender === selectedUser && msg.receiver === currentEmail)
          );
        setChatMessages(messages);
      });

      return () => unsubscribe();
    }, [selectedUser, currentEmail, logoutFlag]);

    // Send a message
    const handleSendMessage = async () => {
      if (message.trim() === "") return;

      try {
        // Ensure both sender and receiver are captured
        await addDoc(collection(db, "messages"), {
          text: message,
          sender: currentEmail,
          receiver: selectedUser,
          timestamp: new Date(),
        });
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error.message);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && message.trim() !== "") {
        e.preventDefault();
        handleSendMessage(); // Send message when Enter is pressed
      }
      if (e.key === "Tab") {
        e.preventDefault();
        document.getElementById("send-button").focus(); // Move focus to the send button
      }
    };
    // Handle logout
    const handleLogout = async () => {
      try {
        if (currentEmail) {
          // Retrieve the user's UID (if not already stored)
          const userUid = auth.currentUser?.uid; // Ensure currentUser is available
    
          if (userUid) {
            // Reference the Firestore document using the UID
            const userRef = doc(db, "users", userUid);
    
            // Update the status to "off"
            await updateDoc(userRef, { status: "off" });
            console.log("User status updated to 'off'.");
          } else {
            console.error("User UID not found.");
          }
        }
    
        // Sign out the user
        await signOut(auth);
    
        // Clear user information and redirect
        setCurrentEmail("");
        localStorage.removeItem("currentEmail");
        navigate("/login");
      } catch (error) {
        console.error("Error logging out:", error.message);
      }
    };
    
    const currentUser = users?.find((user) => user?.email.trim() === currentEmail?.trim());
    const clickedUser = users?.find((user) => user?.email.trim() === selectedUser?.trim());

    return (

      <div className="home overflow-y-auto lg:w-[800px] lg:mx-auto ">

        {/* Drawer for the first column */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: 280,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 280,
              boxSizing: "border-box",
            },
          }}
        >
          <div className="flex flex-col h-full bg-gray-900 text-white ">
            <div className=" flex items-center p-3 bg-gray-500 h-14 justify-between">
              <div className="flex items-center  ">
                <Message className="text-white" />
                <h3 className="lg:text-2xl text-md font-bold text-amber-400 ml-2">
                  Chat<span className="text-slate-300 ">fo</span>
                </h3>
              </div>
              <Cancel onClick={() => setDrawerOpen(false)} />
            </div>

            <div className="flex-grow overflow-y-auto p-3">
              <Typography variant="h6" className="text-white mb-2">
                Users
              </Typography>
              <ul>
                {users.length === 0 ? (
                  <li className="text-gray-500 ">No users available</li>
                ) : (
                  users.map(
                    (user, index) =>
                      user.email !== currentEmail && (
                        <li
                          key={index}
                          className={`flex items-center gap-2 mb-3 p-2 justify-start ${
                            selectedUser === user.email
                              ? "bg-blue-600"
                              : "bg-gray-800"
                          } rounded cursor-pointer`}
                          onClick={() => handleUserClick(user.email)}
                        > 
                        
                        {users.status === "on"? (
                          <StyledBadge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        variant="dot"
                      >
                          <Avatar sx={{ bgcolor: getUserColor(user.email) }} src={user?.profileImage }>
                            
                          </Avatar>
                          </StyledBadge>):
                          (<Avatar sx={{ bgcolor: getUserColor(user.email) }} src={user?.profileImage }>
                            
                          </Avatar>)
                          }
                          <span>{user.username}</span>
                        </li>
                      )
                  )
                )}
              </ul>
            </div>
          </div>
        
        </Drawer>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={ToProfile}>Profile</MenuItem>
          
          <IconButton color="inherit" onClick={handleLogout}>
                  <Logout className="text-black " />
                </IconButton>
    
        </Menu>
        {/* Delete confirmation dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this message?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteMessage} color="secondary">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        <div className=" bg-red-800  flex flex-col  ">
          <div className=" bg-gray-200 flex flex-col justify-between h-screen">
            <div className="bg-slate-600 h-14 p-3 flex items-center justify-between ">
              <div className="flex gap-2 items-center ">
                <div>
                  <Button
                    onClick={() => setDrawerOpen(true)}
                    variant="outlined"
                    sx={{ color: "white", borderColor: "white",fontSize:'0.7em' }}
                  >
                    View Users to Chat
                  </Button>
                </div>
                {selectedUser && (
                  <Avatar
                  src={clickedUser?.profileImage }
                    sx={{
                      bgcolor: getUserColor(selectedUser),
                    }}
                  >
                  </Avatar>
                )}

                <Typography variant="h5" className="text-white hidden lg:block">
                  {selectedUser ? selectedUser : "Select a user to chat"}
                </Typography>
              </div>

              <div className="flex gap-2 items-center mx-2">
                <Avatar sx={{ bgcolor: getUserColor(currentEmail) }} src={currentUser?.profileImage }>
                </Avatar>
              <MoreVert sx={{color:'white'}}     onClick={handleMenuClick}/>

              </div>
            </div>
            {currentEmail ? (
              <div className=" p-4 bg-gray-400 overflow-y-auto  h-full ">
                {selectedUser && (
                  <div>
                    {chatMessages.map((msg, index) => (
                      <div className="flex gap-1 " key={index}>
                        {/* Avatar for the sender */}
                        {msg.sender !== currentEmail && (
                          <Avatar
                            sx={{
                              bgcolor: getUserColor(msg.sender),
                            }}
                            className="mr-2"
                          >
                            {msg.sender.charAt(0).toUpperCase()}
                          </Avatar>
                        )}
                        <Tooltip>
                          <div
                            key={msg.id}
                            className={`p-2 mb-2 rounded shadow-sm max-w-lg h-auto break-words   ${
                              msg.sender === currentEmail
                                ? "bg-violet-700 text-white ml-auto"
                                : "bg-white text-black mr-auto"
                            } flex items-center`}
                            onClick={(event) => handleClick(event, msg)}
                          >
                            <div >
                              <div>{msg.text}</div>
                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    msg.sender === currentEmail
                                      ? "#BEBDBF"
                                      : "#403A35",
                                }}
                              >
                                {formatTimestamp(msg.timestamp?.seconds * 1000)}
                              </Typography>
                            </div>
                          </div>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3">
                <h2 className="text-2xl">Please Login to Chat...</h2>
                <Link to="/login">
                  <Button variant="contained" color="primary" className="my-4">
                    Login
                  </Button>
                </Link>
              </div>
            )}
            {currentEmail && (
              <div className="p-3 bg-gray-300 flex items-center   ">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full p-2 mr-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown} // Attach keydown handler
                />

                <Send
                  id="send-button"
                  className="inline-block mr-2 hover:text-blue-950 transition-all duration-300"
                  onClick={handleSendMessage}
                  tabIndex={0} // Make sure the Send icon is focusable
                  onKeyDown={handleKeyDown} // Attach keydown handler
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  export default Home;
