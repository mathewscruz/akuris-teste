import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  documento_id: string;
  aprovador_id: string;
  solicitante_nome: string;
  documento_nome: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      documento_id, 
      aprovador_id, 
      solicitante_nome, 
      documento_nome 
    }: NotificationRequest = await req.json();

    console.log("Enviando notificação de aprovação:", {
      documento_id,
      aprovador_id,
      solicitante_nome,
      documento_nome
    });

    // Buscar dados do aprovador
    const { data: aprovador, error: aprovadorError } = await supabase
      .from('profiles')
      .select('nome, email')
      .eq('user_id', aprovador_id)
      .single();

    if (aprovadorError || !aprovador) {
      console.error("Erro ao buscar aprovador:", aprovadorError);
      throw new Error("Aprovador não encontrado");
    }

    // Buscar dados da empresa para personalizar o email
    const { data: empresaData, error: empresaError } = await supabase
      .from('profiles')
      .select('empresa_id, empresas(nome)')
      .eq('user_id', aprovador_id)
      .single();

    const empresaNome = (empresaData as any)?.empresas?.nome || "GovernAI";

    const emailResponse = await resend.emails.send({
      from: `${empresaNome} <onboarding@resend.dev>`,
      to: [aprovador.email],
      subject: `Solicitação de Aprovação de Documento - ${documento_nome}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Solicitação de Aprovação</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Documento aguarda sua aprovação</p>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Olá <strong>${aprovador.nome}</strong>,
            </p>
            
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              <strong>${solicitante_nome}</strong> solicitou sua aprovação para o documento:
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333; font-size: 18px;">
                📄 ${documento_nome}
              </h3>
              <p style="margin: 0; color: #666; font-size: 14px;">
                Documento ID: ${documento_id}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${supabaseUrl.replace('https://', 'https://').replace('.supabase.co', '.lovableproject.com')}/documentos" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Acessar Sistema de Documentos
              </a>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #1976d2; font-size: 14px;">
                💡 <strong>Dica:</strong> Acesse o sistema, vá até o módulo de Documentos e clique em "Aprovação" para revisar e aprovar este documento.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              Esta é uma notificação automática do sistema ${empresaNome}.<br>
              Se você não deveria receber este email, entre em contato com o administrador.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Notificação enviada com sucesso",
      emailResponse 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro na função send-approval-notification:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);