$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    phoneNumber = "+919999999999"
} | ConvertTo-Json

Write-Host "Testing PayTrack API Connection..." -ForegroundColor Cyan
Write-Host "Endpoint: http://localhost:3000/api/v1/auth/send-otp" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/auth/send-otp" `
        -Method POST `
        -Headers $headers `
        -Body $body `
        -UseBasicParsing

    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host $response.Content
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host ""
pause
