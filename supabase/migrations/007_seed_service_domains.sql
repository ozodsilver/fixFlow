insert into service_domains (slug, name_uz_cyrl, name_ru, is_active, sort_order)
values
  ('electrical', 'Электрика', 'Электрика', true, 30),
  ('air_conditioning_ventilation', 'Кондитсионер ва вентиляция', 'Кондиционеры и вентиляция', true, 40),
  ('heating_systems', 'Иситиш тизимлари', 'Системы отопления', true, 50),
  ('water_filters_pumps', 'Сув фильтри ва насослар', 'Фильтры воды и насосы', true, 60),
  ('door_lock_service', 'Эшик-қулф хизмати', 'Двери и замки', true, 70),
  ('windows_aluminum', 'Ойналар ва алюмин конструкциялар', 'Окна и алюминиевые конструкции', true, 80),
  ('plumbing_installation', 'Сантехника монтаж', 'Монтаж сантехники', true, 90),
  ('sewer_cleaning', 'Канализация тозалаш', 'Прочистка канализации', true, 100),
  ('handyman', 'Майда уй таъмири', 'Мелкий бытовой ремонт', true, 110),
  ('internet_cable_installation', 'Интернет/кабель монтаж', 'Монтаж интернета и кабеля', true, 120)
on conflict (slug) do update
set
  name_uz_cyrl = excluded.name_uz_cyrl,
  name_ru = excluded.name_ru,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;
