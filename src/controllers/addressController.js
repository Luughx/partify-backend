import { pool } from "../config/database.js"
import { Storage } from "@google-cloud/storage"
import { format } from "util"
import lodash from "lodash"
import jwt from "jsonwebtoken"

export const insertAddress = async (idUser, name, lastName, phone, street, colony, city, state, country, postalCode, res) => {
    if (!name || !lastName || !phone || !street || !colony || !city || !state || !country || !postalCode) return res.json({ "message": "Falta información para la dirección" })

    const [rows] = await pool.query("INSERT INTO address(idUser, name, lastName, phone, street, colony, city, state, country, postalCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
    [idUser, lodash.escape(name), lodash.escape(lastName), parseInt(lodash.escape(phone)), lodash.escape(street), lodash.escape(colony), lodash.escape(city), lodash.escape(state), lodash.escape(country), parseInt(lodash.escape(postalCode))])
    
    return rows
}

export const postAddressUser = async (req, res) => {
    const { name, lastName, phone, street, colony, city, state, country, postalCode } = req.body

    if (!req.session.token) return res.json({ "message": "Sesión no iniciada" })
    
    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)

    const rows = await insertAddress(decoded.id, lodash.escape(name), lodash.escape(lastName), parseInt(lodash.escape(phone)), lodash.escape(street), lodash.escape(colony), lodash.escape(city), lodash.escape(state), lodash.escape(country), parseInt(lodash.escape(postalCode)), res)

    res.json(rows)
}

export const getAddressUser = async (req, res) => {
    if (!req.session.token) return res.json({ "message": "Sesión no iniciada" })

    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)
    const [rows] = await pool.query("SELECT * FROM address WHERE idUser=?", [decoded.id])

    res.json(rows)
}
