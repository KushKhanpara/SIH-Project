import {
  Award,
  BriefcaseBusiness,
  Mail,
  MapPin,
  Plus,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createCandidate, deleteCandidate, getCandidates } from "../api/api";

type CandidateSkill = {
  skill_name: string;
  proficiency: number;
};

type Employment = {
  employer: string;
  job_title: string;
  district: string;
  salary: number;
  joining_date: string;
  status: string;
};

type Candidate = {
  id: number;
  name: string;
  email: string;
  district: string;
  created_at: string;
  skills: CandidateSkill[];
  employment: Employment | null;
};

type SkillInput = {
  skill_name: string;
  proficiency: number;
};

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");

  const [skills, setSkills] = useState<SkillInput[]>([
    {
      skill_name: "",
      proficiency: 50,
    },
  ]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      setApiError(false);

      const data = await getCandidates();

      setCandidates(data);

      setSelectedCandidate((current) => {
        if (current) {
          const updated = data.find(
            (candidate: Candidate) => candidate.id === current.id,
          );

          return updated || data[0] || null;
        }

        return data[0] || null;
      });
    } catch (error) {
      console.error("Candidates API error:", error);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandidates();
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setDistrict("");

    setSkills([
      {
        skill_name: "",
        proficiency: 50,
      },
    ]);

    setFormError("");
  };

  const addSkill = () => {
    setSkills([
      ...skills,
      {
        skill_name: "",
        proficiency: 50,
      },
    ]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, skillIndex) => skillIndex !== index));
  };

  const updateSkill = (
    index: number,
    field: keyof SkillInput,
    value: string | number,
  ) => {
    setSkills(
      skills.map((skill, skillIndex) =>
        skillIndex === index
          ? {
              ...skill,
              [field]: value,
            }
          : skill,
      ),
    );
  };

  const handleCreateCandidate = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError("");

    if (!name.trim() || !email.trim() || !district.trim()) {
      setFormError("Please fill in name, email and district.");
      return;
    }

    const validSkills = skills.filter(
      (skill) => skill.skill_name.trim() !== "",
    );

    try {
      setSaving(true);

      await createCandidate({
        name: name.trim(),
        email: email.trim(),
        district: district.trim(),
        skills: validSkills,
      });

      resetForm();
      setShowForm(false);

      await loadCandidates();
    } catch (error) {
      console.error("Create candidate error:", error);

      setFormError(
        error instanceof Error ? error.message : "Unable to create candidate.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    const confirmed = window.confirm(`Delete candidate "${candidate.name}"?`);

    if (!confirmed) return;

    try {
      await deleteCandidate(candidate.id);

      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate(null);
      }

      await loadCandidates();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Unable to delete candidate.",
      );
    }
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return "-";

    return `₹${Number(salary).toLocaleString("en-IN")}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (candidateName: string) => {
    return candidateName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getRecommendedSkills = (candidateSkills: CandidateSkill[]) => {
    const skillNames = candidateSkills.map((skill) =>
      skill.skill_name.toLowerCase(),
    );

    const recommendations: string[] = [];

    if (
      skillNames.some((skill) => skill.includes("react")) &&
      !skillNames.some((skill) => skill.includes("aws"))
    ) {
      recommendations.push("AWS Fundamentals");
    }

    if (
      skillNames.some((skill) => skill.includes("javascript")) &&
      !skillNames.some((skill) => skill.includes("react"))
    ) {
      recommendations.push("React Development");
    }

    if (
      skillNames.some((skill) => skill.includes("php")) &&
      !skillNames.some((skill) => skill.includes("cloud"))
    ) {
      recommendations.push("Cloud Fundamentals");
    }

    if (recommendations.length === 0) {
      recommendations.push("Advanced Cloud", "Data Analytics");
    }

    return recommendations.slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Trainee portal</p>

          <h1 className="mt-2 text-3xl font-black">Candidate Profiles</h1>

          <p className="mt-2 text-sm text-slate-500">
            Track training, skills, certificates and employment outcomes.
            {loading
              ? " Loading candidates..."
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
          Add Candidate
        </button>
      </div>

      {/* DATABASE STATUS */}
      {!loading && !apiError && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Candidate profiles loaded from PostgreSQL
        </div>
      )}

      {/* ADD CANDIDATE FORM */}
      {showForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Trainee registration</p>

              <h2 className="mt-1 text-xl font-black">Add New Candidate</h2>
            </div>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateCandidate} className="mt-6 space-y-6">
            {/* BASIC DETAILS */}
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-bold">
                  Full Name
                </label>

                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Priya Shah"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">Email</label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold">District</label>

                <input
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  placeholder="e.g. Ahmedabad"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* SKILLS */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black">Skills</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Add skills and current proficiency levels.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addSkill}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  <Plus size={15} />
                  Add Skill
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 md:grid-cols-[1fr_180px_auto]"
                  >
                    <input
                      value={skill.skill_name}
                      onChange={(event) =>
                        updateSkill(index, "skill_name", event.target.value)
                      }
                      placeholder="e.g. JavaScript"
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-teal-500"
                    />

                    <div>
                      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-500">
                        <span>Proficiency</span>
                        <span>{skill.proficiency}%</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.proficiency}
                        onChange={(event) =>
                          updateSkill(
                            index,
                            "proficiency",
                            Number(event.target.value),
                          )
                        }
                        className="w-full accent-teal-600"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      disabled={skills.length === 1}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
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
                {saving ? "Saving..." : "Save Candidate"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CANDIDATE LIST */}
      {loading ? (
        <div className="card p-10 text-center text-slate-500">
          Loading candidate profiles...
        </div>
      ) : candidates.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          No trainee profiles found.
        </div>
      ) : (
        <>
          {/* CANDIDATE SELECTOR */}
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Candidates
              </p>

              <span className="text-xs font-semibold text-slate-400">
                {candidates.length} total
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`flex items-center gap-1 rounded-xl ${
                    selectedCandidate?.id === candidate.id
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <button
                    onClick={() => setSelectedCandidate(candidate)}
                    className="rounded-xl px-4 py-2 text-sm font-bold"
                  >
                    {candidate.name}
                  </button>

                  <button
                    onClick={() => handleDeleteCandidate(candidate)}
                    className="mr-1 rounded-lg p-1.5 hover:bg-black/10"
                    title="Delete candidate"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {selectedCandidate && (
            <div className="grid gap-5 lg:grid-cols-3">
              {/* PROFILE CARD */}
              <div className="card p-6 lg:col-span-1">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-teal-50 text-2xl font-black text-teal-700">
                  {getInitials(selectedCandidate.name)}
                </div>

                <h2 className="mt-4 text-xl font-black">
                  {selectedCandidate.name}
                </h2>

                <p className="text-sm text-slate-500">
                  Trainee • {selectedCandidate.district || "Maharashtra"}
                </p>

                <div className="mt-5 space-y-3 text-sm">
                  <p className="flex gap-2">
                    <Mail size={16} />
                    {selectedCandidate.email}
                  </p>

                  <p className="flex gap-2">
                    <MapPin size={16} />
                    {selectedCandidate.district || "Maharashtra"}, Maharashtra
                  </p>

                  {selectedCandidate.skills.length > 0 && (
                    <p className="flex gap-2">
                      <Award size={16} />
                      {selectedCandidate.skills[0].skill_name}
                    </p>
                  )}
                </div>

                {/* EMPLOYMENT STATUS */}
                {selectedCandidate.employment && (
                  <div className="mt-5">
                    <span
                      className={`inline-flex pill ${
                        selectedCandidate.employment.status?.toLowerCase() ===
                        "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {selectedCandidate.employment.status === "Active"
                        ? "Employed • Verified"
                        : selectedCandidate.employment.status}
                    </span>
                  </div>
                )}

                {/* EMPLOYMENT DETAILS */}
                {selectedCandidate.employment && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness size={16} className="text-teal-600" />

                      <p className="text-sm font-bold">Current employment</p>
                    </div>

                    <p className="mt-2 text-sm font-semibold">
                      {selectedCandidate.employment.job_title}
                    </p>

                    <p className="text-xs text-slate-500">
                      {selectedCandidate.employment.employer}
                    </p>

                    <div className="mt-3 flex justify-between text-xs">
                      <span className="text-slate-500">Salary</span>

                      <b>{formatSalary(selectedCandidate.employment.salary)}</b>
                    </div>

                    <div className="mt-1 flex justify-between text-xs">
                      <span className="text-slate-500">Joined</span>

                      <b>
                        {formatDate(selectedCandidate.employment.joining_date)}
                      </b>
                    </div>
                  </div>
                )}
              </div>

              {/* SKILLS */}
              <div className="card p-6 lg:col-span-2">
                <div className="flex items-center gap-2">
                  <UserRound size={18} className="text-teal-600" />

                  <h2 className="font-black">Skill profile</h2>
                </div>

                {selectedCandidate.skills.length === 0 ? (
                  <p className="mt-5 text-sm text-slate-500">
                    No skill records available for this candidate.
                  </p>
                ) : (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {selectedCandidate.skills.map((skill) => (
                      <div key={skill.skill_name}>
                        <div className="mb-2 flex justify-between text-sm font-semibold">
                          <span>{skill.skill_name}</span>

                          <span className="text-slate-400">
                            {skill.proficiency}%
                          </span>
                        </div>

                        <div className="h-2 rounded-full bg-slate-100">
                          <div
                            className="h-2 rounded-full bg-teal-500"
                            style={{
                              width: `${skill.proficiency}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* RECOMMENDED SKILLS */}
                <div className="mt-7 rounded-2xl bg-amber-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Recommended next skills
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {getRecommendedSkills(selectedCandidate.skills).map(
                      (skill) => (
                        <span
                          key={skill}
                          className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm"
                        >
                          {skill}
                        </span>
                      ),
                    )}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-amber-800">
                    Recommendations are generated from the candidate's current
                    skill profile.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
