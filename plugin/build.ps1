$ErrorActionPreference = 'Stop'
if (-not (Test-Path '.env')) {
  Write-Host '缺少 .env。请复制 .env.example 为 .env，并填入自己的 PRI_KEY / PUB_KEY。' -ForegroundColor Yellow
  exit 1
}
npm install
npx @any-listen/extension-kit --build
