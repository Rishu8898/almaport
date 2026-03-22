# ============================================
# AlumniVerification Contract Deployment Script
# ============================================
# This script deploys the AlumniVerification contract to Polygon Amoy testnet
# Usage: .\deploy.ps1
# Or with custom institution name: .\deploy.ps1 -InstitutionName "Your College Name"

param(
    [string]$InstitutionName = "NITJ",
    [string]$Network = "amoy"
)

# ============================================
# Configuration
# ============================================

$RpcUrl = "https://polygon-amoy.gateway.tenderly.co"
$ChainId = "80002"
$ContractPath = "src/AlumniVerification.sol:AlumniVerification"

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

# ============================================
# Functions
# ============================================

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "$Blue════════════════════════════════════════$Reset"
    Write-Host "$Blue$Message$Reset"
    Write-Host "$Blue════════════════════════════════════════$Reset"
}

function Write-Success {
    param([string]$Message)
    Write-Host "$Green✓ $Message$Reset" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "$Red✗ $Message$Reset" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "$Yellow⚠ $Message$Reset" -ForegroundColor Yellow
}

function Write-Info {
    param([string]$Message)
    Write-Host "$Blue→ $Message$Reset" -ForegroundColor Cyan
}

# ============================================
# Pre-flight Checks
# ============================================

Write-Header "Pre-Flight Checks"

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Error-Custom ".env file not found!"
    Write-Info "Please create a .env file with PRIVATE_KEY variable"
    exit 1
}
Write-Success ".env file found"

# Check if forge is installed
if (!(Get-Command forge -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "Forge is not installed or not in PATH"
    Write-Info "Install Foundry from: https://book.getfoundry.sh/"
    exit 1
}
Write-Success "Forge is installed"

# Check if contract file exists
if (!(Test-Path "src/AlumniVerification.sol")) {
    Write-Error-Custom "AlumniVerification.sol not found at src/AlumniVerification.sol"
    exit 1
}
Write-Success "Contract file found"

# ============================================
# Load Environment Variables
# ============================================

Write-Header "Loading Configuration"

# Load .env file
$envContent = Get-Content ".env" -Raw
$envContent -split "`n" | ForEach-Object {
    if ($_ -match "^\s*([^#=]+)=(.*)") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        # Remove quotes if present
        $value = $value -replace '^["]|["]$', ''
        Set-Item -Path "env:$key" -Value $value
    }
}

if (-not $env:PRIVATE_KEY) {
    Write-Error-Custom "PRIVATE_KEY not found in .env file"
    exit 1
}
Write-Success "PRIVATE_KEY loaded"

Write-Info "Institution Name: $InstitutionName"
Write-Info "Network: $Network"
Write-Info "Chain ID: $ChainId"
Write-Info "RPC URL: $RpcUrl"
Write-Info "Contract: $ContractPath"

# ============================================
# Build Contract
# ============================================

Write-Header "Building Contract"

Write-Info "Running: forge build"
forge build

if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Contract build failed!"
    exit 1
}
Write-Success "Contract built successfully"

# ============================================
# Deploy Contract
# ============================================

Write-Header "Deploying Contract to Polygon Amoy"

Write-Info "Running deployment script..."
Write-Info "This may take 1-2 minutes..."

$env:INSTITUTION_NAME = $InstitutionName
$deployOutput = & forge script script/DeployAlumniVerification.s.sol `
    --rpc-url $RpcUrl `
    --private-key $env:PRIVATE_KEY `
    --broadcast `
    --chain-id $ChainId 2>&1

Write-Output $deployOutput

# Check deployment result
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Deployment failed!"
    Write-Error-Custom "Exit Code: $LASTEXITCODE"
    exit 1
}

# Extract contract address from output
$contractAddress = $deployOutput | Select-String "Contract Address:" | ForEach-Object {
    $_.ToString() -replace ".*Contract Address:\s+", ""
}

if ($contractAddress) {
    Write-Success "Deployment completed!"
    Write-Header "Deployment Summary"
    Write-Info "Contract Address: $contractAddress"
    Write-Info "Institution: $InstitutionName"
    Write-Info "Network: Polygon Amoy Testnet"
    Write-Info "Chain ID: $ChainId"
} else {
    Write-Warning "Could not extract contract address from deployment output"
    Write-Info "Please check the deployment output above for the contract address"
}

# ============================================
# Save Deployment Info
# ============================================

Write-Header "Saving Deployment Info"

$deploymentInfo = @{
    contractAddress = $contractAddress
    institutionName = $InstitutionName
    network = $Network
    chainId = $ChainId
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    deployer = $env:PRIVATE_KEY.Substring(0, 4) + "..." + $env:PRIVATE_KEY.Substring(-4)
}

$deploymentInfo | ConvertTo-Json | Out-File "deployment-info.json"
Write-Success "Deployment info saved to deployment-info.json"

# ============================================
# Update Frontend .env
# ============================================

Write-Header "Next Steps"

Write-Info "1. Update Frontend .env file:"
Write-Info "   Add this line to FrontEnd/.env:"
Write-Host "   $Green   VITE_CONTRACT_ADDRESS=$contractAddress$Reset"

Write-Info "2. Authorize your wallet as an issuer (if deployer is not the issuer):"
Write-Info "   Run this command with owner wallet:"
Write-Host "   $Green   forge script script/AuthorizeIssuer.s.sol --rpc-url $RpcUrl --private-key <OWNER_PRIVATE_KEY> --broadcast$Reset"

Write-Info "3. Start the frontend:"
Write-Host "   $Green   cd ../FrontEnd && npm run dev$Reset"

Write-Host ""
Write-Success "Deployment completed successfully!"
Write-Host ""
