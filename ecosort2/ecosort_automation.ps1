# ----------------------------
# EcoSort Automation Script
# ----------------------------

# --- Configuration ---
$baseUrl     = "http://localhost:8080/api"
$email       = "alice@example.com"
$password    = "1234"
$imageFolder = "C:\Users\thanu\Downloads\images"
$jsonPath    = "C:\Users\thanu\Downloads\ecosort_history.json"
$csvPath     = "C:\Users\thanu\Downloads\ecosort_history.csv"

# --- Ensure image folder exists ---
if (-not (Test-Path $imageFolder)) {
    New-Item -ItemType Directory -Path $imageFolder -Force
    Write-Host "⚠️ Created image folder: $imageFolder"
}

# --- Step 1: Login ---
$loginBody = @{ email = $email; password = $password } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/login" -Method POST -Body $loginBody -ContentType "application/json"
$userId = $loginResponse.id
Write-Host "✅ Logged in as user ID: $userId"

# --- Step 2: Process Images ---
$results = @()
$images = Get-ChildItem -Path $imageFolder -File

if (-not $images) {
    Write-Host "⚠️ No images found in $imageFolder"
    return
}

foreach ($img in $images) {
    $imagePath = $img.FullName
    $imageName = $img.Name

    # Convert to Base64
    $bytes = [System.IO.File]::ReadAllBytes($imagePath)
    $imageBase64 = [System.Convert]::ToBase64String($bytes)

    # Classify image with error handling
    try {
        $classifyBody = @{ imageBase64 = $imageBase64; mimeType = "image/jpeg" } | ConvertTo-Json
        $classifyResponse = Invoke-RestMethod -Uri "$baseUrl/classify" -Method POST -Body $classifyBody -ContentType "application/json"
        Write-Host "✅ Classified image: $imageName"
    } catch {
        $errorMessage = $_.Exception.Message
        Write-Host "❌ Error classifying $imageName : $errorMessage"
        continue
    }

    # Save result to backend
    $saveBody = @{ userId = $userId; imageName = $imageName; resultJson = $classifyResponse | ConvertTo-Json } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/saveResult" -Method POST -Body $saveBody -ContentType "application/json"
    Write-Host "✅ Saved result for: $imageName"

    # Collect for local export
    $results += [PSCustomObject]@{ imageName = $imageName; result = $classifyResponse }
}

# --- Step 3: Export JSON ---
$results | ConvertTo-Json -Depth 5 | Out-File $jsonPath -Encoding UTF8
Write-Host "✅ History exported as JSON to $jsonPath"

# --- Step 4: Export CSV ---
$csvData = @()
foreach ($entry in $results) {
    foreach ($item in $entry.result) {
        $compositionStr = ""
        if ($item.composition) {
            $compositionStr = ($item.composition | ForEach-Object { "$($_.name):$($_.value)" }) -join "; "
        }
        $csvData += [PSCustomObject]@{
            ImageName     = $entry.imageName
            ItemName      = $item.itemName
            WasteType     = $item.wasteType
            RecyclingInfo = $item.recyclingInfo
            Composition   = $compositionStr
        }
    }
}
$csvData | Export-Csv -Path $csvPath -NoTypeInformation -Encoding UTF8
Write-Host "✅ History exported as CSV to $csvPath"

Write-Host "🎉 All images processed successfully!"
