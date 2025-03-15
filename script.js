
document.getElementById("uploadButton").addEventListener("click", async () => {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Selecciona una imagen primero");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        if (data.imageUrl) {
            const uploadedImage = document.getElementById("uploadedImage");
            uploadedImage.src = data.imageUrl;
            uploadedImage.style.display = "block";
        } else {
            alert("Error al subir la imagen");
        }
    } catch (error) {
        console.error("Error:", error);
    }
});



