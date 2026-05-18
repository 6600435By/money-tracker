-- Удалить триггер и функцию, которые мешают созданию профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
