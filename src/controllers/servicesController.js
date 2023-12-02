import { pool } from "../config/database.js"
import { Storage } from "@google-cloud/storage"
import lodash from "lodash"
import jwt from "jsonwebtoken"
import { compressAndUpload } from "../functions/compressAndUpload.js"

export const getServices = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM services")

    res.json(rows)
}

export const postService = async (req, res) => {
    const { name, description, category, price } = req.body

    if (!req.session.token) return res.json({ "message": "Sesión no iniciada" })

    const calendary = {
        "fechas": [
            ["10-2-2023 14:30", "12-2-2023 14:30"], 
            ["14-2-2023 14:30", "14-2-2023 16:30"]
        ]
    }
    
    if (!name || !description || !category || !calendary || !price || !req.files) return res.json({ "message": "Datos invalidos" })

    const decoded = jwt.verify(req.session.token, `${process.env.SECRET}`)
    const [rowsSuppliers] = await pool.query("SELECT * FROM suppliers WHERE idUser=?", [decoded.id])

    if (rowsSuppliers.length == 0) return res.json({ "message": "Proveedor no encontrado" })

    const supplierIdEsc = lodash.escape(rowsSuppliers[0].id)
    const nameEsc = lodash.escape(name)
    const descriptionEsc = lodash.escape(description)
    const categoryEsc = lodash.escape(category)
    const calendaryEsc = lodash.escape(calendary)
    const priceEsc = lodash.escape(price)

    let UriThumbnail = ""
    let uriImages = {}

    if (req.files) {
        const projectId = process.env.GCLOUD_PROJECT_ID
        const keyFilename = process.env.GCLOUD_KEY
        const bucketName = process.env.GCLOUD_STORAGE_BUCKET_SERVICES
    
        const storage = new Storage({ projectId, keyFilename })
        const bucket = storage.bucket(bucketName)

        if (req.files.thumbnail) {
            UriThumbnail = await compressAndUpload(req.files.thumbnail[0].path, bucket, nameEsc)
        }
    
        if (req.files.image) {
            for (let i=0; i < req.files.image.length; i++) {
                const temporalUri = await compressAndUpload(req.files.image[i].path, bucket, nameEsc)
                uriImages[i]= temporalUri
            }
        }
    }

    const verified = false

    const [rows] = await pool.query("INSERT INTO services(idSupplier, thumbnailURI, name, description, images, category, calendary, price, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
    [parseInt(supplierIdEsc), UriThumbnail, nameEsc, descriptionEsc, JSON.stringify(uriImages), categoryEsc, JSON.stringify(calendary), parseFloat(priceEsc), verified])
    
    res.json({ "id": rows.insertId, idSupplier: supplierIdEsc, thumbnail: UriThumbnail, name: nameEsc, description: descriptionEsc, images: uriImages, category: categoryEsc, calendary, price })
}