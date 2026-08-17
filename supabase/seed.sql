-- ============================================================
-- Servora — Seed Data (Hotel Siraj)
-- Run this in the Supabase SQL Editor AFTER running schema.sql
-- ============================================================

-- Insert restaurant
insert into public.restaurants (id, name, slug, description, phone, email, address, opening_hours, settings)
values (
  'a0000000-0000-0000-0000-000000000001',
  'Hotel Siraj',
  'hotel-siraj',
  'Authentic Hyderabadi and North Indian cuisine since 1986. Legendary Biryani, rich curries, and traditional tandoor delicacies.',
  '+91 40 2345 6789',
  'info@hotelsiraj.in',
  '42-58, Masab Tank, Abids, Hyderabad, Telangana 500028',
  '{"mon":{"open":"11:00","close":"23:00"},"tue":{"open":"11:00","close":"23:00"},"wed":{"open":"11:00","close":"23:00"},"thu":{"open":"11:00","close":"23:00"},"fri":{"open":"11:00","close":"23:30"},"sat":{"open":"11:00","close":"23:30"},"sun":{"open":"10:00","close":"23:00"}}'::jsonb,
  '{}'::jsonb
) on conflict (slug) do nothing;

-- ── Staff profiles (will be linked to auth.users created via Supabase Auth) ──
-- These profiles are created WITHOUT auth.users entries.
-- The password for all seeded accounts is: password123
-- After running this script, go to Supabase → Auth → Users → "Add User" for each
-- email below with password123, or use the signup form. The trigger will handle
-- profile creation for new signups. The rows below serve as pre-created staff.

-- Owner
insert into public.profiles (id, name, email, phone, role, restaurant_id)
values (
  'b0000000-0000-0000-0000-000000000001',
  'Siraj Ahmed',
  'owner@hotelsiraj.in',
  '+91 40 2345 6789',
  'owner',
  'a0000000-0000-0000-0000-000000000001'
) on conflict (email) do nothing;

-- Chef
insert into public.profiles (id, name, email, phone, role, restaurant_id)
values (
  'b0000000-0000-0000-0000-000000000002',
  'Chef Imran',
  'chef@hotelsiraj.in',
  null,
  'chef',
  'a0000000-0000-0000-0000-000000000001'
) on conflict (email) do nothing;

-- Waiters
insert into public.profiles (id, name, email, phone, role, restaurant_id)
values
  ('b0000000-0000-0000-0000-000000000003', 'Rahul Kumar', 'waiter@hotelsiraj.in', null, 'waiter', 'a0000000-0000-0000-0000-000000000001'),
  ('b0000000-0000-0000-0000-000000000004', 'Vikram Singh', 'waiter2@hotelsiraj.in', null, 'waiter', 'a0000000-0000-0000-0000-000000000001')
on conflict (email) do nothing;

-- Demo customer
insert into public.profiles (id, name, email, phone, role, restaurant_id, points, total_spent, visit_count)
values (
  'b0000000-0000-0000-0000-000000000005',
  'Arjun Reddy',
  'arjun@customer.com',
  '+91 98765 43210',
  'customer',
  'a0000000-0000-0000-0000-000000000001',
  180,
  2450,
  5
) on conflict (email) do nothing;

