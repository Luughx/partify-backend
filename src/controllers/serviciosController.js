import { pool } from "../config/database.js"

export const getServicios = async (req, res) => {
    res.json({
        "message": "ola uwu"
    })
}

export const postServicio = async (req, res) => {
    console.log(req.body)
    const { name } = req.body
    
    res.json(true)
}