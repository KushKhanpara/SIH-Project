import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  MapPin,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

import { getDistricts, getDistrictSummary } from "../api/api";

type DistrictAnalytics = {
  district?: string | null;
  trained?: number | string | null;
  completed?: number | string | null;
  training_placed?: number | string | null;
  employed?: number | string | null;
  active_employment?: number | string | null;
  average_salary?: number | string | null;
  placement_rate?: number | string | null;
};

type DistrictSummary = {
  districts?: number | string | null;
  trained?: number | string | null;
  completed?: number | string | null;
  employed?: number | string | null;
  placement_rate?: number | string | null;
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

const formatSalary = (value: number | string | null | undefined): string => {
  const number = numberValue(value);

  if (number <= 0) {
    return "—";
  }

  return `₹${number.toLocaleString("en-IN")}`;
};

export default function Districts() {
  const [districts, setDistricts] = useState<DistrictAnalytics[]>([]);
  const [summary, setSummary] = useState<DistrictSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDistrictData = async () => {
    try {
      setLoading(true);
      setError("");

      const [districtData, summaryData] = await Promise.all([
        getDistricts(),
        getDistrictSummary(),
      ]);

      console.log("District API response:", districtData);
      console.log("District summary API response:", summaryData);

      setDistricts(
        Array.isArray(districtData)
          ? (districtData as DistrictAnalytics[])
          : [],
      );

      setSummary(
        summaryData && typeof summaryData === "object"
          ? (summaryData as DistrictSummary)
          : null,
      );
    } catch (err) {
      console.error("District analytics error:", err);
      setError("Unable to load district analytics from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDistrictData();
  }, []);

  const sortedDistricts = useMemo(() => {
    return [...districts].sort((a, b) => {
      return numberValue(b.placement_rate) - numberValue(a.placement_rate);
    });
  }, [districts]);

  const highestPlacementDistrict = sortedDistricts[0];

  const averageSalary = useMemo(() => {
    if (!districts.length) {
      return 0;
    }

    const districtsWithSalary = districts.filter(
      (district) => numberValue(district.average_salary) > 0,
    );

    if (!districtsWithSalary.length) {
      return 0;
    }

    const total = districtsWithSalary.reduce(
      (sum, district) => sum + numberValue(district.average_salary),
      0,
    );

    return Math.round(total / districtsWithSalary.length);
  }, [districts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Regional intelligence</p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
            District Performance
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Live district-level training, employment and placement analytics
            powered by PostgreSQL.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDistrictData}
          disabled={loading}
          className="btn-secondary"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Analytics
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">
              Districts
            </span>

            <MapPin size={19} className="text-teal-600" />
          </div>

          <p className="mt-3 text-3xl font-black text-slate-900">
            {formatNumber(summary?.districts)}
          </p>

          <p className="mt-1 text-xs text-slate-500">Covered in current data</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">
              Trained
            </span>

            <Users size={19} className="text-blue-600" />
          </div>

          <p className="mt-3 text-3xl font-black text-slate-900">
            {formatNumber(summary?.trained)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Total training enrolments
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">
              Completed
            </span>

            <TrendingUp size={19} className="text-emerald-600" />
          </div>

          <p className="mt-3 text-3xl font-black text-slate-900">
            {formatNumber(summary?.completed)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Completed training records
          </p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">
              Employed
            </span>

            <BriefcaseBusiness size={19} className="text-violet-600" />
          </div>

          <p className="mt-3 text-3xl font-black text-slate-900">
            {formatNumber(summary?.employed)}
          </p>

          <p className="mt-1 text-xs text-slate-500">Employment outcomes</p>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500">
              Placement Rate
            </span>

            <TrendingUp size={19} className="text-orange-600" />
          </div>

          <p className="mt-3 text-3xl font-black text-slate-900">
            {numberValue(summary?.placement_rate)}%
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Overall training placement
          </p>
        </div>
      </div>

      {/* District Analytics */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-black text-slate-900">
            District Analytics
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Compare training completion, employment and salary outcomes across
            districts.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading district analytics...
            </div>
          </div>
        ) : sortedDistricts.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center">
            <MapPin size={38} className="text-slate-300" />

            <h3 className="mt-4 font-black text-slate-800">
              No district data available
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add training or employment records with district information.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-wide text-slate-500">
                    District
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Trained
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Completed
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Training Placed
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Employed
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Active
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Avg. Salary
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wide text-slate-500">
                    Placement Rate
                  </th>
                </tr>
              </thead>

              <tbody>
                {sortedDistricts.map((district, index) => {
                  const placementRate = numberValue(district.placement_rate);

                  return (
                    <tr
                      key={`${district.district || "district"}-${index}`}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                            <MapPin size={18} />
                          </div>

                          <div>
                            <p className="font-black text-slate-900">
                              {district.district || "Unknown District"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Regional outcome profile
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right font-bold text-slate-800">
                        {formatNumber(district.trained)}
                      </td>

                      <td className="px-6 py-5 text-right font-bold text-slate-800">
                        {formatNumber(district.completed)}
                      </td>

                      <td className="px-6 py-5 text-right font-bold text-slate-800">
                        {formatNumber(district.training_placed)}
                      </td>

                      <td className="px-6 py-5 text-right font-bold text-slate-800">
                        {formatNumber(district.employed)}
                      </td>

                      <td className="px-6 py-5 text-right">
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                          {formatNumber(district.active_employment)}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-right font-black text-slate-800">
                        {formatSalary(district.average_salary)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-teal-600"
                              style={{
                                width: `${Math.min(
                                  Math.max(placementRate, 0),
                                  100,
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="w-12 text-right text-sm font-black text-teal-700">
                            {placementRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Insights */}
      {!loading && sortedDistricts.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <TrendingUp size={21} />
              </div>

              <div>
                <p className="eyebrow">Regional insight</p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  District outcome snapshot
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {highestPlacementDistrict ? (
                    <>
                      The current dataset contains{" "}
                      <strong className="text-slate-800">
                        {highestPlacementDistrict.district ||
                          "an available district"}
                      </strong>{" "}
                      with a placement rate of{" "}
                      <strong className="text-slate-800">
                        {numberValue(highestPlacementDistrict.placement_rate)}%
                      </strong>
                      . The average salary across districts with salary records
                      is{" "}
                      <strong className="text-slate-800">
                        ₹{averageSalary.toLocaleString("en-IN")}
                      </strong>
                      .
                    </>
                  ) : (
                    "District outcome insights will appear when analytics data is available."
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <p className="eyebrow">Prototype integration</p>

            <h3 className="mt-2 text-lg font-black text-slate-900">
              Maharashtra Map
            </h3>

            <div className="mt-4 flex min-h-36 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="text-center">
                <MapPin className="mx-auto text-teal-600" size={32} />

                <p className="mt-2 text-sm font-bold text-slate-700">
                  Interactive district map
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Ready for Google Maps or district SVG integration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
