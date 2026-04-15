-- Seed data for CourseReview.
-- Runs automatically on `npx supabase db reset`.
--
-- IMPORTANT: change the admin email on the final INSERT to your own
-- @umail.leidenuniv.nl address before testing.

-- ============================================================================
-- Courses (25 representative MSc CS courses, 2025-2026)
-- URL pattern: https://studiegids.universiteitleiden.nl/en/courses/{code}/{slug}
-- ============================================================================

insert into public.courses (code, title, description, studiegids_url, color, icon) values
  ('131600', 'Multimedia Systems',
   'Advanced multimedia data handling, compression, streaming and retrieval techniques.',
   'https://studiegids.universiteitleiden.nl/en/courses/131600/multimedia-systems',
   '#001158', 'layers'),
  ('131601', 'System and Software Security',
   'Principles of secure system design, vulnerability analysis, and mitigation strategies.',
   'https://studiegids.universiteitleiden.nl/en/courses/131601/system-and-software-security',
   '#001158', 'shield'),
  ('131602', 'Cloud Computing',
   'Architectures, virtualisation, container orchestration and cost models of cloud platforms.',
   'https://studiegids.universiteitleiden.nl/en/courses/131602/cloud-computing',
   '#0891b2', 'cloud'),
  ('131604', 'Embedded Systems and Software',
   'Designing real-time software for constrained hardware, from microcontrollers to DSPs.',
   'https://studiegids.universiteitleiden.nl/en/courses/131604/embedded-systems-and-software',
   '#334155', 'chip'),
  ('131605', 'High Performance Computing',
   'Parallel computing patterns, GPUs, message passing, and performance engineering.',
   'https://studiegids.universiteitleiden.nl/en/courses/131605/high-performance-computing',
   '#0c2577', 'zap'),
  ('131623', 'Distributed Systems',
   'Consensus, replication, fault tolerance and the CAP-theorem across distributed systems.',
   'https://studiegids.universiteitleiden.nl/en/courses/131623/distributed-systems',
   '#001158', 'network'),
  ('131526', 'Evolutionary Algorithms',
   'Nature-inspired optimisation: genetic algorithms, evolution strategies, and co-evolution.',
   'https://studiegids.universiteitleiden.nl/en/courses/131526/evolutionary-algorithms',
   '#15803d', 'workflow'),
  ('131395', 'Introduction to Deep Learning',
   'Neural network fundamentals, backprop, CNNs, RNNs and modern architectures with PyTorch.',
   'https://studiegids.universiteitleiden.nl/en/courses/131395/introduction-to-deep-learning',
   '#001158', 'brain'),
  ('131628', 'Modern Game AI Algorithms',
   'Monte Carlo Tree Search, self-play, minimax and deep RL applied to games.',
   'https://studiegids.universiteitleiden.nl/en/courses/131628/modern-game-ai-algorithms',
   '#9333ea', 'brain'),
  ('131396', 'Reinforcement Learning',
   'MDPs, policy gradients, Q-learning and deep RL with practical experiments.',
   'https://studiegids.universiteitleiden.nl/en/courses/131396/reinforcement-learning',
   '#2563eb', 'robot'),
  ('131525', 'Bio-Modeling',
   'Formal and computational modelling of biological systems and dynamics.',
   'https://studiegids.universiteitleiden.nl/en/courses/131525/bio-modeling',
   '#0f766e', 'dna'),
  ('131524', 'Image Analysis with Applications in Microscopy',
   'Image processing pipelines and segmentation for microscopy and biomedical imaging.',
   'https://studiegids.universiteitleiden.nl/en/courses/131524/image-analysis-with-applications-in-microscopy',
   '#0f766e', 'microscope'),
  ('131394', 'Advances in Data Mining',
   'Graph mining, streaming algorithms, similarity search and recommender systems.',
   'https://studiegids.universiteitleiden.nl/en/courses/131394/advances-in-data-mining',
   '#2563eb', 'chart'),
  ('131617', 'Text Mining',
   'NLP pipelines, topic modelling, embeddings and information extraction.',
   'https://studiegids.universiteitleiden.nl/en/courses/131617/text-mining',
   '#9333ea', 'book-open'),
  ('131371', 'Complex Networks',
   'Structure, dynamics and algorithms for large-scale real-world networks.',
   'https://studiegids.universiteitleiden.nl/en/courses/131371/complex-networks',
   '#001158', 'network'),
  ('131612', 'Quantum Algorithms',
   'Quantum circuits, Grover, Shor and NISQ-era algorithmic ideas.',
   'https://studiegids.universiteitleiden.nl/en/courses/131612/quantum-algorithms',
   '#0c2577', 'atom'),
  ('131609', 'Bayesian Optimization',
   'Gaussian processes, acquisition functions and surrogate-based optimisation.',
   'https://studiegids.universiteitleiden.nl/en/courses/131609/bayesian-optimization',
   '#15803d', 'chart'),
  ('131626', 'Information Retrieval',
   'Indexing, ranking, evaluation and modern neural IR systems.',
   'https://studiegids.universiteitleiden.nl/en/courses/131626/information-retrieval',
   '#2563eb', 'chart'),
  ('131630', 'Recommender Systems',
   'Collaborative and content-based filtering, matrix factorisation, evaluation pitfalls.',
   'https://studiegids.universiteitleiden.nl/en/courses/131630/recommender-systems',
   '#f46e32', 'chart'),
  ('131631', 'Robotics',
   'Kinematics, planning, perception and control for autonomous robots.',
   'https://studiegids.universiteitleiden.nl/en/courses/131631/robotics',
   '#334155', 'robot'),
  ('131603', 'Cryptographic Engineering',
   'Implementation security: side-channel attacks, fault attacks, and countermeasures.',
   'https://studiegids.universiteitleiden.nl/en/courses/131603/cryptographic-engineering',
   '#001158', 'lock'),
  ('131527', 'Multicriteria Optimization and Decision Analysis',
   'Pareto optimality, hypervolume metrics and multi-objective evolutionary methods.',
   'https://studiegids.universiteitleiden.nl/en/courses/131527/multicriteria-optimization-and-decision-analysis',
   '#15803d', 'workflow'),
  ('131608', 'Automated Machine Learning',
   'AutoML pipelines, hyperparameter optimisation and meta-learning.',
   'https://studiegids.universiteitleiden.nl/en/courses/131608/automated-machine-learning',
   '#0c2577', 'brain'),
  ('131610', 'Computational Creativity',
   'Generative systems, evaluation of creativity, and human-AI collaboration.',
   'https://studiegids.universiteitleiden.nl/en/courses/131610/computational-creativity',
   '#be185d', 'brain'),
  ('131394p', 'Seminar Artificial Intelligence',
   'Current research topics in AI presented by faculty and students.',
   'https://studiegids.universiteitleiden.nl/en/courses/131394/seminar-artificial-intelligence',
   '#001158', 'graduation')
