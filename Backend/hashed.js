const bcrypt=require("bcrypt")

const password="consellor@123"

const hash=async ()=>{
     const compare= await bcrypt.hash("consellor@123",9)
     console.log(compare)
}

hash()


// const compare=bcrypt.compare("consellor@123","$2b$09$CSzua6SsJddaF/iYG5auruCt3swsAJNhO7C.sIBryubYxWSHO51ze")

