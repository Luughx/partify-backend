import { pool } from "../config/database.js"
import lodash from "lodash"
import bycrypt from "bcryptjs";

export const getUsers = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM users")
    
    res.json(rows)
}

export const test = async (req, res) => {
    const compare = await bycrypt.compare("123", "$2a$10$DMmiBO/9yy39vQIZLKotSOQe6FgK2vhb9qf29NPIno8WSttUrC/mq")

    console.log(compare)

    res.json(true)
}

export const getUser = async (req, res) => {
    const { id } = req.params

    if (!id) return res.json({
        message: "Se requiere de un id"
    })

    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [id])
    
    res.json(rows)
}

export const postLogin = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) return res.json({
        "message": "Datos invalidos"
    }) 

    const [rows] = await pool.query("SELECT * FROM users WHERE email=?", [email])
    
    if (rows.length == 0) return res.json({
        "message": "Cuenta no encontrada"
    })

    const compare = await bycrypt.compare(password, rows[0].password)

    if (!compare) return res.json({
        "message": "La contraseña no es correcta"
    })
    
    res.json(true)
}

export const postSignup = async (req, res) => {
    const { name, lastName, email, phone, password, address } = req.body

    if (!name || !lastName || !email || !phone || !password) return res.json({
        "message": "Datos invalidos"
    })

    const nameEsc = lodash.escape(name)
    const lastNameEsc = lodash.escape(lastName)
    const emailEsc = lodash.escape(email)
    const phoneEsc = lodash.escape(phone)
    const passwordEsc = lodash.escape(password)

    const salt = await bycrypt.genSalt(10)
    const hash = await bycrypt.hash(passwordEsc, salt)

    const rol = "client"
    const verified = false

    const [rows] = await pool.query("INSERT INTO users(name, lastName, email, phone, address, rol, verified, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", 
    [name, lastName, email, phone, address, rol, verified, hash])
    
    res.json({ "id": rows.insertId, name: nameEsc, lastName: lastNameEsc, email: emailEsc, phone: phoneEsc, password: hash, address, rol, verified })
}