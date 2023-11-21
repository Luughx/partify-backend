import { pool } from "../config/database.js"

export const getUsers = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM users")
    
    res.json(rows)
}

export const getUser = async (req, res) => {
    const { id } = req.params

    if (!id) return res.json({
        message: "Se requiere de un id"
    })

    const [rows] = await pool.query("SELECT * FROM users WHERE id=?", [id])
    
    res.json(rows)
}

export const postUser = async (req, res) => {
    const { name, lastName, email, phone, address, rol, verified } = req.body
    
    const [rows] = await pool.query("INSERT INTO users (name, lastName, email, phone, address, rol, verified) VALUES (?, ?, ?, ?, ?, ?, ?)", 
    [name, lastName, email, phone, address, rol, verified])
    
    res.json({ "id": rows.insertId, name, lastName, email, phone, address, rol, verified })
}