#Requires -Version 7.0
<#
.SYNOPSIS
  Audits stale Yoru branches and optionally deletes only verified merged-PR heads.
.DESCRIPTION
  DRY RUN by default. Preserves default/preview branches, open PR refs and bases,
  protected refs, closed-unmerged work, unreferenced branches, and any branch
  whose live HEAD no longer matches its sole merged PR's head SHA.
  A check-then-delete race is still theoretically possible; freeze branch pushes
  during Apply. Requires GitHub CLI ('gh') and appropriate repo permissions.
.EXAMPLE
  pwsh -File scripts/cleanup-merged-branches.ps1
  pwsh -File scripts/cleanup-merged-branches.ps1 -Apply
#>
[CmdletBinding(SupportsShouldProcess=$true)]
param(
  [string]$Repo = 'rzqllh/Yoru',
  [switch]$Apply,
  [switch]$PruneOldCIArtifacts,
  [ValidateRange(14,3650)][int]$ArtifactOlderThanDays = 30
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
if($Repo -notmatch '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$'){throw 'Invalid owner/repo'}
if(-not (Get-Command gh -ErrorAction SilentlyContinue)){throw 'GitHub CLI gh is required'}
& gh auth status 2>&1 | Out-Null
if($LASTEXITCODE -ne 0){throw 'gh auth status failed. Run gh auth login first.'}

function Get-GhRows([string]$Endpoint,[string]$Jq){
  $rows=@(& gh api $Endpoint --paginate --jq $Jq)
  if($LASTEXITCODE -ne 0){throw "GitHub API read failed: $Endpoint"}
  @($rows | Where-Object {$_ -and $_.Trim()} | ForEach-Object {ConvertFrom-Json -InputObject $_})
}
$branches=@(Get-GhRows "repos/$Repo/branches?per_page=100" '.[] | {name: .name, sha: .commit.sha, protected: .protected} | @json')
$prs=@(Get-GhRows "repos/$Repo/pulls?state=all&per_page=100" '.[] | {number: .number, state: .state, merged_at: .merged_at, head_ref: .head.ref, head_sha: .head.sha, base_ref: .base.ref} | @json')
$metadata=& gh api "repos/$Repo" --jq '{default_branch: .default_branch} | @json'
if($LASTEXITCODE -ne 0){throw 'Cannot read default branch'}
$default=(ConvertFrom-Json -InputObject $metadata).default_branch
$open=@($prs | Where-Object {$_.state -eq 'open'})
$keepBases=@($open | ForEach-Object {$_.base_ref} | Select-Object -Unique)
$keepHeads=@($open | ForEach-Object {$_.head_ref} | Select-Object -Unique)
$keep=@($default,'main','deploy/vercel-preview-20261029') + $keepHeads + $keepBases
$eligible=@()
$skipped=@()
foreach($branch in $branches){
  $name=[string]$branch.name
  if($branch.protected -or $name -in $keep){
    $skipped+= [pscustomobject]@{Branch=$name;Reason='Protected/default/active PR ref'};continue
  }
  $associated=@($prs | Where-Object {$_.head_ref -eq $name})
  $merged=@($associated | Where-Object {$_.state -eq 'closed' -and $_.merged_at -and $_.head_sha -eq $branch.sha})
  if($associated.Count -ne 1 -or $merged.Count -ne 1){
    $skipped+= [pscustomobject]@{Branch=$name;Reason='Unmerged, ambiguous or SHA changed'};continue
  }
  $eligible+= [pscustomobject]@{Branch=$name;Sha=$branch.sha;PR=$merged[0].number}
}
Write-Host ("Branches: {0} | eligible: {1} | preserved: {2}" -f $branches.Count,$eligible.Count,$skipped.Count)
$eligible | Sort-Object Branch | Format-Table -AutoSize
if(-not $Apply){Write-Host 'DRY RUN only. Pass -Apply to delete eligible branches.'}
foreach($item in $eligible){
  if(-not $Apply){continue}
  $path=[uri]::EscapeDataString($item.Branch)
  $live=& gh api "repos/$Repo/branches/$path" --jq '.commit.sha'
  if($LASTEXITCODE -ne 0 -or $live.Trim() -ne $item.Sha){
    Write-Warning "SKIP moved or inaccessible ref: $($item.Branch)";continue
  }
  if($PSCmdlet.ShouldProcess("$Repo/$($item.Branch)","Delete merged branch for PR #$($item.PR)")){
    & gh api --method DELETE "repos/$Repo/git/refs/heads/$path" | Out-Null
    if($LASTEXITCODE -ne 0){throw "Delete failed: $($item.Branch)"}
    Write-Host "Deleted: $($item.Branch)"
  }
}
if($PruneOldCIArtifacts){
  $cutoff=(Get-Date).ToUniversalTime().AddDays(-$ArtifactOlderThanDays)
  $artifacts=@(Get-GhRows "repos/$Repo/actions/artifacts?per_page=100" '.artifacts[] | {id: .id, name: .name, created_at: .created_at, expired: .expired} | @json')
  $names=@('dependency-lock','yoru-production','yoru-browser-evidence','yoru-webkit-evidence')
  $old=@($artifacts | Where-Object {$_.name -in $names -and ([datetime]$_.created_at).ToUniversalTime() -lt $cutoff})
  Write-Host ("Old CI artifacts eligible: {0}. Release assets and recent CI evidence are never targeted." -f $old.Count)
  foreach($item in $old){
    if(-not $Apply){Write-Host "DRY RUN artifact $($item.id): $($item.name)";continue}
    if($PSCmdlet.ShouldProcess("$Repo artifact $($item.id)","Delete aged CI artifact")){
      & gh api --method DELETE "repos/$Repo/actions/artifacts/$($item.id)" | Out-Null
      if($LASTEXITCODE -ne 0){throw "Artifact delete failed: $($item.id)"}
    }
  }
}
$skipped | Sort-Object Branch | Format-Table -AutoSize
