$files = Get-ChildItem 'c:\Users\ASUS\Desktop\trevaa\asd\www.treva.realestate\' -Filter *.html
$outputFile = 'c:\Users\ASUS\Desktop\treva-platform\apps\treva-web\app\styles\treva-custom.css'

# Clear the file first to avoid infinite appending if rerun
"" | Out-File -FilePath $outputFile -Encoding utf8

foreach ($f in $files) {
    Write-Host "Processing $($f.Name)..."
    $c = Get-Content $f.FullName -Raw
    $m = [regex]::Matches($c, '(?s)<style>(.*?)</style>')
    foreach ($i in $m) {
        "/* From $($f.Name) */" | Out-File -Append -FilePath $outputFile -Encoding utf8
        $i.Groups[1].Value | Out-File -Append -FilePath $outputFile -Encoding utf8
    }
}
