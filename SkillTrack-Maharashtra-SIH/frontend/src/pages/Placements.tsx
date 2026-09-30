import { useEffect, useState } from "react";
import {
  createEmployment,
  deleteEmployment,
  getEmployment,
  type CreateEmploymentData,
} from "../api/api";

type Employment = {
  id: number;
  trainee_name: string;
  employer: string;
  job_title: string;
  district: string;
  salary: number;
  joining_date: string;
  status: string;
};

const initialForm: CreateEmploymentData = {
  trainee_name: "",
  employer: "",
  job_title: "",
  district: "",
  salary: null,
  joining_date: "",
  status: "Active",
};

export default function Placements() {
  const [records, setRecords] = useState<Employment[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState<CreateEmploymentData>(initialForm);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* =========================================================
     LOAD EMPLOYMENT
  ========================================================= */

  async function loadEmployment() {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployment();

      setRecords(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load employment records.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployment();
  }, []);

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  function handleChange(field: keyof CreateEmploymentData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]:
        field === "salary" ? (value === "" ? null : Number(value)) : value,
    }));
  }

  /* =========================================================
     CREATE EMPLOYMENT
  ========================================================= */

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.trainee_name.trim() ||
      !form.employer.trim() ||
      !form.job_title.trim() ||
      !form.district.trim() ||
      !form.joining_date
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);

      await createEmployment(form);

      setSuccess("Employment record added successfully.");

      setForm(initialForm);
      setShowForm(false);

      await loadEmployment();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create employment record.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     DELETE EMPLOYMENT
  ========================================================= */

  async function handleDelete(id: number, candidateName: string) {
    const confirmed = window.confirm(
      `Delete employment record for ${candidateName}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await deleteEmployment(id);

      setSuccess("Employment record deleted successfully.");

      await loadEmployment();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete employment record.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const verifiedPlacements = records.filter(
    (record) => record.status === "Active",
  ).length;

  const activeEmployment = records.filter(
    (record) => record.status === "Active",
  ).length;

  const sixMonthEligible = records.filter((record) => {
    if (!record.joining_date) {
      return false;
    }

    const joiningDate = new Date(record.joining_date);

    const sixMonthsLater = new Date(joiningDate);

    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

    return new Date() >= sixMonthsLater;
  }).length;

  const averageSalary =
    records.length > 0
      ? Math.round(
          records.reduce((sum, record) => sum + Number(record.salary || 0), 0) /
            records.length,
        )
      : 0;

  /* =========================================================
     FORMATTERS
  ========================================================= */

  function formatSalary(salary: number) {
    if (!salary) {
      return "—";
    }

    return `₹${salary.toLocaleString("en-IN")}`;
  }

  function formatDate(date: string) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Placements & Employment
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track employment outcomes, salaries and placement status.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm((previous) => !previous);
            setError("");
            setSuccess("");
          }}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          {showForm ? "Close Form" : "+ Add Employment"}
        </button>
      </div>

      {/* SUCCESS MESSAGE */}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ADD EMPLOYMENT FORM */}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Add Employment Record
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Record a trainee's employment outcome after skilling.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* CANDIDATE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Candidate Name *
              </label>

              <input
                type="text"
                value={form.trainee_name}
                onChange={(event) =>
                  handleChange("trainee_name", event.target.value)
                }
                placeholder="e.g. Rahul Patil"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* EMPLOYER */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employer *
              </label>

              <input
                type="text"
                value={form.employer}
                onChange={(event) =>
                  handleChange("employer", event.target.value)
                }
                placeholder="e.g. Tech Solutions Pvt Ltd"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* JOB TITLE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Job Title *
              </label>

              <input
                type="text"
                value={form.job_title}
                onChange={(event) =>
                  handleChange("job_title", event.target.value)
                }
                placeholder="e.g. Software Developer"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* DISTRICT */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                District *
              </label>

              <select
                value={form.district}
                onChange={(event) =>
                  handleChange("district", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">Select district</option>

                <option value="Pune">Pune</option>

                <option value="Mumbai">Mumbai</option>

                <option value="Nagpur">Nagpur</option>

                <option value="Nashik">Nashik</option>

                <option value="Ahmednagar">Ahmednagar</option>

                <option value="Aurangabad">Aurangabad</option>

                <option value="Kolhapur">Kolhapur</option>

                <option value="Satara">Satara</option>

                <option value="Thane">Thane</option>

                <option value="Solapur">Solapur</option>
              </select>
            </div>

            {/* SALARY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Monthly Salary
              </label>

              <input
                type="number"
                min="0"
                value={form.salary ?? ""}
                onChange={(event) => handleChange("salary", event.target.value)}
                placeholder="e.g. 30000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* JOINING DATE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Joining Date *
              </label>

              <input
                type="date"
                value={form.joining_date}
                onChange={(event) =>
                  handleChange("joining_date", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Employment Status
              </label>

              <select
                value={form.status}
                onChange={(event) => handleChange("status", event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="Active">Active</option>

                <option value="Inactive">Inactive</option>

                <option value="Left">Left</option>
              </select>
            </div>

            {/* BUTTONS */}

            <div className="flex items-end gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save Employment"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setForm(initialForm);
                  setShowForm(false);
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STAT CARDS */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Placements</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {verifiedPlacements}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Recorded employment outcomes
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Employment
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {activeEmployment}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Currently active records
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">6M Eligible</p>

          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {sixMonthEligible}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Eligible for retention review
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Average Salary</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatSalary(averageSalary)}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Monthly salary across records
          </p>
        </div>
      </div>

      {/* EMPLOYMENT TABLE */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Employment Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Live employment records from PostgreSQL.
            </p>
          </div>

          <button
            onClick={loadEmployment}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Loading employment records...
          </div>
        ) : records.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
              📋
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No employment records
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Add an employment record to start tracking placements.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Candidate</th>

                  <th className="px-6 py-4 font-semibold">Employer</th>

                  <th className="px-6 py-4 font-semibold">Job Title</th>

                  <th className="px-6 py-4 font-semibold">District</th>

                  <th className="px-6 py-4 font-semibold">Salary</th>

                  <th className="px-6 py-4 font-semibold">Joining Date</th>

                  <th className="px-6 py-4 font-semibold">Status</th>

                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {records.map((record) => (
                  <tr key={record.id} className="transition hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {record.trainee_name}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">
                        {record.employer}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.job_title}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {record.district || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                      {formatSalary(Number(record.salary))}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(record.joining_date)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          record.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : record.status === "Inactive"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() =>
                          handleDelete(record.id, record.trainee_name)
                        }
                        disabled={deletingId === record.id}
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === record.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RETENTION EXPLANATION */}

      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
        <h2 className="text-lg font-bold text-indigo-950">
          Employment Outcome Tracking
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-indigo-900/80">
          SkillTrack Maharashtra uses employment records as the starting point
          for longitudinal outcome tracking. These records can later be
          connected with 3-month, 6-month and 12-month retention checkpoints to
          understand whether trainees remain employed and how their wages
          progress over time.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white/70 p-4">
            <p className="font-semibold text-indigo-950">Placement</p>

            <p className="mt-1 text-xs leading-5 text-indigo-900/70">
              Capture employer, role, district and joining date.
            </p>
          </div>

          <div className="rounded-xl bg-white/70 p-4">
            <p className="font-semibold text-indigo-950">Retention</p>

            <p className="mt-1 text-xs leading-5 text-indigo-900/70">
              Follow employment at 3M, 6M and 12M checkpoints.
            </p>
          </div>

          <div className="rounded-xl bg-white/70 p-4">
            <p className="font-semibold text-indigo-950">Wage Progression</p>

            <p className="mt-1 text-xs leading-5 text-indigo-900/70">
              Compare salary progression across employment checkpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