on conflict (code) do update
set title         = excluded.title,
    description   = excluded.description,
    studiegids_url= excluded.studiegids_url;

-- ============================================================================
-- Course <-> Specialization mapping
-- Role is 'core' if the course is mandatory for that specialization,
-- otherwise 'elective'.
-- ============================================================================

with mapping (course_code, spec_code, role) as (values
  -- ACS core
  ('131600','acs','core'),    ('131600','ai','elective'), ('131600','cse','elective'),
  ('131601','acs','core'),    ('131601','ai','elective'), ('131601','cse','elective'),
  ('131602','acs','core'),    ('131602','ai','elective'), ('131602','bioinf','elective'), ('131602','cse','elective'),
  ('131604','acs','core'),    ('131604','ai','elective'), ('131604','cse','elective'),
  ('131605','acs','core'),    ('131605','ai','elective'), ('131605','cse','elective'),
  ('131623','acs','core'),    ('131623','ai','elective'), ('131623','cse','elective'),
  -- AI core
  ('131526','ai','core'),     ('131526','bioinf','core'), ('131526','acs','elective'), ('131526','cse','elective'),
  ('131395','ai','core'),     ('131395','bioinf','core'), ('131395','acs','elective'), ('131395','cse','elective'),
  ('131628','ai','core'),     ('131628','acs','elective'),('131628','cse','elective'),
  ('131396','ai','core'),     ('131396','bioinf','elective'),('131396','acs','elective'),('131396','cse','elective'),
  -- Bioinf core
  ('131525','bioinf','core'), ('131525','ai','elective'), ('131525','acs','elective'), ('131525','cse','elective'),
  ('131524','bioinf','core'), ('131524','ai','elective'), ('131524','acs','elective'), ('131524','cse','elective'),
  ('131394','bioinf','elective'),('131394','ai','elective'),('131394','acs','elective'),('131394','cse','elective'),
  -- Shared electives
  ('131617','ai','elective'), ('131617','acs','elective'),('131617','bioinf','elective'),('131617','cse','elective'),
  ('131371','ai','elective'), ('131371','acs','elective'),('131371','bioinf','elective'),
  ('131612','ai','elective'), ('131612','acs','elective'),('131612','bioinf','elective'),('131612','cse','elective'),
  ('131609','ai','elective'), ('131609','acs','elective'),('131609','bioinf','elective'),('131609','cse','elective'),
  ('131626','ai','elective'), ('131626','acs','elective'),('131626','cse','elective'),
  ('131630','ai','elective'), ('131630','acs','elective'),('131630','cse','elective'),
  ('131631','ai','elective'), ('131631','acs','elective'),('131631','cse','elective'),
  ('131603','ai','elective'), ('131603','acs','elective'),
  ('131527','ai','elective'), ('131527','bioinf','elective'),('131527','acs','elective'),('131527','cse','elective'),
  ('131608','ai','elective'), ('131608','bioinf','elective'),('131608','acs','elective'),('131608','cse','elective'),
  ('131610','ai','elective'), ('131610','acs','elective'),('131610','cse','elective'),
  ('131394p','ai','elective')
)
insert into public.course_specializations (course_id, specialization_id, role)
select c.id, s.id, m.role
from mapping m
join public.courses         c on c.code = m.course_code
join public.specializations s on s.code = m.spec_code
on conflict (course_id, specialization_id) do update
set role = excluded.role;

-- ============================================================================
-- Admin whitelist
-- Replace the placeholder email below with your own @umail.leidenuniv.nl address.
-- ============================================================================

insert into public.admins (email) values
  ('s.r.de.groot.2@umail.leidenuniv.nl')
on conflict (email) do nothing;
