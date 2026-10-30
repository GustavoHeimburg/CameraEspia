
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

const allowedOrigins = (
    process.env.FRONTEND_URL || "http://localhost:3000"
).split(",");

app.use(cors({ origin: allowedOrigins }));

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
});

const rooms = new Map();

app.get("/", (req, res) => {
    res.json({
        name: "CamConnect Signaling Server",
        status: "online",
        rooms: rooms.size,
    });
});

io.on("connection", (socket) => {
    console.log("Cliente conectado:", socket.id);

    // Criar sala privada
    socket.on("room:create", ({ roomId, ownerToken }, callback) => {
        if (
            typeof roomId !== "string" ||
            typeof ownerToken !== "string" ||
            roomId.length < 20 ||
            ownerToken.length < 32
        ) {
            return callback?.({ ok: false, error: "Dados inválidos." });
        }

        if (rooms.has(roomId)) {
            return callback?.({ ok: false, error: "Sala já existe." });
        }

        rooms.set(roomId, {
            ownerToken,
            adminSocketId: socket.id,
            cameraSocketId: null,
        });

        socket.join(roomId);

        callback?.({ ok: true });
        console.log("Sala criada:", roomId);
    });

    // Administrador entra em uma sala existente
    socket.on("admin:join", ({ roomId, ownerToken }, callback) => {
        const room = rooms.get(roomId);

        if (!room || room.ownerToken !== ownerToken) {
            return callback?.({ ok: false, error: "Acesso não autorizado." });
        }

        const previousAdmin = room.adminSocketId;

        room.adminSocketId = socket.id;
        socket.join(roomId);

        if (previousAdmin && previousAdmin !== socket.id) {
            io.sockets.sockets.get(previousAdmin)?.disconnect(true);
        }

        callback?.({ ok: true });
    });

    // Celular entra após autorizar a câmera
    socket.on("camera:join", ({ roomId }, callback) => {
        const room = rooms.get(roomId);

        if (!room || !room.adminSocketId) {
            return callback?.({ ok: false, error: "Sala indisponível." });
        }

        if (room.cameraSocketId && room.cameraSocketId !== socket.id) {
            return callback?.({ ok: false, error: "Sala já possui uma câmera." });
        }

        room.cameraSocketId = socket.id;
        socket.join(roomId);

        io.to(room.adminSocketId).emit("camera:waiting", { roomId });

        callback?.({ ok: true });
        console.log("Câmera conectada à sala:", roomId);
    });

    // Administrador envia oferta WebRTC
    socket.on("webrtc:offer", ({ roomId, offer }) => {
        const room = rooms.get(roomId);

        if (room?.adminSocketId !== socket.id || !room.cameraSocketId) return;

        io.to(room.cameraSocketId).emit("webrtc:offer", { offer });
    });

    // Celular responde à oferta
    socket.on("webrtc:answer", ({ roomId, answer }) => {
        const room = rooms.get(roomId);

        if (room?.cameraSocketId !== socket.id || !room.adminSocketId) return;

        io.to(room.adminSocketId).emit("webrtc:answer", { answer });
    });

    // Troca de candidatos ICE
    socket.on("webrtc:ice", ({ roomId, candidate }) => {
        const room = rooms.get(roomId);
        if (!room) return;

        if (socket.id === room.adminSocketId && room.cameraSocketId) {
            io.to(room.cameraSocketId).emit("webrtc:ice", { candidate });
        } else if (socket.id === room.cameraSocketId && room.adminSocketId) {
            io.to(room.adminSocketId).emit("webrtc:ice", { candidate });
        }
    });

    socket.on("disconnect", () => {
        for (const [roomId, room] of rooms.entries()) {
            if (room.adminSocketId === socket.id) {
                if (room.cameraSocketId) {
                    io.to(room.cameraSocketId).emit("room:closed");
                }

                rooms.delete(roomId);
                console.log("Sala encerrada:", roomId);
            } else if (room.cameraSocketId === socket.id) {
                room.cameraSocketId = null;

                if (room.adminSocketId) {
                    io.to(room.adminSocketId).emit("camera:disconnected");
                }

                console.log("Câmera desconectada:", roomId);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`CamConnect Server rodando na porta ${PORT}`);
});
