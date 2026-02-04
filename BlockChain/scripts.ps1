# Alumni Verification - PowerShell Helper Scripts
# Run from BlockChain directory

# Load environment variables from .env file
function Load-Env {
    if (Test-Path .env) {
        Get-Content .env | ForEach-Object {
            if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                Set-Item -Path "env:$name" -Value $value
            }
        }
        Write-Host "✅ Environment variables loaded" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env file not found. Copy env.example to .env (or set env vars manually)" -ForegroundColor Yellow
    }
}

# ============================================
# COMPILATION & TESTING
# ============================================

function Build-Contracts {
    Write-Host "🔨 Building contracts..." -ForegroundColor Cyan
    forge build
}

function Test-Contracts {
    param(
        [string]$Verbosity = "",
        [string]$TestName = ""
    )
    
    Write-Host "🧪 Running tests..." -ForegroundColor Cyan
    
    if ($TestName) {
        forge test --match-test $TestName -vvvv
    } elseif ($Verbosity) {
        forge test $Verbosity
    } else {
        forge test
    }
}

function Get-Coverage {
    Write-Host "📊 Checking test coverage..." -ForegroundColor Cyan
    forge coverage
}

function Format-Code {
    Write-Host "✨ Formatting code..." -ForegroundColor Cyan
    forge fmt
}

function Clean-Build {
    Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Cyan
    forge clean
    forge build
}

# ============================================
# DEPLOYMENT
# ============================================

function Deploy-Mumbai {
    Load-Env
    
    Write-Host "🚀 Deploying to Mumbai Testnet..." -ForegroundColor Cyan
    Write-Host "Network: Mumbai (Chain ID: 80001)" -ForegroundColor Yellow
    
    forge script script/DeployAlumniVerification.s.sol:DeployAlumniVerification `
        --rpc-url $env:POLYGON_MUMBAI_RPC_URL `
        --broadcast `
        -vvvv
}

function Deploy-Polygon {
    Load-Env
    
    Write-Host "⚠️  DEPLOYING TO MAINNET - This will cost real MATIC!" -ForegroundColor Red
    $confirm = Read-Host "Type 'YES' to confirm"
    
    if ($confirm -eq "YES") {
        forge script script/DeployAlumniVerification.s.sol:DeployAlumniVerification `
            --rpc-url $env:POLYGON_MAINNET_RPC_URL `
            --broadcast `
            --verify `
            -vvvv
    } else {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    }
}

function Test-Deployment {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ContractAddress
    )
    
    Load-Env
    
    Write-Host "🧪 Testing deployment with sample data..." -ForegroundColor Cyan
    
    forge script script/DeployAlumniVerification.s.sol:TestAlumniVerification `
        --rpc-url $env:POLYGON_MUMBAI_RPC_URL `
        --sig "testAddRecord(address)" `
        $ContractAddress `
        --broadcast
}

# ============================================
# CONTRACT INTERACTION
# ============================================

function Get-TotalRecords {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ContractAddress
    )
    
    Load-Env
    
    Write-Host "📊 Fetching total records..." -ForegroundColor Cyan
    
    $result = cast call $ContractAddress "getTotalRecords()" --rpc-url $env:POLYGON_MUMBAI_RPC_URL
    $decimal = [Convert]::ToInt64($result, 16)
    
    Write-Host "Total Records: $decimal" -ForegroundColor Green
}

function Check-Issuer {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ContractAddress,
        [Parameter(Mandatory=$true)]
        [string]$IssuerAddress
    )
    
    Load-Env
    
    Write-Host "🔍 Checking if address is authorized issuer..." -ForegroundColor Cyan
    
    $result = cast call $ContractAddress "isAuthorizedIssuer(address)(bool)" $IssuerAddress --rpc-url $env:POLYGON_MUMBAI_RPC_URL
    
    if ($result -match "true") {
        Write-Host "✅ Address IS an authorized issuer" -ForegroundColor Green
    } else {
        Write-Host "❌ Address is NOT an authorized issuer" -ForegroundColor Red
    }
}

function Get-Record {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ContractAddress,
        [Parameter(Mandatory=$true)]
        [string]$CertId
    )
    
    Load-Env
    
    Write-Host "📄 Fetching record for Certificate ID: $CertId" -ForegroundColor Cyan
    
    cast call $ContractAddress "getRecord(string)" $CertId --rpc-url $env:POLYGON_MUMBAI_RPC_URL
}

function Add-Issuer {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ContractAddress,
        [Parameter(Mandatory=$true)]
        [string]$NewIssuer,
        [Parameter(Mandatory=$true)]
        [string]$InstitutionName
    )
    
    Load-Env
    
    Write-Host "➕ Adding new authorized issuer..." -ForegroundColor Cyan
    Write-Host "Contract: $ContractAddress" -ForegroundColor Yellow
    Write-Host "New Issuer: $NewIssuer" -ForegroundColor Yellow
    Write-Host "Institution: $InstitutionName" -ForegroundColor Yellow
    
    cast send $ContractAddress `
        "authorizeIssuer(address,string)" `
        $NewIssuer `
        $InstitutionName `
        --rpc-url $env:POLYGON_MUMBAI_RPC_URL `
        --private-key $env:PRIVATE_KEY
}

