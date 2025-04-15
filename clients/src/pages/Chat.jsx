import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Model from '../components/Model';
import { BsEmojiSmile, BsFillEmojiSmileFill } from "react-icons/bs"
import { fetchMessages, sendMessage } from '../apis/messages';
import { useEffect } from 'react';
import MessageHistory from '../components/MessageHistory';
import io from "socket.io-client"
import "./home.css"
import { fetchChats, setNotifications } from '../redux/chatsSlice';
import Loading from '../components/ui/Loading';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { IoSend } from 'react-icons/io5';
import { getChatName } from '../utils/logics';
import Typing from '../components/ui/Typing';
import { validUser } from '../apis/auth';
const ENDPOINT = process.env.REACT_APP_SERVER_URL;
let socket;

function Chat(props) {
  const { activeChat, notifications } = useSelector((state) => state.chats)
  const dispatch = useDispatch()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [socketConnected, setSocketConnected] = useState(false)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPicker, setShowPicker] = useState(false);
  const activeUser = useSelector((state) => state.activeUser)

  const keyDownFunction = async (e) => {
    if ((e.key === "Enter" || e.type === "click") && (message)) {
      setMessage("")
      socket.emit("stop typing", activeChat._id)
      const data = await sendMessage({ chatId: activeChat._id, message })
      console.log("📤 Emitting socket message:", data);
      socket.emit("new message", data)
      setMessages([...messages, data])
      dispatch(fetchChats())
    }
  }

  useEffect(() => {
    socket = io(ENDPOINT)
    socket.on("typing", () => setIsTyping(true))
    socket.on("stop typing", () => setIsTyping(false))
  }, [])


  useEffect(() => {
    if (!activeUser || !socket) return;

    console.log("🔌 Setting up socket for", activeUser.name);
    // socket.emit("setup", activeUser);
    socket.emit("setup", {
      ...activeUser,
      _id: activeUser._id || activeUser.id, // ensure the backend gets _id
    });    
    socket.on("connected", () => {
      console.log("✅ Socket connected");
      setSocketConnected(true);
    });

    return () => {
      socket.off("connected");
    };
  }, [activeUser]);

  // useEffect(() => {
  //   if (!activeUser || !activeUser._id) {
  //     console.warn("⚠️ No active user, skipping socket setup.");
  //     return;
  //   }
  
  //   console.log("🔌 Emitting setup for user:", activeUser._id);
  //   socket.emit("setup", activeUser);
    
  //   socket.on("connected", () => {
  //     console.log("✅ Socket connected");
  //     setSocketConnected(true);
  //   });
  
  //   return () => {
  //     socket.off("connected");
  //   };
  // }, [activeUser]);
  
  
  useEffect(() => {
    const fetchMessagesFunc = async () => {
      if (activeChat) {
        setLoading(true)
        const data = await fetchMessages(activeChat._id)
        setMessages(data)
        socket.emit("join room", activeChat._id)
        setLoading(false)

      }
      return
    }
    fetchMessagesFunc()
  }, [activeChat])


  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      console.log("📩 Message received via socket:", newMessageReceived);

      const newChatId =
        typeof newMessageReceived.chatId === "object"
          ? newMessageReceived.chatId._id
          : newMessageReceived.chatId;

      if (!activeChat || activeChat._id !== newChatId) {
        if (!notifications.some((n) => n._id === newMessageReceived._id)) {
          dispatch(setNotifications([newMessageReceived, ...notifications]));
        }
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }

      dispatch(fetchChats());
    });

    return () => socket.off("message received");
  }, [notifications, dispatch, activeChat]);


  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const isValid = async () => {
      const data = await validUser();
      if (!data?.user) {
        window.location.href = "/login";
      }
    };

    isValid();
  }, []);


  useEffect(() => {
    socket.on('user online', (userId) => {
      console.log(`${userId} is online 👀`)
    })

    socket.on('user offline', (userId) => {
      console.log(`${userId} went offline ❌`)
    })

    return () => {
      socket.off('user online')
      socket.off('user offline')
    }
  }, [])

  if (loading) {
    return <div className={props.className}>
      <Loading />
    </div>
  }

  return (
    <>
      {
        activeChat
          ?
          <div className={props.className}>
            <div className='flex justify-start gap-4 items-center px-6 pt-3 bg-[#ffff] dark:bg-zinc-600 w-[100%]'>
              <div>
                <Model />
              </div>
              <div className='flex items-center gap-x-[10px]'>
                <div className='flex flex-col items-start justify-center'>
                  <h5 className='text-[17px] text-[#2b2e33] dark:text-[#E5E7EB] font-bold tracking-wide'>{getChatName(activeChat, activeUser)}</h5>
                  <p className='text-[11px] text-[#aabac8]'>Online</p>
                </div>
              </div>
            </div>

            <div className=" bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] dark:bg-[url('https://wallpapercave.com/wp/wp10254557.jpg')] scrollbar-hide w-[100%] h-[83vh]  flex flex-col overflow-y-scroll p-4 pb-2 ">
              <MessageHistory typing={isTyping} messages={messages} />
              <div className='ml-7 -mb-10'>
                {
                  isTyping ?
                    <Typing width="100" height="100" /> : ""
                }
              </div>
            </div>

            <div className='absolute w-[100%] bottom-2'>
              {showPicker && <Picker data={data} onEmojiSelect={(e) => setMessage(message + e.native)} />}
              <div className='border-[1px] border-[#ecf2f5] dark:border-transparent px-6 py-3  h-[50px] flex justify-between items-start gap-4'>

                <div className='cursor-pointer ' onClick={() => setShowPicker(!showPicker)}>
                  {showPicker ? <BsFillEmojiSmileFill className='w-[20px] h-[20px] text-[#ffb02e] border-[black]' /> : <BsEmojiSmile className='w-[20px] h-[20px]' />}
                </div>

                <form className='w-[900px] px-3 dark:bg-zinc-600' onKeyDown={(e) => keyDownFunction(e)} onSubmit={(e) => e.preventDefault()}>
                  <input onChange={(e) => {
                    setMessage(e.target.value)
                    if (!socketConnected) return
                    if (!typing) {
                      setTyping(true)
                      socket.emit('typing', activeChat._id)
                    }
                    let lastTime = new Date().getTime()
                    var time = 3000
                    setTimeout(() => {
                      var timeNow = new Date().getTime()
                      var timeDiff = timeNow - lastTime
                      if (timeDiff >= time && typing) {
                        socket.emit("stop typing", activeChat._id)
                        setTyping(false)
                      }
                    }, time)
                  }} className='focus:outline-0 w-[100%] bg-[#f8f9fa] dark:bg-zinc-600' type="text" name="message" placeholder="Enter message" value={message} />
                </form>

                <button onClick={(e) => keyDownFunction(e)} className='bg-[#f8f9fa] dark:bg-zinc-600 px-2 py-[3px] text-[#9e9e9e] -mt-1'><IoSend className="text-xl" /></button>

              </div>
            </div>
          </div>
          :
          <div className={props.className}>
            <div className='relative'>
              <div className='absolute top-[40vh] left-[44%] flex flex-col items-center justify-center gap-y-3'>
                <img className='w-[50px] h-[50px] rounded-[25px]' alt="User profile" src={activeUser.profilePic} />
                <h3 className='text-[#111b21] text-[23px] font-medium tracking-wider'>Welcome <span className='text-[#166e48] dark:text-[#E5E7EB] text-[22px] font-bold'> {activeUser.name}</span></h3>
              </div>
            </div>
          </div>

      }
    </>
  )
}

