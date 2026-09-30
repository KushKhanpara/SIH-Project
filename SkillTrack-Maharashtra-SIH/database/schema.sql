CREATE DATABASE skilltrack_maharashtra;

-- Connect to skilltrack_maharashtra before running the rest.

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    role VARCHAR(40) NOT NULL CHECK (role IN ('admin','trainee','provider','employer')),
    district VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    demand_count INTEGER DEFAULT 0,
    supply_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS training_programs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    provider VARCHAR(160) NOT NULL,
    district VARCHAR(100),
    enrolled INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    placed INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS employment_records (
    id SERIAL PRIMARY KEY,
    trainee_name VARCHAR(120) NOT NULL,
    employer VARCHAR(160) NOT NULL,
    job_title VARCHAR(160) NOT NULL,
    district VARCHAR(100),
    salary INTEGER,
    joining_date DATE,
    status VARCHAR(30) DEFAULT 'Active'
);

INSERT INTO skills (name, category, demand_count, supply_count) VALUES
('Python','Software',8500,3200),
('React','Software',6200,2100),
('AWS / Cloud','Cloud',4800,1200),
('Data Analytics','Data',5400,2900),
('Cybersecurity','Security',3900,1700),
('PHP / Laravel','Software',2800,4500)
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (name,email,role,district) VALUES
('Government Admin','admin@skilltrack.gov.in','admin','Mumbai'),
('Rahul Patil','rahul@example.com','trainee','Pune'),
('Maharashtra Skill Centre','provider@example.com','provider','Nashik'),
('ABC Technologies','employer@example.com','employer','Pune')
ON CONFLICT (email) DO NOTHING;

INSERT INTO training_programs(title,provider,district,enrolled,completed,placed) VALUES
('Full Stack Development','Maharashtra Skill Centre','Pune',420,376,252),
('Python & Data Analytics','Digital Skills Hub','Mumbai',360,318,214),
('Cloud Fundamentals','TechSkill Institute','Nagpur',260,224,138),
('Cybersecurity Essentials','Maha IT Academy','Nashik',210,188,121);

INSERT INTO employment_records(trainee_name,employer,job_title,district,salary,joining_date,status) VALUES
('Rahul Patil','ABC Technologies','Junior PHP Developer','Pune',25000,'2026-07-15','Active'),
('Priya Sharma','DataWorks Pvt Ltd','Data Analyst','Mumbai',30000,'2026-06-10','Active'),
('Amit Jadhav','CloudNova','Cloud Support Associate','Nagpur',28000,'2026-05-20','Active'),
('Sneha More','WebSpark Solutions','Frontend Developer','Nashik',27000,'2026-04-05','Active');
