const { Server } = require("ws")
const { v4 } = require("uuid")

console.log(`웹소켓 서버 실행 완료!`)

let clients = {}
let idlist = {}

const server = new Server({port:9090})

function broadcastall(message) {
    server.clients.forEach(client => {
        client.send(message)
    })
}

function broadcast(message,ws) {
    server.clients.forEach(client => {
        if (client !== ws) client.send(message)
    })
}

server.on("connection",(ws, req) => {
    const ip = req.headers['x-forwarded-for'] | req.socket.remoteAddress
    const socketid = v4()
    console.log(`새로운 클라이언트: ${ip}(id: ${socketid})`)

    ws.on("message",(message) => {
        const data = JSON.parse(message.toString("utf-8"))
        if (data.type == "join") {
            console.log(`입장한 플레이어: ${data.name}(${data.id}`)
            idlist[socketid] = {client:ws,id:data.id}
            clients[data.id] = {color:data.color,name:data.name}
            broadcastall(JSON.stringify({type:"join",clients}))
        }
        else if (data.type == "leave") {
            console.log(`퇴장한 플레이어: ${data.name}(${data.id}`)
            delete idlist[socketid]
            delete clients[data.id]
            broadcastall(JSON.stringify({type:"leave",clients}))
        }
        else if (data.type == "changecolor") {
            clients[data.id].color = data.color
            broadcastall(JSON.stringify(data))
        }
        else if (data.type == "changename") {
            clients[data.id].name = data.name
            broadcastall(JSON.stringify(data))
        }
        else if (data.type == "down") {
            broadcast(JSON.stringify(data),ws)
        }
        else if (data.type == "up") {
            broadcast(JSON.stringify(data),ws)
        }
    })

    ws.on("close",() => {
        console.log(`연결을 끊은 클라이언트: ${ip}(id: ${socketid})`)
        delete clients[idlist[socketid].id]
        delete idlist[socketid]
        broadcast(JSON.stringify({type:"leave",clients}))
    })
})

//     socket.on("down",(message) => {
//         socket.broadcast.emit("down",message)
//     })

//     socket.on("up",(message) => {
//         socket.broadcast.emit("up",message)
//     })