import { io } from "socket.io-client"
import { useEffect } from "react"

export const socket = io("http://localhost:4000")

useEffect(() => {

  socket.on("connect", () => {
    console.log("Connected:", socket.id)

    socket.emit("join_game", {
      gameId: "test_game"
    })

  })

}, [])