import { ArrowUpRight } from "lucide-react";
export default function StatCard({label,value,change,note}:{label:string;value:string;change:string;note:string}) {
 return <div className="card p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{value}</p></div><div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-700"><ArrowUpRight size={19}/></div></div><div className="mt-4 flex items-center gap-2"><span className="pill bg-emerald-50 text-emerald-700">{change}</span><span className="text-xs text-slate-400">{note}</span></div></div>
}
