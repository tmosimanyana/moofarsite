<#
=====================================================================
 Moofar Pty Ltd - WebP Responsive Image Generator
 Author: ChatGPT
 Description: Generates 400px, 800px, and 1200px .webp versions
 Requirements: ImageMagick installed and added to PATH
=====================================================================
#>

# --- CONFIGURATION ---
$SourceDir = "assets/gallery"
$OutputDir = "assets/gallery"
$QualSmall = 75
$QualMedium = 75
$QualLarge = 80

Write-Host "🌿 Moofar Pty Ltd - Responsive WebP Generator" -ForegroundColor Green
Write-Host "---------------------------------------------------------------"
Write-Host " Source Folder: $SourceDir"
Write-Host " Output Folder: $OutputDir"
Write-Host "---------------------------------------------------------------`n"

# --- Check if ImageMagick is installed ---
if (-not (Get-Command magick -ErrorAction SilentlyContinue)) {
    Write-Host "❌ ERROR: ImageMagick is not installed or not in PATH." -ForegroundColor Red
    Write-Host "➡️  Please install from: https://imagemagick.org" -ForegroundColor Yellow
    exit
}

# --- Ensure output folder exists ---
if (-not (Test-Path $OutputDir)) {
    New-Item -Path $OutputDir -ItemType Directory | Out-Null
}

# --- Process all .webp images in source folder ---
$images = Get-ChildItem -Path $SourceDir -Filter "*.webp" -File

if ($images.Count -eq 0) {
    Write-Host "⚠️  No .webp files found in $SourceDir" -ForegroundColor Yellow
    exit
}

foreach ($img in $images) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($img.Name)
    Write-Host "Processing: $baseName.webp" -ForegroundColor Cyan

    $target400 = Join-Path $OutputDir "$baseName-400.webp"
    $target800 = Join-Path $OutputDir "$baseName-800.webp"
    $target1200 = Join-Path $OutputDir "$baseName-1200.webp"

    if ((Test-Path $target400) -and (Test-Path $target800) -and (Test-Path $target1200)) {
        Write-Host "  ⏩ Skipping (already processed)" -ForegroundColor DarkYellow
    }
    else {
        try {
            magick $img.FullName -resize 400x -quality $QualSmall $target400
            magick $img.FullName -resize 800x -quality $QualMedium $target800
            magick $img.FullName -resize 1200x -quality $QualLarge $target1200
            Write-Host "  ✅ Created 400, 800, 1200 versions" -ForegroundColor Green
        }
        catch {
            Write-Host "  ❌ Error processing $($img.Name): $_" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "---------------------------------------------------------------"
Write-Host "✅ All responsive .webp images generated successfully!"
Write-Host "---------------------------------------------------------------" -ForegroundColor Green

