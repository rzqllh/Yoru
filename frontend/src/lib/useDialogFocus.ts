import {useEffect,useRef} from 'react'

const FOCUSABLE='button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),video[controls],[tabindex]:not([tabindex="-1"])'

/** Keep keyboard navigation inside an active dialog; restore its opener on close. */
export function useDialogFocus(){
 const dialogRef=useRef<HTMLDivElement>(null)
 useEffect(()=>{
  const dialog=dialogRef.current
  if(!dialog)return
  const opener=document.activeElement instanceof HTMLElement?document.activeElement:null
  const scrollX=window.scrollX,scrollY=window.scrollY
  const previous={position:document.body.style.position,top:document.body.style.top,left:document.body.style.left,width:document.body.style.width,overflow:document.body.style.overflow}
  document.body.style.position='fixed'
  document.body.style.top=`-${scrollY}px`
  document.body.style.left=`-${scrollX}px`
  document.body.style.width='100%'
  document.body.style.overflow='hidden'
  const controls=()=>Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
   .filter(item=>item.getClientRects().length>0&&getComputedStyle(item).visibility!=='hidden')
  const first=controls()[0]
  if(first)first.focus({preventScroll:true})
  else dialog.focus({preventScroll:true})
  const trap=(event:KeyboardEvent)=>{
   if(event.key!=='Tab')return
   const candidates=controls()
   if(!candidates.length){event.preventDefault();dialog.focus();return}
   const initial=candidates[0],last=candidates[candidates.length-1]
   if(!dialog.contains(document.activeElement)){
    event.preventDefault();initial.focus();return
   }
   if(event.shiftKey&&document.activeElement===initial){
    event.preventDefault();last.focus()
   }else if(!event.shiftKey&&document.activeElement===last){
    event.preventDefault();initial.focus()
   }
  }
  document.addEventListener('keydown',trap)
  return ()=>{
   document.removeEventListener('keydown',trap)
   document.body.style.position=previous.position
   document.body.style.top=previous.top
   document.body.style.left=previous.left
   document.body.style.width=previous.width
   document.body.style.overflow=previous.overflow
   window.scrollTo(scrollX,scrollY)
   if(opener?.isConnected)opener.focus({preventScroll:true})
  }
 },[])
 return dialogRef
}
