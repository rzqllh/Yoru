export type CaptionPosition='original'|'top'|'bottom'
export type CaptionSettings={
 font:'sans'|'serif';size:75|90|100|125|150;backdrop:'dark'|'clear';
 textOpacity:50|75|100;backgroundOpacity:0|25|50|75|100;
 outline:0|1|2;position:CaptionPosition
}
export const DEFAULT_CAPTIONS:CaptionSettings={
 font:'sans',size:90,backdrop:'dark',textOpacity:100,
 backgroundOpacity:50,outline:1,position:'original'
}
const sizes=[75,90,100,125,150] as const
const textOpacities=[50,75,100] as const
const bgOpacities=[0,25,50,75,100] as const
const outlines=[0,1,2] as const
export function normalizeCaptionSettings(input:unknown):CaptionSettings{
 const obj=input&&typeof input==='object'&&!Array.isArray(input)?input as Record<string,unknown>:{}
 return {
 font:obj.font==='serif'?'serif':'sans',
 size:sizes.find(x=>x===obj.size)??DEFAULT_CAPTIONS.size,
 backdrop:obj.backdrop==='clear'?'clear':'dark',
 textOpacity:textOpacities.find(x=>x===obj.textOpacity)??100,
 backgroundOpacity:bgOpacities.find(x=>x===obj.backgroundOpacity)??(obj.backdrop==='clear'?0:DEFAULT_CAPTIONS.backgroundOpacity),
 outline:outlines.find(x=>x===obj.outline)??1,
 position:obj.position==='top'||obj.position==='bottom'?obj.position:'original'
 }
}
export function captionClasses(settings:CaptionSettings):string{
 return [
  `subtitle-font-${settings.font}`,
  `subtitle-size-${settings.size}`,
  `subtitle-text-${settings.textOpacity}`,
  `subtitle-bg-${settings.backgroundOpacity}`,
  `subtitle-outline-${settings.outline}`
 ].join(' ')
}
