import axios from 'axios';
// const API = (token) =>
//   axios.create({
//     baseURL: process.env.REACT_APP_SERVER_URL,
//     headers: { Authorization: token },
//   });
const API = (token) =>
  axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });

// export const sendMessage = async (body) => {
//   try {
//     const token = localStorage.getItem('userToken');
//     const { data } = await API(token).post('/api/message/', body);
//     return data;
//   } catch (error) {
//     console.log('error in sendmessage api' + error);
//   }
// };
export const sendMessage = async (messageData) => {
  try {
    const token = localStorage.getItem("userToken");
    const { data } = await API(token).post('/api/message', messageData);
    return data;
  } catch (error) {
    console.error("error in sendMessage API", error);
  }
};
// export const fetchMessages = async (id) => {
//   try {
//     const token = localStorage.getItem('userToken');

//     const { data } = await API(token).get(`/api/message/${id}`);
//     return data;
//   } catch (error) {
//     console.log('error in fetch Message API ' + error);
//   }
// };
export const fetchMessages = async (chatId) => {
  try {
    const token = localStorage.getItem("userToken");
    const { data } = await API(token).get(`/api/message/${chatId}`);
    return data;
  } catch (error) {
    console.error("error in fetch Message API", error);
  }
};
