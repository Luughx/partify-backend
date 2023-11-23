import { pool } from "../config/database.js"
import { Storage } from "@google-cloud/storage"
import { format } from "util";
import lodash from "lodash";

export const getService = async (req, res) => {
    const [rows] = await pool.query("SELECT * FROM services")

    res.json(rows)
}

export const postService = async (req, res) => {
    const { idSupplier, name, description, category, price } = req.body

    const calendary = {
        "fechas": [
            ["10-2-2023 14:30", "12-2-2023 14:30"], 
            ["14-2-2023 14:30", "14-2-2023 16:30"]
        ]
        }
        
    if (!idSupplier || !name || !description || !category || !calendary || !price || !req.files) return res.json({
        "message": "Datos invalidos"
    })

    const supplierEsc = lodash.escape(idSupplier)
    const nameEsc = lodash.escape(name)
    const descriptionEsc = lodash.escape(description)
    const categoryEsc = lodash.escape(category)
    const calendaryEsc = lodash.escape(calendary)
    const priceEsc = lodash.escape(price)

    const projectId = process.env.GCLOUD_PROJECT_ID
    const keyFilename = process.env.GCLOUD_KEY
    const bucketName = process.env.GCLOUD_STORAGE_BUCKET

    const storage = new Storage({ projectId, keyFilename })
    const bucket = storage.bucket(bucketName)
    
    const thumbnailUpload = await bucket.upload(req.files.thumbnail[0].path, {destination: `${nameEsc}/${req.files.thumbnail[0].filename}`})
    const UriThumbnail = format(`https://storage.googleapis.com/${bucket.name}/${nameEsc}/${req.files.thumbnail[0].filename}`)
    
    let uriImages = {}

    for (let i=0; i < req.files.image.length; i++) {
        const temporalUpload = await bucket.upload(req.files.image[i].path, {destination: `${nameEsc}/${req.files.image[i].filename}`})
        const temporalUri = format(`https://storage.googleapis.com/${bucket.name}/${nameEsc}/${req.files.image[i].filename}`)
        uriImages[i]= temporalUri
    }
    
    console.log(uriImages)

    const verified = false

    const [rows] = await pool.query("INSERT INTO services(idSupplier, thumbnailURI, name, description, images, category, calendary, price, verified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
    [parseInt(idSupplier), UriThumbnail, name, description, "{}", category, JSON.stringify(calendary), parseFloat(price), verified])
    
    res.json(true)

}