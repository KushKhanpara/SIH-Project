import {
  GraduationCap,
  Plus,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createTraining, deleteTraining, getTraining } from "../api/api";

type TrainingProgram = {
  id: number;
  title: string;
  provider: string;
  district: string;
  enrolled: number;
  completed: number;
  placed: number;
};

export default function Training() {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] = useState("");

  const [title, setTitle] = useState("");

  const [provider, setProvider] = useState("");

  const [district, setDistrict] = useState("");

  const [enrolled, setEnrolled] = useState("");

  const [completed, setCompleted] = useState("");

  const [placed, setPlaced] = useState("");

  /* =========================
     LOAD TRAINING
  ========================= */

  const loadTraining = async () => {
    try {
      setLoading(true);
      setApiError(false);

      const data = await getTraining();

      console.log("Training API data:", data);

      setPrograms(data);
    } catch (error) {
      console.error("Training API error:", error);

      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTraining();
  }, []);

  /* =========================
     RESET FORM
  ========================= */

  const resetForm = () => {
    setTitle("");
    setProvider("");
    setDistrict("");
    setEnrolled("");
    setCompleted("");
    setPlaced("");
    setFormError("");
  };

  /* =========================
     CREATE TRAINING
  ========================= */

  const handleCreateTraining = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError("");

    if (!title.trim()) {
      setFormError("Training program title is required.");
      return;
    }

    if (!provider.trim()) {
      setFormError("Training provider is required.");
      return;
    }

    const enrolledNumber = Number(enrolled || 0);

    const completedNumber = Number(completed || 0);

    const placedNumber = Number(placed || 0);

    if (
      !Number.isInteger(enrolledNumber) ||
      !Number.isInteger(completedNumber) ||
      !Number.isInteger(placedNumber)
    ) {
      setFormError(
        "Please enter whole numbers for enrolment, completion and placement.",
      );
      return;
    }

    if (enrolledNumber < 0 || completedNumber < 0 || placedNumber < 0) {
      setFormError("Numbers cannot be negative.");
      return;
    }

    if (completedNumber > enrolledNumber) {
      setFormError("Completed candidates cannot exceed enrolled candidates.");
      return;
    }

    if (placedNumber > completedNumber) {
      setFormError("Placed candidates cannot exceed completed candidates.");
      return;
    }

    try {
      setSaving(true);

      await createTraining({
        title: title.trim(),
        provider: provider.trim(),
        district: district.trim(),
        enrolled: enrolledNumber,
        completed: completedNumber,
        placed: placedNumber,
      });

      resetForm();
      setShowForm(false);

      await loadTraining();
    } catch (error) {
      console.error("Create training error:", error);

      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to create training program.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================
     DELETE TRAINING
  ========================= */

  const handleDeleteTraining = async (program: TrainingProgram) => {
    const confirmed = window.confirm(
      `Delete training program "${program.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTraining(program.id);

      await loadTraining();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to delete training program.",
      );
    }
  };

  /* =========================
     CALCULATIONS
  ========================= */

  const activePrograms = programs.length;

  const totalEnrolled = programs.reduce(
    (total, program) => total + Number(program.enrolled || 0),
    0,
  );

  const totalCompleted = programs.reduce(
    (total, program) => total + Number(program.completed || 0),
    0,
  );

  const totalPlaced = programs.reduce(
    (total, program) => total + Number(program.placed || 0),
    0,
  );

  const completionRate =
    totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0;

  const placementRate =
    totalEnrolled > 0 ? Math.round((totalPlaced / totalEnrolled) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Training providers</p>

          <h1 className="mt-2 text-3xl font-black">Training Programs</h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor enrolment, completion and placement performance.
            {loading
              ? " Loading database records..."
              : apiError
                ? " Backend unavailable."
                : " Live PostgreSQL data."}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
        >
          <Plus size={18} />
          Add Training
        </button>
      </div>

      {/* ADD TRAINING FORM */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Training provider</p>

              <h2 className="mt-1 text-xl font-black">Add Training Program</h2>
            </div>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateTraining} className="mt-6 space-y-6">
            {/* BASIC DETAILS */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Program Title
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Full Stack Web Development"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Provider</label>

                <input
                  value={provider}
                  onChange={(event) => setProvider(event.target.value)}
                  placeholder="e.g. MSSDS"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">District</label>

                <input
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  placeholder="e.g. Pune"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* OUTCOME DATA */}
            <div>
              <h3 className="font-black">Training outcomes</h3>

              <p className="mt-1 text-xs text-slate-500">
                Enter the current program statistics.
              </p>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Enrolled
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={enrolled}
                    onChange={(event) => setEnrolled(event.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">
                    Completed
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={completed}
                    onChange={(event) => setCompleted(event.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold">Placed</label>

                  <input
                    type="number"
                    min="0"
                    value={placed}
                    onChange={(event) => setPlaced(event.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* ERROR */}
            {formError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {formError}
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Training"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <GraduationCap className="text-teal-600" />

          <p className="mt-3 text-sm text-slate-500">Active programs</p>

          <b className="text-3xl">
            {loading ? "..." : activePrograms.toLocaleString()}
          </b>
        </div>

        <div className="card p-5">
          <Users className="text-blue-600" />

          <p className="mt-3 text-sm text-slate-500">Enrolled</p>

          <b className="text-3xl">
            {loading ? "..." : totalEnrolled.toLocaleString()}
          </b>
        </div>

        <div className="card p-5">
          <TrendingUp className="text-emerald-600" />

          <p className="mt-3 text-sm text-slate-500">Completion rate</p>

          <b className="text-3xl">{loading ? "..." : `${completionRate}%`}</b>

          {!loading && (
            <p className="mt-1 text-xs text-slate-400">
              {totalCompleted.toLocaleString()} of{" "}
              {totalEnrolled.toLocaleString()} completed
            </p>
          )}
        </div>
      </div>

      {/* DATABASE STATUS */}
      {!loading && !apiError && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Training data loaded from PostgreSQL
          </div>

          <span className="text-xs font-bold text-emerald-600">
            Placement rate: {placementRate}%
          </span>
        </div>
      )}

      {/* PROGRAM TABLE */}
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <p className="eyebrow">Program performance</p>

          <h2 className="mt-1 font-extrabold">Training outcomes</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Program</th>

                <th className="px-5 py-4">Provider</th>

                <th className="px-5 py-4">District</th>

                <th className="px-5 py-4">Enrolled</th>

                <th className="px-5 py-4">Completed</th>

                <th className="px-5 py-4">Placed</th>

                <th className="px-5 py-4">Completion</th>

                <th className="px-5 py-4">Placement</th>

                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Loading training programs from PostgreSQL...
                  </td>
                </tr>
              ) : programs.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No training programs found.
                  </td>
                </tr>
              ) : (
                programs.map((program) => {
                  const enrolled = Number(program.enrolled || 0);

                  const completed = Number(program.completed || 0);

                  const placed = Number(program.placed || 0);

                  const programCompletion =
                    enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;

                  const programPlacement =
                    enrolled > 0 ? Math.round((placed / enrolled) * 100) : 0;

                  return (
                    <tr key={program.id} className="border-t border-slate-100">
                      <td className="px-5 py-4 font-bold">{program.title}</td>

                      <td className="px-5 py-4">{program.provider}</td>

                      <td className="px-5 py-4">{program.district || "-"}</td>

                      <td className="px-5 py-4">{enrolled.toLocaleString()}</td>

                      <td className="px-5 py-4">
                        {completed.toLocaleString()}
                      </td>

                      <td className="px-5 py-4 font-bold text-teal-700">
                        {placed.toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`pill ${
                            programCompletion >= 70
                              ? "bg-emerald-50 text-emerald-700"
                              : programCompletion >= 50
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {programCompletion}%
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`pill ${
                            programPlacement >= 50
                              ? "bg-emerald-50 text-emerald-700"
                              : programPlacement >= 30
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {programPlacement}%
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDeleteTraining(program)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                          title="Delete training program"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OUTCOME SUMMARY */}
      {!loading && programs.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          <div className="card p-6">
            <p className="eyebrow">Training outcome</p>

            <h2 className="mt-2 text-2xl font-black">
              {totalCompleted.toLocaleString()} candidates completed training
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Across {activePrograms} training programs, the overall completion
              rate is <strong>{completionRate}%</strong>.
            </p>
          </div>

          <div className="card p-6">
            <p className="eyebrow">Employment outcome</p>

            <h2 className="mt-2 text-2xl font-black">
              {totalPlaced.toLocaleString()} candidates placed
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              The current dataset shows an overall placement rate of{" "}
              <strong>{placementRate}%</strong> against total enrolment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
