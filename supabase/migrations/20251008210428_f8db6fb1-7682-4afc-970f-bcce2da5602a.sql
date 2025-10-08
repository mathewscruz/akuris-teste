-- Adicionar constraint UNIQUE no campo user_id da tabela temporary_passwords
-- Isso permite o uso correto de ON CONFLICT no upsert

ALTER TABLE public.temporary_passwords 
ADD CONSTRAINT temporary_passwords_user_id_key UNIQUE (user_id);