export default Chat








// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import io from 'socket.io-client';
// import { validUser } from '../apis/auth';
// import { fetchMessages, sendMessage } from '../apis/messages';
// import { fetchChats, setNotifications } from '../redux/chatsSlice';
// import MessageHistory from '../components/MessageHistory';
// import Typing from '../components/ui/Typing';
// import Loading from '../components/ui/Loading';
// import Model from '../components/Model';
// import Picker from '@emoji-mart/react';
// import data from '@emoji-mart/data';
// import { BsEmojiSmile, BsFillEmojiSmileFill } from 'react-icons/bs';
// import { IoSend } from 'react-icons/io5';
// import { getChatName } from '../utils/logics';
// import './home.css';

// const ENDPOINT = process.env.REACT_APP_SERVER_URL;
// const socket = io(ENDPOINT);

// function Chat(props) {
//   const { activeChat, notifications } = useSelector((state) => state.chats);
//   const activeUser = useSelector((state) => state.activeUser);
//   const dispatch = useDispatch();

//   const [message, setMessage] = useState("");
//   const [messages, setMessages] = useState([]);
//   const [socketConnected, setSocketConnected] = useState(false);
//   const [typing, setTyping] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showPicker, setShowPicker] = useState(false);

//   useEffect(() => {
//     socket.on("typing", () => setIsTyping(true));
//     socket.on("stop typing", () => setIsTyping(false));
//   }, []);

