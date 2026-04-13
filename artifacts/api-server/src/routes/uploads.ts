import { Router, type IRouter } from "express";
import { requireAuth } from "../middlewares/require-auth";
import { requireAdmin } from "../middlewares/require-admin";
import { asyncHandler } from "../middlewares/async-handler";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const ALLOWED_MODEL_TYPES = [
  "model/gltf-binary", "model/gltf+json",
  "application/octet-stream",
  "application/json",
];
const ALLOWED_MODEL_EXTENSIONS = [".glb", ".gltf", ".obj", ".fbx", ".stl", ".3ds", ".dae"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;

router.post(
  "/admin/upload",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const contentType = req.headers["content-type"] || "";

    if (!contentType.includes("application/json")) {
      res.status(400).json({ error: "Expected JSON body with base64-encoded file data", status: 400 });
      return;
    }

    const { fileName, fileData, fileType, uploadType } = req.body;

    if (!fileName || !fileData || !uploadType) {
      res.status(400).json({
        error: "fileName, fileData (base64), and uploadType ('image' or 'model') are required",
        status: 400,
      });
      return;
    }

    const ext = path.extname(fileName).toLowerCase();
    const mimeType = fileType || "application/octet-stream";

    if (uploadType === "image") {
      if (!ALLOWED_IMAGE_TYPES.includes(mimeType) && ![".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
        res.status(400).json({ error: "Unsupported image format. Use JPEG, PNG, WebP, GIF, or SVG.", status: 400 });
        return;
      }
    } else if (uploadType === "model") {
      if (!ALLOWED_MODEL_TYPES.includes(mimeType) && !ALLOWED_MODEL_EXTENSIONS.includes(ext)) {
        res.status(400).json({
          error: "Unsupported 3D model format. Use GLB, GLTF, OBJ, FBX, STL, 3DS, or DAE.",
          status: 400,
        });
        return;
      }
    } else {
      res.status(400).json({ error: "uploadType must be 'image' or 'model'", status: 400 });
      return;
    }

    const buffer = Buffer.from(fileData, "base64");

    if (buffer.length > MAX_FILE_SIZE) {
      res.status(400).json({ error: "File exceeds maximum size of 20MB", status: 400 });
      return;
    }

    ensureUploadDir();

    const uniqueName = `${randomUUID().slice(0, 12)}${ext}`;
    const subDir = uploadType === "image" ? "images" : "models";
    const targetDir = path.join(UPLOAD_DIR, subDir);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    const url = `/api/uploads/${subDir}/${uniqueName}`;

    res.status(201).json({
      url,
      fileName: uniqueName,
      originalName: fileName,
      size: buffer.length,
      type: uploadType,
    });
  }),
);

router.get(
  "/uploads/:subDir/:fileName",
  asyncHandler(async (req, res) => {
    const subDir = String(req.params.subDir);
    const fileName = String(req.params.fileName);

    if (!["images", "models"].includes(subDir)) {
      res.status(404).json({ error: "Not found", status: 404 });
      return;
    }

    const safeName = path.basename(fileName);
    const filePath = path.join(UPLOAD_DIR, subDir, safeName);

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "File not found", status: 404 });
      return;
    }

    const ext = path.extname(safeName).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
      ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml",
      ".glb": "model/gltf-binary", ".gltf": "model/gltf+json",
      ".obj": "text/plain", ".fbx": "application/octet-stream",
      ".stl": "application/octet-stream", ".3ds": "application/octet-stream",
      ".dae": "application/xml",
    };

    const mime = mimeMap[ext] || "application/octet-stream";
    res.setHeader("Content-Type", mime);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.sendFile(filePath);
  }),
);

export default router;
