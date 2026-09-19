<# :
@echo off
setlocal
:: Maphy Agent CMD wrapper. Executes the embedded PowerShell block bypassing execution policies.
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-Expression ([System.IO.File]::ReadAllText('%~f0'))"
endlocal
exit /b %ERRORLEVEL%
#>

# --- POWERSHELL SCRIPT BEGINS HERE ---
# Configuration
$MAPHY_SERVER_URL = "http://localhost:4009/api/v1" # Default local server URL

# Test connectivity to the default endpoint
$IsReachable = $false
try {
    $HEALTH_URL = $MAPHY_SERVER_URL -replace "/api/v1", "/health"
    $TestResponse = Invoke-RestMethod -Uri $HEALTH_URL -Method Get -TimeoutSec 2 -ErrorAction Stop
    if ($TestResponse.status -eq "healthy") {
        $IsReachable = $true
    }
} catch {
    $IsReachable = $false
}

if (-not $IsReachable) {
    Write-Host "Default Maphy Server ($MAPHY_SERVER_URL) is not reachable." -ForegroundColor Yellow
    $InputURL = Read-Host "Please enter the Maphy Server URL (e.g., http://192.168.56.1:5000/api/v1)"
    if (-not [string]::IsNullOrEmpty($InputURL)) {
        $MAPHY_SERVER_URL = $InputURL.Trim()
    }
}

# Enforce HTTPS in production for remote addresses
try {
    $Uri = [System.Uri]$MAPHY_SERVER_URL
    $HostName = $Uri.Host
    $IsLocal = ($HostName -eq "localhost") -or ($HostName -eq "127.0.0.1") -or ($HostName -eq "[::1]") -or ($HostName -eq "::1")
    if (-not $IsLocal -and $Uri.Scheme -ne "https") {
        Write-Host "Security Error: Production telemetry server URL must use HTTPS (SSL/TLS)." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Invalid Maphy Server URL format: $MAPHY_SERVER_URL" -ForegroundColor Red
    exit 1
}

$API_ENDPOINT = "$MAPHY_SERVER_URL/hardware/agent-import"
$AGENT_TOKEN = "MAPHY_AGENT_SECURE_TOKEN_XYZ123"

Write-Host "Maphy Agent: Initializing system telemetry scan..." -ForegroundColor Cyan

try {
    # 1. OS & Device details
    $OS = Get-CimInstance Win32_OperatingSystem
    $ComputerSystem = Get-CimInstance Win32_ComputerSystem
    $Bios = Get-CimInstance Win32_Bios
    $Baseboard = Get-CimInstance Win32_BaseBoard

    # Generate secure unique machine signature using BIOS SerialNumber & Salt
    $SALT = "MAPHY_SECURE_SALT_9988_SECRET"
    $InputToHash = "$($Bios.SerialNumber)$SALT"
    $Bytes = [System.Text.Encoding]::UTF8.GetBytes($InputToHash)
    $HashBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash($Bytes)
    $AGENT_TOKEN = [System.BitConverter]::ToString($HashBytes).Replace("-", "").ToLower()

    # 2. CPU Specs
    $CPU = Get-CimInstance Win32_Processor | Select-Object -First 1

    # 3. Memory Specs
    $RAMBytes = Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum
    $RAM_GB = [Math]::Round($RAMBytes.Sum / 1GB, 2)

    # 4. Main Storage C: Drive
    $Disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
    $Disk_GB = [Math]::Round($Disk.Size / 1GB, 2)

    # 5. Network details (Active IP & MAC)
    $Network = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter "IPEnabled=True" | Select-Object -First 1
    $IPAddress = $Network.IPAddress[0]
    $MACAddress = $Network.MACAddress

    # 6. Currently Logged User
    $CurrentUser = $ComputerSystem.UserName
    if ([string]::IsNullOrEmpty($CurrentUser)) {
        $CurrentUser = $env:USERNAME
    }

    # --- TELEMETRY PAYLOAD ---
    $Payload = @{
        hostname       = $OS.CSName
        serial         = $Bios.SerialNumber
        cpu            = $CPU.Name
        ram            = "$($RAM_GB) GB"
        disk           = "$($Disk_GB) GB"
        motherboard    = $Baseboard.Product
        manufacturer   = $ComputerSystem.Manufacturer
        model          = $ComputerSystem.Model
        mac_address    = $MACAddress
        ip_address     = $IPAddress
        logged_user    = $CurrentUser
    }

    Write-Host "Telemetry successfully collected:" -ForegroundColor Green
    $Payload | Out-String | Write-Host -ForegroundColor Yellow

    # --- TRANSMISSION ---
    $Headers = @{
        "Content-Type"  = "application/json"
        "Authorization" = "Bearer $AGENT_TOKEN"
    }

    $JsonBody = $Payload | ConvertTo-Json
    Write-Host "Transmitting system data to $API_ENDPOINT ..." -ForegroundColor Cyan
    
    $Response = Invoke-RestMethod -Uri $API_ENDPOINT -Method Post -Body $JsonBody -Headers $Headers
    Write-Host "Maphy Agent Telemetry Post Success! Server Response: $($Response.message)" -ForegroundColor Green

} catch {
    Write-Error "Maphy Agent Telemetry Ingestion Failed: $_"
}
