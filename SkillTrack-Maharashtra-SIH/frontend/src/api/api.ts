const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/* =========================================================
   DASHBOARD
========================================================= */

export async function getDashboard() {
  const response = await fetch(`${API_URL}/dashboard`);

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }

  return response.json();
}

/* =========================================================
   SKILLS
========================================================= */

export async function getSkills() {
  const response = await fetch(`${API_URL}/skills`);

  if (!response.ok) {
    throw new Error("Failed to fetch skills");
  }

  return response.json();
}

/* =========================================================
   EMPLOYMENT
========================================================= */

export async function getEmployment() {
  const response = await fetch(`${API_URL}/employment`);

  if (!response.ok) {
    throw new Error("Failed to fetch employment data");
  }

  return response.json();
}

export type CreateEmploymentData = {
  trainee_name: string;
  employer: string;
  job_title: string;
  district: string;
  salary: number | null;
  joining_date: string;
  status: string;
};

export type UpdateEmploymentData = CreateEmploymentData;

export async function createEmployment(data: CreateEmploymentData) {
  const response = await fetch(`${API_URL}/employment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create employment record");
  }

  return result;
}

export async function updateEmployment(id: number, data: UpdateEmploymentData) {
  const response = await fetch(`${API_URL}/employment/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update employment record");
  }

  return result;
}

export async function deleteEmployment(id: number) {
  const response = await fetch(`${API_URL}/employment/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete employment record");
  }

  return result;
}

/* =========================================================
   TRAINING
========================================================= */

export async function getTraining() {
  const response = await fetch(`${API_URL}/training`);

  if (!response.ok) {
    throw new Error("Failed to fetch training data");
  }

  return response.json();
}

export type CreateTrainingData = {
  title: string;
  provider: string;
  district: string;
  enrolled: number;
  completed: number;
  placed: number;
};

export type UpdateTrainingData = CreateTrainingData;

export async function createTraining(data: CreateTrainingData) {
  const response = await fetch(`${API_URL}/training`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create training program");
  }

  return result;
}

export async function updateTraining(id: number, data: UpdateTrainingData) {
  const response = await fetch(`${API_URL}/training/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update training program");
  }

  return result;
}

export async function deleteTraining(id: number) {
  const response = await fetch(`${API_URL}/training/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete training program");
  }

  return result;
}

/* =========================================================
   CANDIDATES
========================================================= */

export async function getCandidates() {
  const response = await fetch(`${API_URL}/candidates`);

  if (!response.ok) {
    throw new Error("Failed to fetch candidates");
  }

  return response.json();
}

export type CandidateSkill = {
  skill_name: string;
  proficiency: number;
};

export type CreateCandidateData = {
  name: string;
  email: string;
  district: string;
  skills: CandidateSkill[];
};

export type UpdateCandidateData = CreateCandidateData;

export async function createCandidate(data: CreateCandidateData) {
  const response = await fetch(`${API_URL}/candidates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create candidate");
  }

  return result;
}

export async function updateCandidate(id: number, data: UpdateCandidateData) {
  const response = await fetch(`${API_URL}/candidates/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update candidate");
  }

  return result;
}

export async function deleteCandidate(id: number) {
  const response = await fetch(`${API_URL}/candidates/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete candidate");
  }

  return result;
}

/* =========================================================
   RETENTION
========================================================= */

export type RetentionStatus = "Pending" | "Completed" | "Failed";

export type RetentionCheckpoint = "3M" | "6M" | "12M";

export type CreateRetentionData = {
  candidate_name: string;
  employer: string;
  checkpoint: RetentionCheckpoint;
  status: RetentionStatus;
  monthly_salary: number | null;
  verified_by: string;
  verified_at: string;
  notes: string;
};

export type UpdateRetentionData = CreateRetentionData;

export async function getRetention() {
  const response = await fetch(`${API_URL}/retention`);

  if (!response.ok) {
    throw new Error("Failed to fetch retention data");
  }

  return response.json();
}

export async function createRetention(data: CreateRetentionData) {
  const response = await fetch(`${API_URL}/retention`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create retention checkpoint");
  }

  return result;
}

export async function updateRetention(id: number, data: UpdateRetentionData) {
  const response = await fetch(`${API_URL}/retention/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update retention checkpoint");
  }

  return result;
}

export async function deleteRetention(id: number) {
  const response = await fetch(`${API_URL}/retention/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete retention checkpoint");
  }

  return result;
}

/* =========================================================
   DISTRICT ANALYTICS
========================================================= */

export async function getDistricts() {
  const response = await fetch(`${API_URL}/districts`);

  if (!response.ok) {
    throw new Error("Failed to fetch district analytics");
  }

  return response.json();
}

export async function getDistrictSummary() {
  const response = await fetch(`${API_URL}/districts/summary`);

  if (!response.ok) {
    throw new Error("Failed to fetch district summary");
  }

  return response.json();
}
