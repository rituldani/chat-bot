import { io } from "socket.io-client";
const ENDPOINT = process.env.REACT_APP_SERVER_URL || "http://localhost:8000";

const socket = io(ENDPOINT, {
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;