# ============================================
# UTILITIES
# ============================================

function Get-WalletAddress {
    Load-Env
    
    Write-Host "👤 Getting wallet address from private key..." -ForegroundColor Cyan
    
    cast wallet address --private-key $env:PRIVATE_KEY
}

function Get-Balance {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Address
    )
    
    Load-Env
    
    Write-Host "💰 Checking balance for: $Address" -ForegroundColor Cyan
    
    $wei = cast balance $Address --rpc-url $env:POLYGON_MUMBAI_RPC_URL
    $matic = [decimal]$wei / 1000000000000000000
    
    Write-Host "Balance: $matic MATIC" -ForegroundColor Green
}

function Get-GasPrice {
    Load-Env
    
    Write-Host "⛽ Getting current gas price..." -ForegroundColor Cyan
    
    cast gas-price --rpc-url $env:POLYGON_MUMBAI_RPC_URL
}

function Get-BlockNumber {
    Load-Env
    
    Write-Host "🔢 Getting current block number..." -ForegroundColor Cyan
    
    cast block-number --rpc-url $env:POLYGON_MUMBAI_RPC_URL
}

function Verify-Contract {
    param(
        [Parameter(Mandatory=$true)]
        [string]$ContractAddress
    )
    
    Load-Env
    
    Write-Host "✅ Verifying contract on Polygonscan..." -ForegroundColor Cyan
    
    forge verify-contract `
        --chain-id 80001 `
        --watch `
        $ContractAddress `
        src/AlumniVerification.sol:AlumniVerification `
        --etherscan-api-key $env:POLYGONSCAN_API_KEY
}

# ============================================
# HELP
# ============================================

function Show-Help {
    Write-Host @"
    
🎓 Alumni Verification - PowerShell Helper Commands
====================================================

📦 SETUP:
  Load-Env                          Load environment variables from .env

🔨 BUILD & TEST:
  Build-Contracts                   Compile smart contracts
  Clean-Build                       Clean and rebuild contracts
  Test-Contracts                    Run all tests
  Test-Contracts -Verbosity -vvvv   Run tests with detailed output
  Test-Contracts -TestName "test_AddAlumniRecord"  Run specific test
  Get-Coverage                      Check test coverage
  Format-Code                       Format Solidity code

🚀 DEPLOYMENT:
  Deploy-Mumbai                     Deploy to Mumbai testnet
  Deploy-Polygon                    Deploy to Polygon mainnet (⚠️ COSTS REAL MATIC)
  Test-Deployment -ContractAddress 0x...  Test deployed contract

🔍 CONTRACT INTERACTION:
  Get-TotalRecords -ContractAddress 0x...
  Check-Issuer -ContractAddress 0x... -IssuerAddress 0x...
  Get-Record -ContractAddress 0x... -CertId "CERT-2025-ABC123"
  Add-Issuer -ContractAddress 0x... -NewIssuer 0x... -InstitutionName "College Name"

🛠️ UTILITIES:
  Get-WalletAddress                 Get your wallet address
  Get-Balance -Address 0x...        Check wallet balance
  Get-GasPrice                      Get current gas price
  Get-BlockNumber                   Get current block number
  Verify-Contract -ContractAddress 0x...  Verify on Polygonscan

📚 EXAMPLES:

  # Deploy to Mumbai
  Deploy-Mumbai

  # Check total records
  Get-TotalRecords -ContractAddress "0x1234..."

  # Add new issuer
  Add-Issuer -ContractAddress "0x1234..." -NewIssuer "0xABCD..." -InstitutionName "ABC College"

  # Check balance
  Get-Balance -Address "0x1234..."

====================================================
Run 'Load-Env' first to load your configuration!

"@ -ForegroundColor Cyan
}

# Show help by default
Show-Help

Write-Host "`n💡 Tip: Run 'Load-Env' to load your environment variables" -ForegroundColor Yellow
Write-Host "📖 For more info, see SETUP_GUIDE.md`n" -ForegroundColor Yellow
