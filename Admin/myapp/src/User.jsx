import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
const User = () => {
  const navigate=useNavigate()
  
    const [form,setForm]=useState({
      name:"",
      email:"",
      phone:"",
      password:""
    })
    // console.log(form);
    
    const changeHandler=(e)=>{
      const{name,value}=e.target

      setForm({...form,
        [name]:value
      })
    }

    const submitHandler= async(e)=>{
e.preventDefault()
      const res=await axios.post("http://localhost:2002/register",form)

      if(res?.data?.status)
      {
        alert(res?.data?.message)
        navigate("/login")
      }
      else{
      alert(res?.data?.message)
      }
      
    }
  return (
    <div>
            <h1>register form</h1>
       <form onSubmit={submitHandler} className='block bg-green-600 border-2 gap-4'>
     
      <input type="text" name='name' placeholder='enter your name'  onChange={changeHandler}/><br />
      <input type="email" name='email'placeholder='enetr your email' onChange={changeHandler}/><br />
      <input type="text" name='phone' placeholder='enter you phone number' onChange={changeHandler} /><br />
      <input type="password" name='password' placeholder='enter your password' onChange={changeHandler}/><br />
      <input type="submit" value="register" />
      </form>

    </div>
  )
}

export default User
