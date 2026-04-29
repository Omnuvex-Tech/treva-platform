$c = Get-Content 'c:\Users\ASUS\Desktop\trevaa\asd\www.treva.realestate\index.html' -Raw
$m = [regex]::Matches($c, '(?s)<style>(.*?)</style>')
foreach ($i in $m) {
    $i.Groups[1].Value | Out-File -Append -FilePath 'c:\Users\ASUS\Desktop\treva-platform\apps\treva-web\app\styles\treva-custom.css' -Encoding utf8
}
