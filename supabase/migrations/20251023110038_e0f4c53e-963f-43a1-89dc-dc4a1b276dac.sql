-- Política para permitir visualização de perguntas via link_token válido
-- Permite que usuários anônimos acessem perguntas de templates quando possuem um link_token válido
CREATE POLICY "Allow viewing questions via assessment link_token"
ON public.due_diligence_questions
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.due_diligence_assessments a
    WHERE a.template_id = due_diligence_questions.template_id
      AND a.link_token IS NOT NULL
      AND a.status IN ('enviado', 'em_andamento')
  )
);