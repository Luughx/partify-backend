import express from "express"
import morgan from "morgan"
import servicesRouter from "./routes/servicesRouter.js"
import usersRouter from "./routes/usersRouter.js"
import suppliersRouter from "./routes/suppliersRoute.js"
import dotenv from "dotenv"
import session from "express-session";

dotenv.config()

const app = express()

app.use(session({
    secret: 'partify',
    resave: false,
    saveUninitialized: true
    //cookie: { secure: true }
  }))

app.use(express.json())
app.use(morgan("dev"))

// routes
app.use("/api", suppliersRouter)
app.use("/api", servicesRouter)
app.use("/api", usersRouter)

export default app