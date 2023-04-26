const { Server } = require("socket.io")

const io = new Server({cors:{origin:"*"}})

console.log(`웹소켓 서버 실행 완료!`)

let clients = {}

io.on("connection",(socket) => {
    console.log(`새로운 클라이언트: ${socket.id}`)

    socket.on("join",(message) => {
        console.log(`새로운 플레이어: ${message.name}(${message.id})`)
        clients[message.id] = {name:message.name,color:message.color}
        io.emit("join",clients)
    })

    socket.on("leave",(message) => {
        console.log(`퇴장한 플레이어: ${message.name}(${message.id})`)
        delete clients[message.id]
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
})

io.listen(80)