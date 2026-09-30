import {
  Activity,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Sparkles,
  Target,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import StatCard from "../components/StatCard";
import { useEffect, useMemo, useState } from "react";
import { getDashboard } from "../api/api";

type DashboardDistrict = {
  district?: string | null;
  rate?: number | string | null;
  trained?: number | string | null;
};

type DashboardSkillGap = {
  name?: string | null;
  demand_count?: number | string | null;
  supply_count?: number | string | null;
};

type DashboardData = {
  candidates?: number | string | null;
  employed?: number | string | null;
  districts?: DashboardDistrict[];
  skillGaps?: DashboardSkillGap[];
};

const numberValue = (value: number | string | null | undefined): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return parsed;
};

const formatNumber = (value: number | string | null | undefined): string => {
  return numberValue(value).toLocaleString("en-IN");
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setApiError(false);

      const data = await getDashboard();

      console.log("Dashboard API data:", data);

      setDashboardData(data as DashboardData);
    } catch (error) {
      console.error("Dashboard API error:", error);
      setApiError(true);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * ---------------------------------------------------------
   * DISTRICT DATA
   * ---------------------------------------------------------
   */

  const districts = useMemo(() => {
    if (!dashboardData?.districts || !Array.isArray(dashboardData.districts)) {
      return [];
    }

    return dashboardData.districts.map((item) => ({
      name: item.district || "Unknown",
      rate: numberValue(item.rate),
      trained: numberValue(item.trained),
    }));
  }, [dashboardData]);

  /*
   * ---------------------------------------------------------
   * SKILL GAP DATA
   * ---------------------------------------------------------
   */

  const skills = useMemo(() => {
    if (!dashboardData?.skillGaps || !Array.isArray(dashboardData.skillGaps)) {
      return [];
    }

    return dashboardData.skillGaps.map((item) => {
      const demand = numberValue(item.demand_count);
      const supply = numberValue(item.supply_count);

      return {
        name: item.name || "Unknown Skill",
        gap: Math.max(0, demand - supply),
        demand,
        supply,
      };
    });
  }, [dashboardData]);

  /*
   * ---------------------------------------------------------
   * MAIN KPIs
   * ---------------------------------------------------------
   */

  const totalCandidates = numberValue(dashboardData?.candidates);

  const totalEmployed = numberValue(dashboardData?.employed);

  const employmentRate =
    totalCandidates > 0
      ? Math.round((totalEmployed / totalCandidates) * 100)
      : 0;

  const districtCount = districts.length;

  const totalSkillGaps = skills.reduce((sum, skill) => sum + skill.gap, 0);

  /*
   * ---------------------------------------------------------
   * EMPLOYMENT PIPELINE
   * ---------------------------------------------------------
   */

  const seekingCandidates = Math.max(totalCandidates - totalEmployed, 0);

  const pipeline = [
    {
      name: "Employed",
      value: totalEmployed,
    },
    {
      name: "Not yet employed",
      value: seekingCandidates,
    },
  ];

  /*
   * ---------------------------------------------------------
   * STAT CARDS
   *
   * StatCard expects:
   * label, value, change, note
   * ---------------------------------------------------------
   */

  const stats = [
    {
      label: "Total Candidates",
      value: formatNumber(totalCandidates),
      change: `${districtCount} districts`,
      note: "Registered candidate profiles",
    },
    {
      label: "Employed",
      value: formatNumber(totalEmployed),
      change: `${employmentRate}%`,
      note: "Current employment outcomes",
    },
    {
      label: "Employment Rate",
      value: `${employmentRate}%`,
      change: "Live",
      note: "Based on current candidate records",
    },
    {
      label: "Skill Gap",
      value: formatNumber(totalSkillGaps),
      change: `${skills.length} skills`,
      note: "Total identified demand-supply gap",
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Government intelligence • Prototype</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
            Skilling outcomes at a glance.
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Connect training, employer demand and sustained employment to
            understand what is working across Maharashtra.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">
          <span
            className={`h-2 w-2 rounded-full ${
              loading
                ? "bg-amber-500"
                : apiError
                  ? "bg-red-500"
                  : "bg-emerald-500"
            }`}
          />

          {loading
            ? "Loading data..."
            : apiError
              ? "Database unavailable"
              : "Live database connected"}
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            note={stat.note}
          />
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid gap-5 xl:grid-cols-3">
        {/* DISTRICT PLACEMENT */}
        <div className="card p-5 xl:col-span-2">
          <div className="flex justify-between">
            <div>
              <p className="eyebrow">Employment outcome</p>

              <h2 className="mt-1 text-lg font-extrabold">
                District placement rate
              </h2>
            </div>

            <span className="text-xs font-bold text-teal-700">Live data</span>
          </div>

          <div className="mt-5 h-72">
            {districts.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50">
                <div className="text-center">
                  <MapPin size={32} className="mx-auto text-slate-300" />

                  <p className="mt-3 text-sm font-bold text-slate-600">
                    No district analytics available
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Add district training data to populate this chart.
                  </p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={districts} margin={{ left: -15, right: 10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis dataKey="name" axisLine={false} tickLine={false} />

                  <YAxis axisLine={false} tickLine={false} />

                  <Tooltip />

                  <Bar dataKey="rate" fill="#0f766e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* PIPELINE */}
        <div className="card p-5">
          <p className="eyebrow">Candidate status</p>

          <h2 className="mt-1 text-lg font-extrabold">Employment pipeline</h2>

          <div className="h-64">
            {totalCandidates === 0 ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-slate-400">
                  No candidate data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pipeline}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {pipeline.map((_, index) => (
                      <Cell key={index} fill={["#0f766e", "#f59e0b"][index]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2">
            {pipeline.map((item, index) => (
              <div key={item.name} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: ["#0f766e", "#f59e0b"][index],
                    }}
                  />

                  {item.name}
                </span>

                <b>{formatNumber(item.value)}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SKILL GAPS + DECISION SUPPORT */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* SKILL GAPS */}
        <div className="card overflow-hidden">
          <div className="border-b border-slate-100 p-5">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-rose-500" />

              <div>
                <p className="eyebrow">Priority signal</p>

                <h2 className="font-extrabold">Top skill gaps</h2>
              </div>
            </div>
          </div>

          <div>
            {skills.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <Target size={30} className="mx-auto text-slate-300" />

                <p className="mt-3 text-sm font-bold text-slate-600">
                  No skill-gap data available
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Skill-gap insights will appear when skill demand data is
                  available.
                </p>
              </div>
            ) : (
              skills.slice(0, 4).map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-0"
                >
                  <div className="w-28 text-sm font-bold">{skill.name}</div>

                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-rose-400"
                        style={{
                          width: `${Math.min(100, skill.gap / 60)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <span className="text-xs font-bold text-rose-600">
                    -{formatNumber(skill.gap)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DECISION SUPPORT */}
        <div className="card bg-gradient-to-br from-ink to-slate-900 p-6 text-white">
          <div className="flex items-center gap-2 text-teal-300">
            <Sparkles size={18} />

            <span className="text-xs font-bold uppercase tracking-widest">
              Decision support
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-black">
            Turn skill gaps into training priorities.
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            The platform compares employer demand with available skills and
            highlights where new skilling capacity can have the most impact.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
              <Activity size={18} />
            </div>

            <div>
              <p className="text-sm font-bold">Feedback loop</p>

              <p className="text-xs text-slate-400">
                Train → Skill → Job → Retain → Improve
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DATABASE STATUS */}
      <div className="card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 />
          </div>

          <div>
            <p className="font-extrabold">Data quality status</p>

            <p className="text-xs text-slate-500">
              {apiError
                ? "The dashboard could not connect to the backend."
                : "Training, placement and skill records are connected to PostgreSQL."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <MapPin size={15} />
          Maharashtra
          <ArrowRight size={15} />
        </div>
      </div>
    </div>
  );
}
