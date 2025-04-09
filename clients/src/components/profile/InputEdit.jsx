import React, { useState } from 'react'
import { TbEdit } from "react-icons/tb"
import { BsCheck2 } from "react-icons/bs"
function InputEdit({ type, handleChange, input, handleSubmit }) {
  const [editable, setEditable] = useState(false)
  const submitButton = () => {
    handleSubmit()
    setEditable(false)
  }
  return (
    <>
      <div className='flex flex-col py-4 mt-4 bg-[#ffff] dark:bg-zinc-700  shadow-md px-4 gap-y-3'>
        <p className='text-[12px] text-[#166e48] dark:text-[#3cb07c] font-medium tracking-wide'>{type === 'name' ? 'Your Name' : 'About'}</p>
        {
          !editable
            ?
            <div className='flex justify-between items-center'>
              <p className='text-[14.5px] text-[#3b4a54] dark:text-[#E5E7EB]'>
                {input}
              </p>
              <button onClick={() => setEditable(!editable)}>
                <TbEdit className='w-[21px] h-[21px]' />
              </button>
            </div>
            : 
            <div className='flex items-center justify-between dark:bg-zinc-700'>
              <div>
                <input name={type} onChange={handleChange} className='text-[14.5px] text-[#3b4a54] dark:text-[#E5E7EB] dark:bg-zinc-700 outline-0' type="text" value={input} />
              </div>
              <div className='flex items-center gap-x-4'>
                <button onClick={submitButton}>
                  <BsCheck2 className='w-[21px] h-[21px]' />
                </button>
              </div>
            </div>

        }


      </div>
    </>
  )
}

export default InputEdit