-- ── Categories ──
insert into public.categories (id, name, slug, sort_order, restaurant_id) values
  ('c0000001-0000-0000-0000-000000000001', 'Starters',    'starters',    1, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000002', 'Biryani',     'biryani',     2, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000003', 'Tandoor',     'tandoor',     3, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000004', 'Curries',     'curries',     4, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000005', 'Breads',      'breads',      5, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000006', 'Rice & Dal',  'rice-dal',    6, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000007', 'Desserts',    'desserts',    7, 'a0000000-0000-0000-0000-000000000001'),
  ('c0000001-0000-0000-0000-000000000008', 'Beverages',   'beverages',   8, 'a0000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- ── Menu Items ──
insert into public.menu_items (name, description, price, is_veg, is_available, restaurant_id, category_id) values
  -- Starters
  ('Chicken 65',           'Spicy deep-fried chicken tossed with curry leaves, red chillies, and a hint of lemon',                         280, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001'),
  ('Paneer Tikka',         'Chargrilled cottage cheese cubes marinated in hung curd and secret spices',                                 260, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001'),
  ('Mutton Seekh Kebab',   'Minced mutton skewers grilled in tandoor with fresh herbs and spices',                                      340, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001'),
  ('Veg Spring Rolls',     'Crunchy rolls stuffed with mixed vegetables and glass noodles',                                               180, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001'),
  ('Fish Amritsari',       'Batter-fried river fish fillets with tangy tamarind chutney',                                                320, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001'),
  ('Hara Bhara Kebab',     'Spinach and green pea patties with paneer, pan-fried to perfection',                                        200, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001'),
  -- Biryani
  ('Hyderabadi Mutton Biryani', 'Our legendary slow-cooked dum biryani with tender mutton, saffron, and fried onions',                    420, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002'),
  ('Chicken Dum Biryani',  'Fragrant basmati rice layered with spiced chicken, sealed and cooked on dum',                                350, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002'),
  ('Veg Biryani',          'Garden vegetables slow-cooked with aromatic rice and whole spices',                                          280, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002'),
  ('Mutton Bone Marrow Biryani', 'Special cut mutton biryani with rich marrow gravy on the side',                                        520, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002'),
  ('Egg Biryani',          'Boiled eggs layered with spiced rice and caramelized onions',                                                250, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002'),
  -- Tandoor
  ('Tandoori Chicken',     'Whole chicken leg marinated overnight in yogurt and spices, roasted in clay oven',                           380, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003'),
  ('Butter Chicken',       'Tandoori chicken pieces simmered in a velvety tomato-butter gravy',                                          360, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003'),
  ('Reshmi Kebab',         'Silky smooth chicken mince kebabs with cream cheese and mild spices',                                       320, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003'),
  ('Paneer Malai Kebab',   'Cottage cheese cubes with cream, cashew paste, and mild aromatic spices',                                    300, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003'),
  ('Tandoori Pomfret',     'Whole pomfret marinated in tandoori masala, grilled over charcoal',                                          550, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000003'),
  -- Curries
  ('Mutton Rogan Josh',    'Kashmiri-style slow-cooked mutton in a rich, aromatic red gravy',                                           400, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004'),
  ('Chicken Korma',        'Tender chicken in a creamy cashew and poppy seed sauce',                                                     340, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004'),
  ('Paneer Butter Masala', 'Soft paneer cubes in a rich, creamy tomato and butter sauce',                                               300, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004'),
  ('Dal Makhani',          'Black lentils slow-cooked overnight with butter and cream',                                                  260, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004'),
  ('Chettinad Chicken',    'Spicy and aromatic chicken curry from the Chettinad region',                                                350, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004'),
  ('Baingan Bharta',       'Smoky roasted eggplant mashed and cooked with onions, tomatoes, and spices',                                220, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000004'),
  -- Breads
  ('Butter Naan',          'Soft leavened bread brushed with butter, baked in tandoor',                                                  60, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005'),
  ('Garlic Naan',          'Naan studded with fresh garlic and cilantro',                                                               70, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005'),
  ('Roomali Roti',         'Paper-thin handkerchief bread folded and served hot',                                                       50, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005'),
  ('Lachha Paratha',       'Flaky multi-layered whole wheat bread with ghee',                                                           60, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005'),
  ('Keema Naan',           'Naan stuffed with spiced minced mutton',                                                                    90, false, true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005'),
  ('Missi Roti',           'Gram flour flatbread with ajwain seeds and spices',                                                         55, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000005'),
  -- Rice & Dal
  ('Jeera Rice',           'Basmati rice tempered with cumin seeds and ghee',                                                           160, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006'),
  ('Dal Tadka',            'Yellow lentils tempered with cumin, garlic, and ghee',                                                      180, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006'),
  ('Dal Fry',              'Mixed lentils cooked with tomatoes, onions, and spices',                                                    180, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006'),
  ('Steam Rice',           'Plain steamed basmati rice',                                                                               120, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006'),
  -- Desserts
  ('Double Ka Meetha',     'Hyderabadi bread pudding soaked in saffron milk, garnished with pistachios',                               160, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000007'),
  ('Gulab Jamun',          'Soft milk-solid dumplings soaked in rose-flavoured sugar syrup',                                           120, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000007'),
  ('Kulfi Falooda',        'Traditional Indian ice cream with rose syrup, basil seeds, and vermicelli',                                  150, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000007'),
  ('Phirni',               'Creamy ground rice pudding flavoured with cardamom and saffron',                                            130, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000007'),
  ('Jalebi',               'Crispy spirals deep-fried and soaked in warm saffron syrup',                                                 100, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000007'),
  -- Beverages
  ('Masala Chai',          'Strong Assam tea brewed with ginger, cardamom, and cinnamon',                                               40, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008'),
  ('Mango Lassi',          'Thick and creamy Alphonso mango yoghurt shake',                                                             90, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008'),
  ('Sweet Lassi',          'Refreshing chilled yoghurt drink sweetened with sugar',                                                      70, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008'),
  ('Nimbu Pani',           'Freshly squeezed lemon water with a pinch of cumin and black salt',                                           40, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008'),
  ('Cold Coffee',          'Iced coffee blended with milk, chocolate, and vanilla',                                                       110, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008'),
  ('Thandai',              'Chilled spiced milk with almonds, saffron, and fennel seeds',                                               100, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008'),
  ('Fresh Lime Soda',      'Lime soda — sweet or salty, your choice',                                                                   50, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008'),
  ('Rooh Afza',            'Classic rose and herb syrup blended with chilled milk',                                                        60, true,  true, 'a0000000-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008');

-- Update category item counts
update public.categories c set item_count = (
  select count(*) from public.menu_items m where m.category_id = c.id
);

-- ── Tables ──
insert into public.tables (number, seats, status, restaurant_id) values
  (1,  2, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (2,  2, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (3,  4, 'occupied',  'a0000000-0000-0000-0000-000000000001'),
  (4,  4, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (5,  4, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (6,  6, 'reserved',  'a0000000-0000-0000-0000-000000000001'),
  (7,  6, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (8,  2, 'occupied',  'a0000000-0000-0000-0000-000000000001'),
  (9,  4, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (10, 8, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (11, 2, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (12, 4, 'cleaning',  'a0000000-0000-0000-0000-000000000001'),
  (13, 6, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (14, 2, 'available', 'a0000000-0000-0000-0000-000000000001'),
  (15, 10,'available', 'a0000000-0000-0000-0000-000000000001')
on conflict do nothing;

-- ── Important: Create auth.users entries for the seed profiles ──
-- Since we can't easily insert into auth.users via SQL (it requires encrypted passwords),
-- these profiles exist without auth.users. To make them loggable:
-- 1. Go to Supabase Dashboard → Authentication → Users
-- 2. Click "Add User" → "Create New User" for each email:
--    - owner@hotelsiraj.in (password: password123)
--    - chef@hotelsiraj.in    (password: password123)
--    - waiter@hotelsiraj.in  (password: password123)
--    - waiter2@hotelsiraj.in (password: password123)
--    - arjun@customer.com    (password: password123)
-- 3. After creating each user, the profile trigger fires automatically.
-- 4. Delete the orphaned seed profiles (the ones with b0000000... IDs) or
--    link them by updating the id to match the auth.users id.
--
-- Alternatively, update the profile id to match after creation:
-- update public.profiles set id = (select id from auth.users where email = 'owner@hotelsiraj.in') where email = 'owner@hotelsiraj.in';