//   useEffect(() => {
//     if (!activeUser || !activeUser._id) {
//       console.warn("⚠️ No active user, skipping socket setup.");
//       return;
//     }

//     console.log("🔌 Emitting setup for user:", activeUser._id);
//     socket.emit("setup", activeUser);

//     socket.on("connected", () => {
//       console.log("✅ Socket connected");
//       setSocketConnected(true);
//     });

//     return () => {
//       socket.off("connected");
//     };
//   }, [activeUser]);

//   useEffect(() => {
//     const fetchMessagesFunc = async () => {
//       if (activeChat) {
//         setLoading(true);
//         const data = await fetchMessages(activeChat._id);
//         setMessages(data);
//         socket.emit("join room", activeChat._id);
//         setLoading(false);
//       }
//     };
//     fetchMessagesFunc();
//   }, [activeChat]);

//   useEffect(() => {
//     socket.on("message received", (newMessageReceived) => {
//       console.log("📩 Message received via socket:", newMessageReceived);

//       const newChatId =
//         typeof newMessageReceived.chatId === "object"
//           ? newMessageReceived.chatId._id
//           : newMessageReceived.chatId;

//       if (!activeChat || activeChat._id !== newChatId) {
//         if (!notifications.some((n) => n._id === newMessageReceived._id)) {
//           dispatch(setNotifications([newMessageReceived, ...notifications]));
//         }
//       } else {
//         setMessages((prev) => [...prev, newMessageReceived]);
//       }

//       dispatch(fetchChats());
//     });

//     return () => socket.off("message received");
//   }, [notifications, dispatch, activeChat]);

//   useEffect(() => {
//     const token = localStorage.getItem("userToken");
//     if (!token) {
//       window.location.href = "/login";
//       return;
//     }

//     const isValid = async () => {
//       const data = await validUser();
//       if (!data?.user) {
//         window.location.href = "/login";
//       }
//     };

//     isValid();
//   }, []);

//   useEffect(() => {
//     socket.on('user online', (userId) => console.log(`${userId} is online 👀`));
//     socket.on('user offline', (userId) => console.log(`${userId} went offline ❌`));
//     return () => {
//       socket.off('user online');
//       socket.off('user offline');
//     };
//   }, []);

//   const keyDownFunction = async (e) => {
//     if ((e.key === "Enter" || e.type === "click") && message) {
//       setMessage("");
//       socket.emit("stop typing", activeChat._id);
//       const data = await sendMessage({ chatId: activeChat._id, message });
//       console.log("📤 Emitting socket message:", data);
//       socket.emit("new message", {
//         ...data,
//         chatId: activeChat,
//         sender: activeUser,
//       });
//       setMessages([...messages, data]);
//       dispatch(fetchChats());
//     }
//   };

