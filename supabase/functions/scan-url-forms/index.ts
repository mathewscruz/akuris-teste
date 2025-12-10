import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Patterns para classificar tipos de dados pessoais
const dataTypePatterns: Record<string, { patterns: RegExp[]; lgpdCategory: string; sensitivity: string }> = {
  'email': {
    patterns: [/e-?mail/i, /mail/i, /correio/i],
    lgpdCategory: 'contato',
    sensitivity: 'comum'
  },
  'nome': {
    patterns: [/nome/i, /name/i, /full.?name/i, /primeiro.?nome/i, /first.?name/i, /sobrenome/i, /last.?name/i],
    lgpdCategory: 'identificacao',
    sensitivity: 'comum'
  },
  'cpf': {
    patterns: [/cpf/i, /cadastro.?pessoa.?fisica/i],
    lgpdCategory: 'identificacao',
    sensitivity: 'sensivel'
  },
  'rg': {
    patterns: [/\brg\b/i, /identidade/i, /documento/i],
    lgpdCategory: 'identificacao',
    sensitivity: 'sensivel'
  },
  'cnpj': {
    patterns: [/cnpj/i],
    lgpdCategory: 'identificacao',
    sensitivity: 'comum'
  },
  'telefone': {
    patterns: [/tel/i, /phone/i, /celular/i, /mobile/i, /whatsapp/i, /fone/i],
    lgpdCategory: 'contato',
    sensitivity: 'comum'
  },
  'endereco': {
    patterns: [/endere[cç]o/i, /address/i, /rua/i, /street/i, /bairro/i, /cidade/i, /city/i, /estado/i, /state/i, /cep/i, /zip/i, /postal/i],
    lgpdCategory: 'localizacao',
    sensitivity: 'comum'
  },
  'data_nascimento': {
    patterns: [/nascimento/i, /birth/i, /birthday/i, /data.?nasc/i, /dob/i, /idade/i, /age/i],
    lgpdCategory: 'identificacao',
    sensitivity: 'sensivel'
  },
  'senha': {
    patterns: [/senha/i, /password/i, /pass/i, /pwd/i],
    lgpdCategory: 'credenciais',
    sensitivity: 'critico'
  },
  'cartao_credito': {
    patterns: [/cart[aã]o/i, /credit.?card/i, /card.?number/i, /cvv/i, /cvc/i, /validade/i, /expir/i],
    lgpdCategory: 'financeiro',
    sensitivity: 'critico'
  },
  'conta_bancaria': {
    patterns: [/conta/i, /bank/i, /agencia/i, /agency/i, /pix/i],
    lgpdCategory: 'financeiro',
    sensitivity: 'sensivel'
  },
  'saude': {
    patterns: [/saude/i, /health/i, /medic/i, /doenca/i, /alergia/i, /sangue/i, /blood/i, /diagnostico/i],
    lgpdCategory: 'saude',
    sensitivity: 'critico'
  },
  'genero': {
    patterns: [/genero/i, /gender/i, /sexo/i, /sex/i],
    lgpdCategory: 'identificacao',
    sensitivity: 'sensivel'
  },
  'arquivo': {
    patterns: [/file/i, /arquivo/i, /upload/i, /documento/i, /anexo/i, /attachment/i],
    lgpdCategory: 'documentos',
    sensitivity: 'comum'
  },
  'comentario': {
    patterns: [/message/i, /mensagem/i, /comment/i, /comentario/i, /observa[cç]/i, /descri[cç]/i],
    lgpdCategory: 'texto_livre',
    sensitivity: 'comum'
  }
};

interface FormField {
  name: string;
  type: string;
  id: string;
  placeholder: string;
  label: string;
  required: boolean;
  dataType: string;
  lgpdCategory: string;
  sensitivity: string;
}

interface DetectedForm {
  formId: string;
  formName: string;
  action: string;
  method: string;
  fields: FormField[];
}

interface ScanResult {
  url: string;
  title: string;
  forms: DetectedForm[];
  totalFields: number;
  sensitiveFieldsCount: number;
  criticalFieldsCount: number;
}

