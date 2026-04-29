$sourceDir = 'c:\Users\ASUS\Desktop\treva-platform\apps\treva-web\public\cdn-assets\'
$destDir = 'c:\Users\ASUS\Desktop\treva-platform\apps\treva-web\public\assets\'

if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir -Force
}

$files = Get-ChildItem $sourceDir -File

foreach ($f in $files) {
    $baseName = $f.Name
    # Copy original name
    Copy-Item -Path $f.FullName -Destination (Join-Path $destDir $baseName) -Force
    
    # Try to strip Webflow prefixes
    # Format 1: [10-char-hex]-
    # Format 2: [32-char-hex]_
    $newName = $baseName
    if ($newName -match '^[a-f0-9]{10}-') {
        $newName = $newName -replace '^[a-f0-9]{10}-', ''
    }
    if ($newName -match '^[a-f0-9]{32}_') {
        $newName = $newName -replace '^[a-f0-9]{32}_', ''
    }
    
    if ($newName -ne $baseName) {
        Write-Host "Renaming $baseName to $newName"
        Copy-Item -Path $f.FullName -Destination (Join-Path $destDir $newName) -Force
    }
}
