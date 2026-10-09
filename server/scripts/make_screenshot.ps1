Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 600, 200
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font('Arial', 14)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
$rect = New-Object System.Drawing.RectangleF 20, 20, 560, 160
$text = 'Dear Customer, your bank KYC expires today. Send Rs 10 immediately to kyc.verify@upi or click http://bank-kyc-update.in/verify to avoid account blocking.'
$g.DrawString($text, $font, $brush, $rect)
$outPath = Resolve-Path -Path 'client\public'
$fullOut = Join-Path $outPath 's01_sample.png'
$bmp.Save($fullOut, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Host "Generated: $fullOut"
