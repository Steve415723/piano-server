const app = require("express")()
const http = require('http').createServer(app);
const io = require("socket.io")(http,{
    cors: {
        origin: "*"
    }
})

console.log(`웹소켓 서버 실행 완료!`)

let clients = {}
let idlist = {}

io.on("connection",(socket) => {
    console.log(`새로운 클라이언트: ${socket.id}`)

    socket.on("join",(message) => {
        console.log(`새로운 플레이어: ${message.name}(${message.id})`)
        clients[message.id] = {name:message.name,color:message.color}
        idlist[socket.id] = message.id
        io.emit("join",clients)
    })

    socket.on("leave",(message) => {
        console.log(`퇴장한 플레이어: ${message.name}(${message.id})`)
        delete clients[message.id]
        delete idlist[socket.id]
        io.emit("leave",clients)
    })

    socket.on("changecolor",(message) => {
        clients[message.id].color = message.color
        io.emit("changecolor",message)
    })

    socket.on("changename",(message) => {
        clients[message.id].name = message.name
        io.emit("changename",message)
    })

    socket.on("down",(message) => {
        socket.broadcast.emit("down",message)
    })

    socket.on("up",(message) => {
        socket.broadcast.emit("up",message)
    })

    socket.on("disconnect",() => {
        console.log(`연결을 끊은 클라이언트: ${socket.id}(${idlist[socket.id]})`)
        delete clients[idlist[socket.id]]
        delete idlist[socket.id]
        io.emit("leave",clients)
    })
})

io.listen(80)