//   if (loading) {
//     return <div className={props.className}><Loading /></div>;
//   }

//   return (
//     <>
//       {activeChat ? (
//         <div className={props.className}>
//           {/* Chat Header */}
//           <div className='flex justify-start gap-4 items-center px-6 pt-3 bg-[#ffff] dark:bg-zinc-600 w-[100%]'>
//             <Model />
//             <div className='flex items-center gap-x-[10px]'>
//               <div className='flex flex-col items-start justify-center'>
//                 <h5 className='text-[17px] text-[#2b2e33] dark:text-[#E5E7EB] font-bold tracking-wide'>
//                   {getChatName(activeChat, activeUser)}
//                 </h5>
//                 <p className='text-[11px] text-[#aabac8]'>Online</p>
//               </div>
//             </div>
//           </div>

//           {/* Chat Body */}
//           <div className="bg-[url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')] dark:bg-[url('https://wallpapercave.com/wp/wp10254557.jpg')] scrollbar-hide w-[100%] h-[83vh] flex flex-col overflow-y-scroll p-4 pb-2">
//             <MessageHistory typing={isTyping} messages={messages} />
//             <div className='ml-7 -mb-10'>
//               {isTyping && <Typing width="100" height="100" />}
//             </div>
//           </div>

//           {/* Chat Input */}
//           <div className='absolute w-[100%] bottom-2'>
//             {showPicker && <Picker data={data} onEmojiSelect={(e) => setMessage(message + e.native)} />}
//             <div className='border-[1px] border-[#ecf2f5] dark:border-transparent px-6 py-3 h-[50px] flex justify-between items-start gap-4'>
//               <div className='cursor-pointer' onClick={() => setShowPicker(!showPicker)}>
//                 {showPicker ? (
//                   <BsFillEmojiSmileFill className='w-[20px] h-[20px] text-[#ffb02e]' />
//                 ) : (
//                   <BsEmojiSmile className='w-[20px] h-[20px]' />
//                 )}
//               </div>

//               <form className='w-[900px] px-3 dark:bg-zinc-600' onKeyDown={keyDownFunction} onSubmit={(e) => e.preventDefault()}>
//                 <input
//                   onChange={(e) => {
//                     setMessage(e.target.value);
//                     if (!socketConnected) return;
//                     if (!typing) {
//                       setTyping(true);
//                       socket.emit('typing', activeChat._id);
//                     }
//                     const lastTime = new Date().getTime();
//                     setTimeout(() => {
//                       const now = new Date().getTime();
//                       if (now - lastTime >= 3000 && typing) {
//                         socket.emit("stop typing", activeChat._id);
//                         setTyping(false);
//                       }
//                     }, 3000);
//                   }}
//                   className='focus:outline-0 w-full bg-[#f8f9fa] dark:bg-zinc-600'
//                   type="text"
//                   placeholder="Enter message"
//                   value={message}
//                 />
//               </form>

//               <button onClick={keyDownFunction} className='bg-[#f8f9fa] dark:bg-zinc-600 px-2 py-[3px] text-[#9e9e9e] -mt-1'>
//                 <IoSend className="text-xl" />
//               </button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className={props.className}>
//           <div className='relative'>
//             <div className='absolute top-[40vh] left-[44%] flex flex-col items-center justify-center gap-y-3'>
//               <img className='w-[50px] h-[50px] rounded-[25px]' alt="User profile" src={activeUser?.profilePic} />
//               <h3 className='text-[#111b21] text-[23px] font-medium tracking-wider'>
//                 Welcome <span className='text-[#166e48] dark:text-[#E5E7EB] text-[22px] font-bold'> {activeUser?.name}</span>
//               </h3>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default Chat;