param(
  [Parameter(Mandatory = $true)][string]$ManifestPath
)

# Synthesises a batch of SSML clips to 16 kHz mono WAV with the Windows SAPI
# voices. Driven by scripts/generate-lure-audio.mjs, which writes the manifest.

Add-Type -AssemblyName System.Speech

$items = Get-Content -Raw -Path $ManifestPath | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$fmt = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
  16000,
  [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
  [System.Speech.AudioFormat.AudioChannel]::Mono
)

foreach ($item in $items) {
  $ssml = Get-Content -Raw -Path $item.ssmlPath
  $synth.SetOutputToWaveFile($item.wavPath, $fmt)
  $synth.SpeakSsml($ssml)
  Write-Host ("  synth " + $item.id)
}

$synth.SetOutputToNull()
$synth.Dispose()
