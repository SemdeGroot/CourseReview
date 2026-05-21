-- Seed the MSc Computer Science specializations at Universiteit Leiden.
-- Study IDs match studiegids.universiteitleiden.nl entries.

insert into public.specializations (code, name, study_id) values
  ('acs',    'Advanced Computing and Systems',          '10550'),
  ('ai',     'Artificial Intelligence',                 '10551'),
  ('bioinf', 'Bioinformatics',                          '10552'),
  ('cse',    'Computer Science and Education',          '10553'),
  ('scss',   'Computer Science and Science Communication and Society', '10554'),
  ('ds',     'Data Science',                            '10555'),
  ('foc',    'Foundations of Computing',                '10556'),
  ('csbs',   'Computer Science and Business Studies',   '10602')
on conflict (code) do update
set name     = excluded.name,
    study_id = excluded.study_id;
