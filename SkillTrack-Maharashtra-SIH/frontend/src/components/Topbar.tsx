import { Bell, Menu, Search } from "lucide-react";
export default function Topbar({onMenu}:{onMenu:()=>void}) {
 return <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
  <div className="flex items-center gap-3"><button className="rounded-xl p-2 hover:bg-slate-100 lg:hidden" onClick={onMenu}><Menu size={22}/></button>
  <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex"><Search size={16} className="text-slate-400"/><input className="w-56 bg-transparent text-sm outline-none" placeholder="Search candidates, skills..."/></div></div>
  <div className="flex items-center gap-4"><button className="relative rounded-xl p-2 hover:bg-slate-100"><Bell size={19}/><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500"/></button>
  <div className="flex items-center gap-3 border-l border-slate-200 pl-4"><div className="grid h-9 w-9 place-items-center rounded-full bg-teal-100 font-bold text-teal-700">GA</div><div className="hidden sm:block"><p className="text-sm font-bold">Government Admin</p><p className="text-[11px] text-slate-400">Maharashtra</p></div></div></div>
 </header>
}
