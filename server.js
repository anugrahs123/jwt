const express=require('express')
const app= new express()
const jwt=require('jsonwebtoken')

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
let token=[];
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


app.get("/posts",authenticateToken,(req,res)=>{
    // http.request("/token",headers,()=>{
    //     console.log(headers);
    // })
    let val=req.headers;
    console.log(val);
    if(!token.includes(req.user.name)) return res.sendStatus(404)
    res.json(post.filter(post=>post.username===req.user.name))
})
app.post("/login",(req,res)=>{
    const username=req.body.username;
    const user={name:username}

    const accessToken=jwt.sign(user,"key")
    token.push(user.name)
    res.json({accessToken:accessToken})
    console.log("1",username);
    console.log("2",user);
    console.log("3",accessToken);
    // console.log("10",refreshTokens);
})
app.delete("/logout",(req,res)=>{
    token=token.filter((data)=>data!=req.body.token)
    res.sendStatus(204)

})


app.listen(8003,()=>{
    console.log("http://localhost:8003");
})