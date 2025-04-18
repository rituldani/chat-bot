import axios from 'axios';
import { toast } from 'react-toastify';

const url = process.env.REACT_APP_SERVER_URL;
console.log("SERVER URL:", url);

const API = (token) =>
  axios.create({
    baseURL: "https://chat-backend-jfgg.onrender.com",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
export const loginUser = async (formData) => {
  try {
    const res = await axios.post('https://chat-backend-jfgg.onrender.com/auth/login', formData, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // only if you use cookies
    });
    console.log("Login Response:", res); 
    return res.data;
  } catch (error) {
    console.error("Login API Error:", error.response?.data || error.message);
    throw error; // <== rethrow the error so your Login.jsx can catch it
  }
};
export const registerUser = async (body) => {
  try {
    return await axios.post(`${url}/auth/register`, body);
  } catch (error) {
    console.log('error in register api');
  }
};
export const validUser = async () => {
  try {
    const token = localStorage.getItem('userToken');
    console.log("Token being sent to /auth/valid:", token);
    if (!token) return null;
    console.log("Token being sent to /auth/valid:", token);
    return await axios.get('https://chat-backend-jfgg.onrender.com/auth/valid', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Error in validUser API:', error.response || error.message);
    return null;
  }
};
export const searchUsers = async (id) => {
  try {
    const token = localStorage.getItem('userToken');

    return await API(token).get(`/api/user?search=${id}`);
  } catch (error) {
    console.log('error in search users api');
  }
};
export const updateUser = async (id, body) => {
  try {
    const token = localStorage.getItem('userToken');

    const { data } = await API(token).patch(`/api/users/update/${id}`, body);
    return data;
  } catch (error) {
    console.log('error in update user api');
    toast.error('Something Went Wrong.try Again!');
  }
};
export const checkValid = async () => {
  const token = localStorage.getItem("userToken");
  if (!token) return;


  const data = await validUser();
  if (!data?.user) {
    window.location.href = '/login';
  } else {
    window.location.href = '/chats';
  }
};
export const googleAuth = async (body) => {
  try {
    return await axios.post(`${url}/api/google`, body);
  } catch (error) {
    console.log(error);
  }
};
