
-- Fix: Remove ::text cast from record_id insertions (record_id is UUID, not text)
CREATE OR REPLACE FUNCTION public.audit_riscos_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_old_values jsonb;
  v_new_values jsonb;
  v_changed_fields text[];
  v_empresa_id uuid;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_old_values := to_jsonb(OLD);
    v_empresa_id := OLD.empresa_id;
    INSERT INTO public.audit_logs (empresa_id, table_name, record_id, action, old_values, user_id)
    VALUES (v_empresa_id, 'riscos', OLD.id, 'DELETE', v_old_values, auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    v_new_values := to_jsonb(NEW);
    v_empresa_id := NEW.empresa_id;
    INSERT INTO public.audit_logs (empresa_id, table_name, record_id, action, new_values, user_id)
    VALUES (v_empresa_id, 'riscos', NEW.id, 'INSERT', v_new_values, auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_values := to_jsonb(OLD);
    v_new_values := to_jsonb(NEW);
    v_empresa_id := NEW.empresa_id;
    
    SELECT array_agg(key) INTO v_changed_fields
    FROM jsonb_each(v_new_values) AS n(key, value)
    WHERE n.value IS DISTINCT FROM v_old_values->n.key
      AND n.key NOT IN ('updated_at');
    
    IF v_changed_fields IS NOT NULL AND array_length(v_changed_fields, 1) > 0 THEN
      INSERT INTO public.audit_logs (empresa_id, table_name, record_id, action, old_values, new_values, changed_fields, user_id)
      VALUES (v_empresa_id, 'riscos', NEW.id, 'UPDATE', v_old_values, v_new_values, v_changed_fields, auth.uid());
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;
