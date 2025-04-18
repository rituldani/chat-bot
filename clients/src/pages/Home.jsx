import React, { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { searchUsers, validUser } from '../apis/auth'
import { setActiveUser } from '../redux/activeUserSlice'
import { BsSearch } from "react-icons/bs"
import { IoIosArrowDown } from "react-icons/io"
import {  setShowProfile } from '../redux/profileSlice'
import Chat from './Chat' 
import Profile from "../components/Profile"
import { acessCreate } from "../apis/chat.js"
import "./home.css"
import { fetchChats } from '../redux/chatsSlice' 
import Group from '../components/Group'
import Contacts from '../components/Contacts'
import Search from '../components/group/Search'

function Home() {
  const dispatch = useDispatch()
  const { showProfile } = useSelector((state) => state.profile)
  const { activeUser } = useSelector((state) => state)
  const [searchResults, setSearchResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [loadingUser,setLoadingUser] = useState(false)

  const handleSearch = async (e) => {
    setSearch(e.target.value)
  }
  const handleClick = async (e) => {
    await acessCreate({ userId: e._id })
    dispatch(fetchChats())
    setSearch("")
  }
  
  useEffect(() => {
  console.log("Active user in Home:", activeUser);
}, [activeUser]);

  useEffect(() => {
    const searchChange = async () => {
      if (!search.trim()) return; // ⛔ Prevent hitting the API with empty search
  
      try {
        const res = await searchUsers(search);
        const users = res?.data || [];
        setSearchResults(users);
      } catch (err) {
        console.error("Error in searchChange:", err);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    searchChange();
  }, [search]);
  
  
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      setLoadingUser(false); // No token, nothing to load
      return;
    }

    const isValid = async () => {
      try {
        const data = await validUser();
        console.log("✅ validUser data:", data);
    
        if (data?.user) {
          dispatch(setActiveUser({
            id: data.user._id,
            email: data.user.email,
            profilePic: data.user.profilePic,
            bio: data.user.bio,
            name: data.user.name
          }));
        } else {
          console.warn("⚠️ No user returned from /auth/valid");
        }
      } catch (err) {
        console.error("💥 validUser failed:", err);
      } finally {
        setLoadingUser(false);
      }
    };    
  
    isValid();
  }, [dispatch]);
  
  if (loadingUser || !activeUser) {
    console.log("Still loading or user not found");
    return (
      <div className="text-black text-center mt-10">Loading user...</div>
    );
  }


  return (
    <>
      <div className="bg-[#282C35] scrollbar-hide z-10 h-[100vh]  lg:w-[90%] lg:mx-auto overflow-y-hidden shadow-2xl">
        <div className='flex'>
          {
            !showProfile 
            ?
              <div className="md:flex md:flex-col min-w-[360px] h-[100vh] bg-[#ffff] dark:bg-zinc-700 relative">

                <div className='h-[61px] px-4'>
                  <div className='flex'>
                    <a className='flex items-center relative -top-4 h-[90px]' href='/'>
                      <h3 className='text-[20px] text-[#1f2228] dark:text-[#E5E7EB] font-body font-extrabold tracking-wider'>Messages</h3>
                    </a>
                  </div>
                  <div className='absolute top-4 right-5 flex items-center gap-x-3'>
                    <button onClick={() => dispatch(setShowProfile(true))} className='flex items-center gap-x-1 relative'>
                      <img className='w-[28px] h-[28px] rounded-[25px]' src={activeUser?.profilePic} alt="" />
                      <IoIosArrowDown style={{ color: "#616c76", height: "14px", width: "14px" }} />
                    </button>
                  </div>
                </div>

                <div>
                  <div className='-mt-6 relative pt-6 px-4'>
                    <form onSubmit={(e) => e.preventDefault()}>
                      <input onChange={handleSearch} className='w-[99.5%] bg-[#f6f6f6] dark:bg-zinc-800 text-[#111b21] dark:text-[#E5E7EB] tracking-wider pl-9  py-[8px] rounded-[9px] outline-0' type="text" name="search" placeholder="Search" />
                      <div className='absolute top-[36px] left-[27px]'>
                        <BsSearch style={{ color: "#c4c4c5" }} />
                      </div>
                      
                    </form>
                    
                    <Group />

                    <div style={{ display: search ? "" : "none" }} className='h-[100vh] absolute z-10 w-[100%] left-[0px] top-[70px] bg-[#fff] dark:bg-zinc-700 flex flex-col gap-y-3 pt-3 px-4'>
                      <Search searchResults={searchResults} isLoading={isLoading} handleClick={handleClick} search={search} />
                    </div>
                  </div>

                  <Contacts />

                </div>

              </div> 
            :
            <Profile className="min-w-[100%] sm:min-w-[360px] h-[100vh] bg-[#fafafa] dark:bg-zinc-700 shodow-xl relative" />
          }

          <Chat className="chat-page relative lg:w-[100%] h-[100vh] bg-[#fafafa] dark:bg-zinc-600" />
          {/* <div className="chat-page relative lg:w-[100%] h-[100vh] bg-[#fafafa] dark:bg-zinc-600"><Chat/></div> */}
        </div>
      </div >

    </>
  )
}

export default Home