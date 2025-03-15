const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
require("dotenv").config();

// Configuración de Cloudinary (usa tus credenciales)
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📌 Ruta para subir imágenes a Cloudinary
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se recibió ningún archivo" });
        }

        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { resource_type: "image" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            uploadStream.end(req.file.buffer);
        });

        let images = [];
        if (fs.existsSync("images.json")) {
            images = JSON.parse(fs.readFileSync("images.json", "utf8"));
        }

        images.push({ url: result.secure_url, public_id: result.public_id });
        fs.writeFileSync("images.json", JSON.stringify(images, null, 2), "utf8");

        res.json({ message: "Imagen subida correctamente", url: result.secure_url });
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        res.status(500).json({ error: "Error al subir la imagen" });
    }
});

// 📌 Ruta para obtener todas las imágenes almacenadas
app.get("/images", (req, res) => {
    if (!fs.existsSync("images.json")) {
        fs.writeFileSync("images.json", "[]");
    }
    const images = JSON.parse(fs.readFileSync("images.json", "utf8"));
    res.json(images);
});

// 📌 Ruta para eliminar una imagen de Cloudinary y del JSON
app.delete("/delete/:public_id", async (req, res) => {
    const { public_id } = req.params;

    try {
        await cloudinary.uploader.destroy(public_id);

        let images = JSON.parse(fs.readFileSync("images.json", "utf8"));
        images = images.filter(img => img.public_id !== public_id);
        fs.writeFileSync("images.json", JSON.stringify(images, null, 2), "utf8");

        res.json({ message: "Imagen eliminada correctamente" });
    } catch (error) {
        console.error("Error al eliminar la imagen:", error);
        res.status(500).json({ error: "Error al eliminar la imagen" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
