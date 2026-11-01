/**
 * Summarize an already validated Stremio configuration without exposing
 * manifest URLs, configuration paths, tokens, titles or media URLs.
 * This is static configuration evidence, NOT a live-addon health check.
 */
export function summarizeStremioConfig(config,source){
 const addons=config.addons.map(addon=>({
  id:addon.id,
  mappedAnime:addon.anime.length,
  mappedEpisodes:addon.anime.reduce((count,anime)=>count+anime.episodes.length,0)
 }))
 return {
  status:addons.length?'CONFIGURED':'EMPTY',
  source,
  addonCount:addons.length,
  mappedAnime:addons.reduce((count,addon)=>count+addon.mappedAnime,0),
  mappedEpisodes:addons.reduce((count,addon)=>count+addon.mappedEpisodes,0),
  addons,
  liveManifestChecked:false,
  nativePlaybackVerified:false,
  subtitleDownloadsVerified:false
 }
}
