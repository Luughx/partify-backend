import dotenv from "dotenv"
dotenv.config()
import express from "express"
import morgan from "morgan"
import session from "express-session"
import mysqlStore from "express-mysql-session"
import cors from "cors"

import servicesRouter from "./routes/servicesRouter.js"
import usersRouter from "./routes/usersRouter.js"
import suppliersRouter from "./routes/suppliersRoute.js"
import ordersRouter from "./routes/ordersRouter.js"
import indexRouter from "./routes/indexRouter.js"

import { pool } from "./config/database.js"

const app = express()

app.set("trust proxy", 1)

const MySQLStore = mysqlStore(session)

//const connection = mysql.createConnection(options)
const sessionStore = new MySQLStore({
    clearExpired: true,
	checkExpirationInterval: 900000,
	expiration: 86400000,
	createDatabaseTable: true
}, pool)

app.use(session({
    //name: "token",
    secret: 'partify',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,  
        httpOnly: true,
        signed: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 7,
        //sameSite: "strict"
    },
    //cookie: { secure: true }
}))

app.use(morgan("dev"))

app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    exposedHeaders: ["set-cookie"]
}))

app.use(express.json())

// routes
app.use("/api", indexRouter)
app.use("/api", suppliersRouter)
app.use("/api", servicesRouter)
app.use("/api", usersRouter)
app.use("/api", ordersRouter)

export default app