function classifyField(name: string, id: string, placeholder: string, label: string, inputType: string): { dataType: string; lgpdCategory: string; sensitivity: string } {
  const textToAnalyze = `${name} ${id} ${placeholder} ${label}`.toLowerCase();
  
  // Primeiro verificar pelo tipo do input
  if (inputType === 'email') {
    return { dataType: 'email', lgpdCategory: 'contato', sensitivity: 'comum' };
  }
  if (inputType === 'tel') {
    return { dataType: 'telefone', lgpdCategory: 'contato', sensitivity: 'comum' };
  }
  if (inputType === 'password') {
    return { dataType: 'senha', lgpdCategory: 'credenciais', sensitivity: 'critico' };
  }
  if (inputType === 'file') {
    return { dataType: 'arquivo', lgpdCategory: 'documentos', sensitivity: 'comum' };
  }
  if (inputType === 'date') {
    // Verificar se é data de nascimento
    if (/nasc|birth|age|idade/i.test(textToAnalyze)) {
      return { dataType: 'data_nascimento', lgpdCategory: 'identificacao', sensitivity: 'sensivel' };
    }
    return { dataType: 'data', lgpdCategory: 'outros', sensitivity: 'comum' };
  }

  // Analisar pelos padrões de texto
  for (const [dataType, config] of Object.entries(dataTypePatterns)) {
    for (const pattern of config.patterns) {
      if (pattern.test(textToAnalyze)) {
        return {
          dataType,
          lgpdCategory: config.lgpdCategory,
          sensitivity: config.sensitivity
        };
      }
    }
  }

  return { dataType: 'desconhecido', lgpdCategory: 'outros', sensitivity: 'comum' };
}

