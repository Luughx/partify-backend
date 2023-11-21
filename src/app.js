import express from "express"
import morgan from "morgan"
import serviciosRouter from "./routes/serviciosRouter.js"
import usersRouter from "./routes/usersRouter.js"

const app = express()

app.use(express.json())
app.use(morgan("dev"))
app.use("/api", serviciosRouter)
app.use("/api", usersRouter)

export default app