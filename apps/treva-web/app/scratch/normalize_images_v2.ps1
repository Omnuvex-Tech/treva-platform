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
    
    # Strip any prefix that looks like a Webflow/CDN hash
    # Patterns: 
    # 1. [hex]{10}-
    # 2. [hex]{20,}_ (common in Webflow)
    # 3. Just strip anything before the first underscore if it's long hex
    
    $newName = $baseName
    # Remove first part if it's a long hex string
    if ($newName -match '^[a-f0-9]{8,}[-_]') {
        $newName = $newName -replace '^[a-f0-9]{8,}[-_]', ''
    }
    # Sometimes there are two hashes? Let's check again
    if ($newName -match '^[a-f0-9]{8,}[-_]') {
        $newName = $newName -replace '^[a-f0-9]{8,}[-_]', ''
    }
    
    if ($newName -ne $baseName) {
        Write-Host "Renaming $baseName to $newName"
        Copy-Item -Path $f.FullName -Destination (Join-Path $destDir $newName) -Force
    }
}
