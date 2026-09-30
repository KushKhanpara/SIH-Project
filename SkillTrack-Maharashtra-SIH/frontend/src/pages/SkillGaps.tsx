import { AlertTriangle, BrainCircuit } from "lucide-react";
import { useEffect, useState } from "react";
import { getSkills } from "../api/api";

type Skill = {
  name: string;
  demand_count: number;
  supply_count: number;
};

type SkillDisplay = Skill & {
  demand: number;
  supply: number;
  gap: number;
  gapPercentage: number;
  severity: "Critical" | "High" | "Balanced";
};

export default function SkillGaps() {
  const [skills, setSkills] = useState<SkillDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    getSkills()
      .then((data) => {
        console.log("Skills API data:", data);

        const formattedSkills: SkillDisplay[] = data.map((skill: Skill) => {
          const demand = Number(skill.demand_count);
          const supply = Number(skill.supply_count);
          const gap = demand - supply;

          const gapPercentage =
            demand > 0 ? Math.round((gap / demand) * 100) : 0;

          let severity: "Critical" | "High" | "Balanced";

          if (gapPercentage >= 40) {
            severity = "Critical";
          } else if (gapPercentage >= 20) {
            severity = "High";
          } else {
            severity = "Balanced";
          }

          return {
            ...skill,
            demand,
            supply,
            gap,
            gapPercentage,
            severity,
          };
        });

        setSkills(formattedSkills);
      })
      .catch((error) => {
        console.error("Skills API error:", error);
        setApiError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const criticalGaps = skills.filter(
    (skill) => skill.severity === "Critical",
  ).length;

  const highGaps = skills.filter((skill) => skill.severity === "High").length;

  const balancedSkills = skills.filter(
    (skill) => skill.severity === "Balanced",
  ).length;

  const topSkills = [...skills]
    .filter((skill) => skill.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  const recommendationText =
    topSkills.length > 0
      ? `Expand ${topSkills.map((skill) => skill.name).join(", ")} capacity.`
      : "Current skills are broadly aligned with recorded demand.";

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <p className="eyebrow">Analytics engine</p>

        <h1 className="mt-2 text-3xl font-black">Skill Gap Intelligence</h1>

        <p className="mt-2 text-sm text-slate-500">
          Employer demand compared with candidate supply.
          {loading
            ? " Loading data..."
            : apiError
              ? " Backend unavailable."
              : " Live PostgreSQL data."}
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Critical gaps</p>

          <b className="mt-2 block text-3xl">
            {loading ? "..." : criticalGaps}
          </b>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">High gaps</p>

          <b className="mt-2 block text-3xl">{loading ? "..." : highGaps}</b>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Balanced skills</p>

          <b className="mt-2 block text-3xl">
            {loading ? "..." : balancedSkills}
          </b>
        </div>
      </div>

      {/* SKILL TABLE */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <p className="eyebrow">Demand vs supply</p>

            <h2 className="mt-1 font-extrabold">Skill shortage analysis</h2>
          </div>

          {!apiError && !loading && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Live data
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Skill</th>

                <th className="px-5 py-4">Industry demand</th>

                <th className="px-5 py-4">Available</th>

                <th className="px-5 py-4">Gap</th>

                <th className="px-5 py-4">Gap %</th>

                <th className="px-5 py-4">Signal</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading skill data from PostgreSQL...
                  </td>
                </tr>
              ) : skills.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No skill data found.
                  </td>
                </tr>
              ) : (
                skills.map((skill) => (
                  <tr key={skill.name} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-bold">{skill.name}</td>

                    <td className="px-5 py-4">
                      {skill.demand.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      {skill.supply.toLocaleString()}
                    </td>

                    <td
                      className={`px-5 py-4 font-black ${
                        skill.gap > 0 ? "text-rose-600" : "text-emerald-600"
                      }`}
                    >
                      {skill.gap > 0
                        ? `-${skill.gap.toLocaleString()}`
                        : `+${Math.abs(skill.gap).toLocaleString()}`}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {skill.gapPercentage}%
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`pill ${
                          skill.severity === "Critical"
                            ? "bg-rose-50 text-rose-700"
                            : skill.severity === "High"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {skill.severity}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECOMMENDATION + ANALYTICS */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* PRIORITY RECOMMENDATION */}
        <div className="card p-6">
          <div className="flex gap-3">
            <div className="rounded-xl bg-rose-50 p-2 text-rose-600">
              <AlertTriangle />
            </div>

            <div>
              <p className="eyebrow">Priority recommendation</p>

              <h2 className="mt-1 text-lg font-black">
                {loading ? "Analyzing skill gaps..." : recommendationText}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The recommendation is generated from the largest demand-supply
                gaps currently stored in the database.
              </p>

              {!loading && topSkills.length > 0 && (
                <div className="mt-4 space-y-2">
                  {topSkills.map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                    >
                      <span className="text-sm font-semibold">
                        {skill.name}
                      </span>

                      <span className="text-xs font-bold text-rose-600">
                        {skill.gap.toLocaleString()} shortage
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="card p-6">
          <div className="flex gap-3">
            <div className="rounded-xl bg-teal-50 p-2 text-teal-700">
              <BrainCircuit />
            </div>

            <div>
              <p className="eyebrow">Analytics ready</p>

              <h2 className="mt-1 text-lg font-black">
                Python / Pandas integration point
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The backend can send aggregated demand and supply data to a
                Python analytics service for forecasting, trend analysis and
                future skill-gap prediction.
              </p>

              <div className="mt-4 rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-600">
                  Current data pipeline
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  PostgreSQL → Node API → Analytics → Training recommendations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
