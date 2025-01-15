// store.js (Zustand store)
import { create } from "zustand";  // Named import

const useUserStore = create((set) => ({
  users: [],
  selectedUser: null,
  currentEmail: localStorage.getItem("currentEmail") || "",
  onlineEmail: null,
  setOnlineEmail:(email)=>set({onlineEmail:email}),
  setCurrentEmail: (email) => set({ currentEmail: email }),
  setUsers: (users) => set({ users }),
  setSelectedUser: (user) => set({ selectedUser: user }),
  
}));

export default useUserStore;
