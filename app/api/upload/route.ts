import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import fs from "fs"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const POST = async (req, res) => {

    const formData = await req.formData();
    const files = formData.getAll("files").filter(f => f instanceof File) as File[];
    const folderName = formData.get("folder") || "";

    const imageFiles = files.filter(file => ALLOWED_IMAGE_TYPES.includes(file.type));

    if (imageFiles.length === 0) {
        return NextResponse.json({ error: "No valid image files received." }, { status: 400 });
    }

    try {
        const uploadPath = path.join(process.env.BASE_UPLOAD_DIR, folderName);
        fs.mkdirSync(uploadPath, { recursive: true });

        for (const file of imageFiles) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const filename = Date.now() + file.name.replaceAll(" ", "_");

            await writeFile(path.join(uploadPath, filename), buffer);
        }
        return NextResponse.json({ Message: "Success", status: 201 });

    } catch (error) {
        console.error("Error occurred", error);
        return NextResponse.json({ Message: "Failed", status: 500 });
    }

};