function parseFormsFromHtml(html: string): DetectedForm[] {
  const forms: DetectedForm[] = [];
  
  // Regex para encontrar forms
  const formRegex = /<form[^>]*>([\s\S]*?)<\/form>/gi;
  const formMatches = html.matchAll(formRegex);
  
  let formIndex = 0;
  for (const formMatch of formMatches) {
    formIndex++;
    const formHtml = formMatch[0];
    const formContent = formMatch[1];
    
    // Extrair atributos do form
    const idMatch = formHtml.match(/id\s*=\s*["']([^"']*)["']/i);
    const nameMatch = formHtml.match(/name\s*=\s*["']([^"']*)["']/i);
    const actionMatch = formHtml.match(/action\s*=\s*["']([^"']*)["']/i);
    const methodMatch = formHtml.match(/method\s*=\s*["']([^"']*)["']/i);
    
    const fields: FormField[] = [];
    
    // Encontrar inputs
    const inputRegex = /<input[^>]*>/gi;
    const inputMatches = formContent.matchAll(inputRegex);
    
    for (const inputMatch of inputMatches) {
      const inputHtml = inputMatch[0];
      
      const inputType = inputHtml.match(/type\s*=\s*["']([^"']*)["']/i)?.[1] || 'text';
      
      // Ignorar inputs hidden, submit, button
      if (['hidden', 'submit', 'button', 'reset', 'image'].includes(inputType.toLowerCase())) {
        continue;
      }
      
      const inputName = inputHtml.match(/name\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      const inputId = inputHtml.match(/id\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      const inputPlaceholder = inputHtml.match(/placeholder\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      const required = /required/i.test(inputHtml);
      
      // Tentar encontrar label associada
      let label = '';
      if (inputId) {
        const labelRegex = new RegExp(`<label[^>]*for\\s*=\\s*["']${inputId}["'][^>]*>([^<]*)<\\/label>`, 'i');
        const labelMatch = formContent.match(labelRegex);
        if (labelMatch) {
          label = labelMatch[1].trim();
        }
      }
      
      const classification = classifyField(inputName, inputId, inputPlaceholder, label, inputType);
      
      fields.push({
        name: inputName,
        type: inputType,
        id: inputId,
        placeholder: inputPlaceholder,
        label,
        required,
        ...classification
      });
    }
    
    // Encontrar textareas
    const textareaRegex = /<textarea[^>]*>[^<]*<\/textarea>/gi;
    const textareaMatches = formContent.matchAll(textareaRegex);
    
    for (const textareaMatch of textareaMatches) {
      const textareaHtml = textareaMatch[0];
      
      const textareaName = textareaHtml.match(/name\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      const textareaId = textareaHtml.match(/id\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      const textareaPlaceholder = textareaHtml.match(/placeholder\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      const required = /required/i.test(textareaHtml);
      
      let label = '';
      if (textareaId) {
        const labelRegex = new RegExp(`<label[^>]*for\\s*=\\s*["']${textareaId}["'][^>]*>([^<]*)<\\/label>`, 'i');
        const labelMatch = formContent.match(labelRegex);
        if (labelMatch) {
          label = labelMatch[1].trim();
        }
      }
      
      const classification = classifyField(textareaName, textareaId, textareaPlaceholder, label, 'textarea');
      
      fields.push({
        name: textareaName,
        type: 'textarea',
        id: textareaId,
        placeholder: textareaPlaceholder,
        label,
        required,
        ...classification
      });
    }
    
    // Encontrar selects
    const selectRegex = /<select[^>]*>[\s\S]*?<\/select>/gi;
    const selectMatches = formContent.matchAll(selectRegex);
    
    for (const selectMatch of selectMatches) {
      const selectHtml = selectMatch[0];
      
      const selectName = selectHtml.match(/name\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      const selectId = selectHtml.match(/id\s*=\s*["']([^"']*)["']/i)?.[1] || '';
      const required = /required/i.test(selectHtml);
      
      let label = '';
      if (selectId) {
        const labelRegex = new RegExp(`<label[^>]*for\\s*=\\s*["']${selectId}["'][^>]*>([^<]*)<\\/label>`, 'i');
        const labelMatch = formContent.match(labelRegex);
        if (labelMatch) {
          label = labelMatch[1].trim();
        }
      }
      
      const classification = classifyField(selectName, selectId, '', label, 'select');
      
      fields.push({
        name: selectName,
        type: 'select',
        id: selectId,
        placeholder: '',
        label,
        required,
        ...classification
      });
    }
    
    // Só adicionar form se tiver campos
    if (fields.length > 0) {
      forms.push({
        formId: idMatch?.[1] || `form_${formIndex}`,
        formName: nameMatch?.[1] || idMatch?.[1] || `Formulário ${formIndex}`,
        action: actionMatch?.[1] || '',
        method: (methodMatch?.[1] || 'GET').toUpperCase(),
        fields
      });
    }
  }
  
  return forms;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'FIRECRAWL_API_KEY não configurada. Adicione a chave nas configurações de secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Formatar URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scanning URL for forms:', formattedUrl);

    // Chamar Firecrawl para obter HTML
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['html', 'rawHtml'],
        onlyMainContent: false,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Erro ao acessar a página: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Usar rawHtml para análise mais precisa
    const html = data.data?.rawHtml || data.data?.html || '';
    const title = data.data?.metadata?.title || formattedUrl;

    console.log('HTML length:', html.length);

    // Parsear formulários
    const forms = parseFormsFromHtml(html);

    // Calcular estatísticas
    let totalFields = 0;
    let sensitiveFieldsCount = 0;
    let criticalFieldsCount = 0;

    for (const form of forms) {
      for (const field of form.fields) {
        totalFields++;
        if (field.sensitivity === 'sensivel') sensitiveFieldsCount++;
        if (field.sensitivity === 'critico') criticalFieldsCount++;
      }
    }

    const result: ScanResult = {
      url: formattedUrl,
      title,
      forms,
      totalFields,
      sensitiveFieldsCount,
      criticalFieldsCount
    };

    console.log(`Scan completed: ${forms.length} forms, ${totalFields} fields found`);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error scanning URL:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro ao escanear URL' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
