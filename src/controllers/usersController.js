import { pool } from "../config/database.js"
import lodash from "lodash"
import bycrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getUsers = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM users")
    
    res.json(rows)
}

export const test = async (req, res) => {
   
    console.log(req.files)

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

    if (req.session.token) return res.json({
        "message": "Sesión ya iniciada"
    })

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

    const token = jwt.sign({
        id: rows[0].id,
        rol: rows[0].rol
    }, `${process.env.SECRET}`, {
        expiresIn:"30d"
    })

    req.session.token = token
    
    res.json(true)
}

export const postSignup = async (req, res) => {
    const { name, lastName, email, phone, password, address } = req.body

    if (req.session.token) return res.json({
        "message": "Sesión ya iniciada"
    })

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