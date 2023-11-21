import { createPool, createConnection } from "mysql2"

export const connection = createPool({
    host: "localhost",
    user: "root",
    password: "admin",
    //port: 3306,
    database: "partify"
})

export const pool = connection.promise()