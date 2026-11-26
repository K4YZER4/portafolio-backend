import fs from "fs";
import path from "path";

const dirs = ["logs", "uploads"];

dirs.forEach((dir) => {
  const dirPath = path.join(__dirname, "..", dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(` Carpeta creada: ${dir}/`);
  }
});
