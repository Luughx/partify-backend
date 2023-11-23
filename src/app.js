import express from "express"
import morgan from "morgan"
import servicesRouter from "./routes/servicesRouter.js"
import usersRouter from "./routes/usersRouter.js"
import dotenv from "dotenv"

dotenv.config()

const app = express()

app.use(express.json())
app.use(morgan("dev"))
app.use("/api", servicesRouter)
app.use("/api", usersRouter)

export default app