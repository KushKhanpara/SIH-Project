import { NavLink } from "react-router-dom";
import {
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  Map,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

const items = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/training",
    label: "Training",
    icon: GraduationCap,
  },
  {
    to: "/placements",
    label: "Placements",
    icon: BriefcaseBusiness,
  },
  {
    to: "/retention",
    label: "Retention & Follow-ups",
    icon: Clock3,
  },
  {
    to: "/skill-gaps",
    label: "Skill Gaps",
    icon: BarChart3,
  },
  {
    to: "/districts",
    label: "Districts",
    icon: Map,
  },
  {
    to: "/candidates",
    label: "Candidates",
    icon: Users,
  },
];

export default function Sidebar({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  return (
    <aside
      className={`fixed z-50 inset-y-0 left-0 w-64 bg-ink text-white transition-transform lg:translate-x-0 ${
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <div>
          <div className="flex items-center gap-2 text-xl font-black">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-400 text-ink">
              ST
            </span>
            SkillTrack
          </div>

          <div className="ml-11 -mt-1 text-[10px] uppercase tracking-[.2em] text-slate-400">
            Maharashtra
          </div>
        </div>

        <button className="lg:hidden" onClick={() => setMobileOpen(false)}>
          <X size={20} />
        </button>
      </div>

      <div className="px-4 py-5">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
          Monitoring
        </p>

        <nav className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-teal-400 text-ink shadow-lg shadow-teal-900/20"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
          System
        </p>

        <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400">
          <ShieldCheck size={18} />
          Verified data
        </div>

        <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400">
          <Settings size={18} />
          Settings
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 p-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-xs font-bold">SIH 2026 Prototype</p>

          <p className="mt-1 text-[11px] text-slate-400">
            Demo data • not official statistics
          </p>
        </div>
      </div>
    </aside>
  );
}
