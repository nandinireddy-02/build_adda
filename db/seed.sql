-- Starter problems so the feed is not empty on day one.
-- They are posted by a "Krew team" account that has no password, so nobody can log in as it.
-- Replace these with real problems from departments, NGOs, and businesses before launch.

insert into users (name, email, password_hash, college)
values ('Krew team', 'team@buildadda.local', null, 'Krew')
on conflict (email) do nothing;

insert into problems (posted_by, title, who_has_it, what_happens_today, what_solved_looks_like, category, skills, owner_contact)
select u.id, p.title, p.who, p.today, p.solved, p.category, p.skills, ''
from users u
cross join (values
  ('Reduce food waste in college hostels',
   'Hostel mess staff and residents',
   'The mess cooks for a fixed headcount every day, so leftovers pile up whenever students eat out.',
   'The mess knows the next day''s headcount by 4 pm and cooks within 5% of it.',
   'Environment', array['IoT','Web','Data analysis']),
  ('Smart campus transport system',
   'Students and staff who use the college buses',
   'Students wait at stops with no idea when the bus will arrive or whether it is full.',
   'Anyone can see where each bus is and roughly how full it is from their phone.',
   'Mobility', array['Mobile','Backend','UI/UX design']),
  ('Make internships more genuine',
   'Students applying for their first internship',
   'Students cannot tell which listings are real, paid, and worth the time before applying.',
   'Every listing shows verified reviews from past interns and whether it was paid.',
   'Education', array['Web','Backend','UI/UX design']),
  ('Track free medicine stock at the campus clinic',
   'The campus clinic nurse and students who visit',
   'Students walk to the clinic only to find the common medicine they need has run out.',
   'Students can check stock before walking over, and the nurse gets a low-stock alert.',
   'Healthcare', array['Web','Backend']),
  ('Help farmers near campus price their produce',
   'Small vegetable farmers selling at the weekly market',
   'Farmers guess prices and often sell below the rate in the city market the same day.',
   'Farmers get the day''s city market rate on a basic phone before they leave home.',
   'Agriculture', array['ML / AI','Data analysis','Mobile'])
) as p(title, who, today, solved, category, skills)
where u.email = 'team@buildadda.local'
  and not exists (select 1 from problems existing where existing.title = p.title);
