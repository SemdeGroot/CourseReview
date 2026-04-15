-- Seed the seven MSc Computer Science specializations at Universiteit Leiden.
-- Study IDs match studiegids.universiteitleiden.nl entries.

insert into public.specializations (code, name, study_id) values
  ('acs',    'Advanced Computing and Systems',          '10550'),
  ('ai',     'Artificial Intelligence',                 '10553'),
  ('bioinf', 'Bioinformatics',                          '10551'),
  ('ds',     'Data Science',                            '10549'),
  ('foc',    'Foundations of Computing',                '10549'),
  ('csbs',   'Computer Science and Business Studies',   '10602'),
  ('cse',    'Computer Science and Education',          '10001')
on conflict (code) do update
set name     = excluded.name,
    study_id = excluded.study_id;
