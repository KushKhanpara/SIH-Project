import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  IndianRupee,
  CheckCircle2,
  CircleAlert,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  createRetention,
  deleteRetention,
  getRetention,
  updateRetention,
  type CreateRetentionData,
  type RetentionCheckpoint,
  type RetentionStatus,
} from "../api/api";

type RetentionRecord = {
  id: number;
  candidate_name: string;
  employer: string | null;
  checkpoint: RetentionCheckpoint;
  status: RetentionStatus;
  monthly_salary: number | null;
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
  created_at: string;
};

const initialForm: CreateRetentionData = {
  candidate_name: "",
  employer: "",
  checkpoint: "3M",
  status: "Pending",
  monthly_salary: null,
  verified_by: "",
  verified_at: "",
  notes: "",
};

export default function Retention() {
  const [records, setRecords] = useState<RetentionRecord[]>([]);

  const [loading, setLoading] = useState(true);

  const [apiError, setApiError] = useState("");

  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState<CreateRetentionData>(initialForm);

  /* =========================================================
     LOAD RETENTION
  ========================================================= */

  async function loadRetention() {
    try {
      setLoading(true);
      setApiError("");

      const data = await getRetention();

      setRecords(data);
    } catch (error) {
      console.error("Retention API error:", error);

      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to load retention records.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRetention();
  }, []);

  /* =========================================================
     FORM HANDLERS
  ========================================================= */

  function handleChange(field: keyof CreateRetentionData, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]:
        field === "monthly_salary"
          ? value === ""
            ? null
            : Number(value)
          : value,
    }));
  }

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  }

  function openAddForm() {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
    setSuccess("");
    setApiError("");
  }

  function openEditForm(record: RetentionRecord) {
    setForm({
      candidate_name: record.candidate_name,
      employer: record.employer || "",
      checkpoint: record.checkpoint,
      status: record.status,
      monthly_salary: record.monthly_salary,
      verified_by: record.verified_by || "",
      verified_at: record.verified_at || "",
      notes: record.notes || "",
    });

    setEditingId(record.id);
    setShowForm(true);
    setSuccess("");
    setApiError("");
  }

  /* =========================================================
     CREATE / UPDATE
  ========================================================= */

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    setApiError("");
    setSuccess("");

    if (!form.candidate_name.trim()) {
      setApiError("Candidate name is required.");
      return;
    }

    if (!form.checkpoint) {
      setApiError("Please select a checkpoint.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId !== null) {
        await updateRetention(editingId, form);

        setSuccess("Retention checkpoint updated successfully.");
      } else {
        await createRetention(form);

        setSuccess("Retention checkpoint added successfully.");
      }

      resetForm();

      await loadRetention();
    } catch (error) {
      console.error("Retention save error:", error);

      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to save retention checkpoint.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================================================
     DELETE
  ========================================================= */

  async function handleDelete(record: RetentionRecord) {
    const confirmed = window.confirm(
      `Delete the ${record.checkpoint} retention checkpoint for ${record.candidate_name}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(record.id);
      setApiError("");
      setSuccess("");

      await deleteRetention(record.id);

      setSuccess("Retention checkpoint deleted successfully.");

      await loadRetention();
    } catch (error) {
      console.error("Delete retention error:", error);

      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to delete retention checkpoint.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =========================================================
     CALCULATIONS
  ========================================================= */

  const completed = records.filter(
    (record) => record.status === "Completed",
  ).length;

  const pending = records.filter(
    (record) => record.status === "Pending",
  ).length;

  const failed = records.filter((record) => record.status === "Failed").length;

  const latestCompleted = [...records]
    .filter((record) => record.status === "Completed")
    .sort((a, b) => {
      const dateA = a.verified_at ? new Date(a.verified_at).getTime() : 0;

      const dateB = b.verified_at ? new Date(b.verified_at).getTime() : 0;

      return dateB - dateA;
    });

  const candidates = [
    ...new Set(records.map((record) => record.candidate_name)),
  ];

  const latestCandidate = records.length > 0 ? records[0].candidate_name : "";

  /* =========================================================
     FORMATTERS
  ========================================================= */

  function formatSalary(salary: number | null) {
    if (salary === null || salary === undefined || Number(salary) === 0) {
      return "-";
    }

    return `₹${Number(salary).toLocaleString("en-IN")}`;
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getCheckpointDescription(checkpoint: string) {
    if (checkpoint === "3M") {
      return "Initial employment verification";
    }

    if (checkpoint === "6M") {
      return "Medium-term retention check";
    }

    return "Long-term employment outcome";
  }

  function getCheckpointRecord(checkpoint: RetentionCheckpoint) {
    if (!latestCandidate) {
      return undefined;
    }

    return records.find(
      (record) =>
        record.checkpoint === checkpoint &&
        record.candidate_name === latestCandidate,
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="eyebrow">Longitudinal outcomes</p>

          <h1 className="mt-2 text-3xl font-black">Retention & Follow-ups</h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            Track employment after placement through 3-month, 6-month and
            12-month verification checkpoints.
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
        >
          <Plus size={18} />
          Add Checkpoint
        </button>
      </div>

      {/* MESSAGES */}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {success}
        </div>
      )}

      {apiError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {apiError}
        </div>
      )}

      {!loading && !apiError && records.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Retention records loaded from PostgreSQL
        </div>
      )}

      {/* FORM */}

      {showForm && (
        <div className="card p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="eyebrow">
                {editingId !== null ? "Edit record" : "New follow-up"}
              </p>

              <h2 className="mt-1 text-xl font-black">
                {editingId !== null
                  ? "Edit Retention Checkpoint"
                  : "Add Retention Checkpoint"}
              </h2>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            {/* CANDIDATE */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Candidate Name *
              </label>

              <input
                type="text"
                value={form.candidate_name}
                onChange={(event) =>
                  handleChange("candidate_name", event.target.value)
                }
                placeholder="e.g. Rahul Patil"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* EMPLOYER */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Employer
              </label>

              <input
                type="text"
                value={form.employer}
                onChange={(event) =>
                  handleChange("employer", event.target.value)
                }
                placeholder="e.g. Tech Solutions Pvt Ltd"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* CHECKPOINT */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Checkpoint *
              </label>

              <select
                value={form.checkpoint}
                onChange={(event) =>
                  handleChange("checkpoint", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                <option value="3M">3 Months</option>

                <option value="6M">6 Months</option>

                <option value="12M">12 Months</option>
              </select>
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Status
              </label>

              <select
                value={form.status}
                onChange={(event) => handleChange("status", event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              >
                <option value="Pending">Pending</option>

                <option value="Completed">Completed</option>

                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* SALARY */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Monthly Salary
              </label>

              <input
                type="number"
                min="0"
                value={form.monthly_salary ?? ""}
                onChange={(event) =>
                  handleChange("monthly_salary", event.target.value)
                }
                placeholder="e.g. 32000"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* VERIFIED BY */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Verified By
              </label>

              <input
                type="text"
                value={form.verified_by}
                onChange={(event) =>
                  handleChange("verified_by", event.target.value)
                }
                placeholder="e.g. HR - Tech Solutions"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* VERIFIED DATE */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Verification Date
              </label>

              <input
                type="date"
                value={form.verified_at}
                onChange={(event) =>
                  handleChange("verified_at", event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* NOTES */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Notes
              </label>

              <textarea
                value={form.notes}
                onChange={(event) => handleChange("notes", event.target.value)}
                rows={3}
                placeholder="Add follow-up notes..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            {/* BUTTONS */}

            <div className="flex gap-3 md:col-span-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Checkpoint"
                    : "Save Checkpoint"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* KPI CARDS */}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <CheckCircle2 className="text-emerald-600" />

          <p className="mt-3 text-sm text-slate-500">Completed follow-ups</p>

          <b className="text-3xl">{loading ? "..." : completed}</b>
        </div>

        <div className="card p-5">
          <Clock3 className="text-amber-600" />

          <p className="mt-3 text-sm text-slate-500">Pending follow-ups</p>

          <b className="text-3xl">{loading ? "..." : pending}</b>
        </div>

        <div className="card p-5">
          <CircleAlert className="text-rose-600" />

          <p className="mt-3 text-sm text-slate-500">Failed checkpoints</p>

          <b className="text-3xl">{loading ? "..." : failed}</b>
        </div>
      </div>

      {/* RETENTION TIMELINE */}

      <div className="card p-6">
        <div className="flex items-center gap-2">
          <BriefcaseBusiness size={19} className="text-teal-600" />

          <div>
            <p className="eyebrow">Longitudinal tracking</p>

            <h2 className="font-black">Employment verification journey</h2>
          </div>
        </div>

        {latestCandidate ? (
          <p className="mt-3 text-sm text-slate-500">
            Showing checkpoint journey for{" "}
            <span className="font-bold text-slate-800">{latestCandidate}</span>
          </p>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            Add a retention record to see the employment journey.
          </p>
        )}

        <div className="mt-8">
          <div className="relative">
            <div className="absolute left-6 right-6 top-6 hidden h-1 bg-slate-100 md:block" />

            <div className="grid gap-8 md:grid-cols-3">
              {(["3M", "6M", "12M"] as RetentionCheckpoint[]).map(
                (checkpoint) => {
                  const checkpointRecord = getCheckpointRecord(checkpoint);

                  const isCompleted = checkpointRecord?.status === "Completed";

                  const isFailed = checkpointRecord?.status === "Failed";

                  return (
                    <div key={checkpoint} className="relative">
                      <div
                        className={`relative z-10 grid h-12 w-12 place-items-center rounded-full border-4 border-white ${
                          isCompleted
                            ? "bg-emerald-500 text-white"
                            : isFailed
                              ? "bg-rose-500 text-white"
                              : "bg-amber-400 text-white"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={21} />
                        ) : isFailed ? (
                          <CircleAlert size={21} />
                        ) : (
                          <Clock3 size={21} />
                        )}
                      </div>

                      <div className="mt-4">
                        <p className="text-lg font-black">{checkpoint}</p>

                        <p className="mt-1 text-xs text-slate-500">
                          {getCheckpointDescription(checkpoint)}
                        </p>

                        <span
                          className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700"
                              : isFailed
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {checkpointRecord?.status || "Pending"}
                        </span>

                        {checkpointRecord?.monthly_salary && (
                          <p className="mt-2 text-xs font-semibold text-slate-500">
                            {formatSalary(checkpointRecord.monthly_salary)} /
                            month
                          </p>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOLLOW-UP TABLE */}

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="eyebrow">Follow-up records</p>

            <h2 className="mt-1 font-black">
              Employment retention checkpoints
            </h2>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-50 px-4 py-2 text-sm font-bold text-teal-700 transition hover:bg-teal-100"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Candidate</th>

                <th className="px-5 py-4">Employer</th>

                <th className="px-5 py-4">Checkpoint</th>

                <th className="px-5 py-4">Salary</th>

                <th className="px-5 py-4">Verification</th>

                <th className="px-5 py-4">Status</th>

                <th className="px-5 py-4">Notes</th>

                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading retention records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No retention records found.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-bold">
                      {record.candidate_name}
                    </td>

                    <td className="px-5 py-4">{record.employer || "-"}</td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black">
                        {record.checkpoint}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatSalary(record.monthly_salary)}
                    </td>

                    <td className="px-5 py-4">
                      {record.verified_at ? (
                        <div>
                          <p className="font-semibold">
                            {formatDate(record.verified_at)}
                          </p>

                          <p className="text-xs text-slate-400">
                            {record.verified_by || "Verified"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Pending</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          record.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : record.status === "Failed"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-xs text-slate-500">
                      {record.notes || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(record)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => handleDelete(record)}
                          disabled={deletingId === record.id}
                          className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WAGE PROGRESSION */}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-2 text-teal-700">
              <IndianRupee />
            </div>

            <div>
              <p className="eyebrow">Wage progression</p>

              <h2 className="mt-1 text-lg font-black">
                Track income changes over time
              </h2>
            </div>
          </div>

          {latestCompleted.length > 0 ? (
            <div className="mt-5">
              <p className="text-sm text-slate-500">Latest verified salary</p>

              <p className="mt-1 text-3xl font-black">
                {formatSalary(latestCompleted[0].monthly_salary)}

                <span className="ml-2 text-sm font-medium text-slate-400">
                  / month
                </span>
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Verified during {latestCompleted[0].checkpoint} checkpoint on{" "}
                {formatDate(latestCompleted[0].verified_at)}
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              No completed wage verification is available yet.
            </p>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <BadgeCheck />
            </div>

            <div>
              <p className="eyebrow">Verification</p>

              <h2 className="mt-1 text-lg font-black">
                Employer-confirmed outcomes
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-6 text-slate-500">
            Completed checkpoints represent employment information that has been
            verified by the recorded employer contact. Pending checkpoints can
            be followed up through the notification layer in a production
            deployment.
          </p>
        </div>
      </div>
    </div>
  );
}
