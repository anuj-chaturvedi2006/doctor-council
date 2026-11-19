import axios from 'axios'
import React, { useState } from 'react'

const View = () => {
    // const [studentd,setStudentd]=useState(null)
    const id=
    console.log("student data=>",studentd);
    
    const viewstudent=async()=>{
        const res=await axios.get(`https://doctor-council.onrender.com/get-user/:${id}`)
    }
  return (
    <div>


      
    </div>
  )
}

export default View
