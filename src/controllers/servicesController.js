import { pool } from "../config/database.js"
import { Storage } from "@google-cloud/storage"
import { format } from "util";

export const getService = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM services")

    res.json(rows)
}

export const postService = async (req, res) => {
    const { idSupplier, name, description, images, category, price } = req.body

    const calendary = {
        "fechas": [
            ["10-2-2023 14:30", "12-2-2023 14:30"], 
            ["14-2-2023 14:30", "14-2-2023 16:30"]
        ]
        }
        
    if (!idSupplier || !name || !description || !category || !calendary || !price || !req.file) return res.json({
        "message": "Datos invalidos"
    })

    const projectId = process.env.GCLOUD_PROJECT_ID
    const keyFilename = process.env.GCLOUD_KEY
    const bucketName = process.env.GCLOUD_STORAGE_BUCKET

    const storage = new Storage({ projectId, keyFilename })

    const bucket = storage.bucket(bucketName)

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
        resumable: false,
    })

    blobStream.on('error', err => {
        console.log(err)
    })

    blobStream.on('finish', async () => {
        const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`)
        const verified = false

        const [rows] = await pool.query("INSERT INTO services(idSupplier, thumbnailURI, name, description, images, category, calendary, price, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
        [parseInt(idSupplier), publicUrl, name, description, images, category, JSON.stringify(calendary), parseFloat(price), verified])
        
        res.json(true)
    })
    
    blobStream.end(req.file.buffer);


}