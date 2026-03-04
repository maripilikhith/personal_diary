$ErrorActionPreference = "Stop"

Set-Location "d:\ANTIGRAVITY PROJECTS\DAIRY\personal-memory-diary\backend"
npm i express cors dotenv firebase-admin multer
npm i -D nodemon

Set-Location "d:\ANTIGRAVITY PROJECTS\DAIRY\personal-memory-diary"
npx -y create-vite@latest frontend --template react
Set-Location "frontend"
npm install
npm i react-router-dom axios firebase lucide-react
