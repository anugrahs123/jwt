const express=require('express')
const app= new express()
const jwt=require('jsonwebtoken')
const https=require('https')
const http=require('http')
app.set('view engine','ejs')
app.set("views","./src/views")
app.use(express.json())
const post=[
    {
        username:"smith",
        title:"post 1"
    },
    {
        username:"arun",
        title:"post 2"
    }
]
let refreshTokens=[]
console.log(refreshTokens);
const authenticateToken=(req,res,next)=>{
    const authHeader=req.headers['authorization']
    const token= authHeader && authHeader.split(' ')[1]
    console.log("4",authHeader);
    console.log("5",token);
    if(token==null) return res.sendStatus(401) 
    
    jwt.verify(token,"key",(err,user)=>{
        if(err) return res.sendStatus(403)
        req.user=user
        console.log("6",user);
        next()
    })
}
const generateToken=(user)=>{
    return jwt.sign(user,"key",{expiresIn:'1m'})
}
app.get("/",(req,res)=>{
    res.render("index")
})
app.post("/token",(req,res)=>{
    let refreshToken=req.body.token;
    // var Headers:{
    //     new (init?:HeadersInit):Headers;
    //     protype:Headers;
    // }

    
    console.log("7",refreshToken);
    if(refreshToken==null) return req.sendStatus(401)
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken,"value",(err,user)=>{
        if(err) return req.sendStatus(403)
        const accessToken=generateToken({name:user.name})
        console.log("8",accessToken);
        res.json({accessToken:accessToken})
        console.log("10",refreshTokens);
    })
})
app.delete("/logout",(req,res)=>{
    console.log("10A",refreshTokens);
    refreshTokens=refreshTokens.filter((token)=>{token!==req.body.token})
    res.sendStatus(204)
    console.log("10",refreshTokens);
    res.redirect("/")

})
app.get("/posts",authenticateToken,(req,res)=>{
    // http.request("/token",headers,()=>{
    //     console.log(headers);
    // })
    let val=req.headers;
    console.log(val);
    res.json(post.filter(post=>post.username===req.user.name))
    console.log("10",refreshTokens);
})
app.get("/signup",(req,res)=>{
    res.render("signup")
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login",(req,res)=>{
    const username=req.body.username;
    const user={name:username}

    const accessToken=generateToken(user)
    const refreshToken=jwt.sign(user,"value")
    refreshTokens.push(refreshToken)
    let token3="Bearer"+' '+accessToken;
    
// Set request parameters
const options = {
    hostname: 'localhost',
    port: 8003,
    path: '/user',
    method: 'GET',
    headers: {
      'Authorization':token3,
      'Content-Type': 'application/json'
    }
  }
  const hit=http.request(options,res=>{
      console.log(`Status code:${res.statusCode}`);
      res.on('data',data=>{
          process.stdout.write(data)
          
      })
          })
  
  hit.on('error',error=>{
      console.log(error);
  })
  hit.end()
    //localStorage.setItem("token3",accessToken)
   res.json({accessToken:accessToken,refreshToken:refreshToken})
 //  res.header('auth',accessToken).json(accessToken)
  res.redirect("/user")
    console.log("1",username);
    console.log("2",user);
    console.log("3",accessToken);
    console.log("10",refreshTokens);
})
app.get("/user",(req,res)=>{
    res.render("user")
})
app.post("/user",authenticateToken,(req,res)=>{
    res.render("user")
})


app.listen(8003,()=>{
    console.log("http://localhost:8003");
})