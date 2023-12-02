import { pool } from "../config/database.js"
import { Storage } from "@google-cloud/storage"
import { format } from "util"
import lodash from "lodash"
import jwt from "jsonwebtoken"

const sum = (array) => {
    let temporalSum = 0

    for (let i=0; i < array.length; i++) {
        temporalSum += array[i].price
    }

    return temporalSum
}

export const postOrder = async (req, res) => {
    const { idAddress, category, services, initialDate, finalDate, price } = req.body

    if (!req.session.token) return res.json({ "message": "Sesión no iniciada" })

    if (!idAddress || !category || !services || !initialDate || !finalDate || !price) return res.json({ "message": "Falta información" })

    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)
    const [rowsVerified] = await pool.query("SELECT * FROM carts WHERE idUser=?", [decoded.id])

    if (rowsVerified.length == 0) 
        await pool.query("INSERT INTO carts(idUser, services, price) VALUES (?, ?, ?)", [decoded.id, "{}", 0])
    
    const [rows] = await pool.query("INSERT INTO orders(idUser, idAddress, category, services, initialDate, finalDate, price, state) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
    [decoded.id, parseInt(idAddress), lodash.escape(category), JSON.stringify(services), lodash.escape(initialDate), lodash.escape(finalDate), parseFloat(price), 1])

    res.json({
        id: rows.insertId,
        idUser: decoded.id, 
        idAddress, 
        category, 
        services, 
        initialDate, 
        finalDate, 
        price,
        state: 1
    })
}

export const patchCart = async (req, res) => {
    const { services } = req.body

    if (!req.session.token) return res.json({ "message": "Sesión no iniciada" })

    if (!services) return res.json({ "message": "Falta información" })

    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)
    const [rowsVerified] = await pool.query("SELECT * FROM carts WHERE idUser=?", [decoded.id])

    if (rowsVerified.length == 0) {
        await pool.query("INSERT INTO carts(idUser, services, price) VALUES (?, ?, ?)", [decoded.id, "{}", 0])
    }

    const total = services.salon.price + sum(services.comida)

    const [rows] = await pool.query("UPDATE carts SET services=?, price=? WHERE idUser=?", 
    [JSON.stringify(services), parseFloat(total), decoded.id])

    res.json(rows)
}

export const getCart = async (req, res) => {

    console.log(req.sessionID)
    if (!req.session.token) return res.json({ "message": "Sesión no iniciada" })

    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)
    const [rowsVerified] = await pool.query("SELECT * FROM carts WHERE idUser=?", [decoded.id])

    if (rowsVerified.length == 0) 
        await pool.query("INSERT INTO carts(idUser, services, price) VALUES (?, ?, ?)", [decoded.id, "{}", 0])
    

    const [rows] = await pool.query("SELECT * FROM carts WHERE idUser=?", [decoded.id])

    res.json(rows[0])
}
