import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(authHeader);
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Buscar empresa do usuário
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('empresa_id, nome')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.empresa_id) {
      throw new Error('User profile not found');
    }

    // Buscar nome da empresa
    const { data: empresa, error: empresaError } = await supabaseClient
      .from('empresas')
      .select('nome')
      .eq('id', profile.empresa_id)
      .single();

    if (empresaError) {
      throw new Error('Company not found');
    }

    // Obter platform do body da requisição
    const { platform } = await req.json();

    if (!platform || !['windows', 'linux', 'macos'].includes(platform)) {
      throw new Error('Invalid platform specified');
    }

    // Gerar token único para o agente
    const agentToken = crypto.randomUUID();
    const agentId = crypto.randomUUID();

    // Registrar agente pendente
    const { error: insertError } = await supabaseClient
      .from('asset_agents')
      .insert({
        id: agentId,
        empresa_id: profile.empresa_id,
        agent_token: agentToken,
        hostname: 'pending-install',
        operating_system: platform,
        status: 'offline'
      });

    if (insertError) {
      console.error('Error inserting agent:', insertError);
      throw new Error('Failed to register agent');
    }

    // Configuração do agente baseada na plataforma
    const agentConfig = {
      token: agentToken,
      agent_id: agentId,
      empresa_id: profile.empresa_id,
      empresa_name: empresa?.nome || 'GovernAII',
      api_url: Deno.env.get('SUPABASE_URL'),
      api_key: Deno.env.get('SUPABASE_ANON_KEY'),
      platform: platform,
      heartbeat_interval: 300, // 5 minutos
      sync_interval: 86400, // 24 horas
      version: '1.0.0',
      user_name: profile.nome || 'Usuário'
    };

    // Gerar instalador baseado na plataforma
    let installerContent = '';
    let filename = '';
    let contentType = '';

    switch (platform) {
      case 'windows':
        filename = `GovernAII-Agent-Setup.nsi`;
        contentType = 'text/plain';
        installerContent = generateWindowsNSISInstaller(agentConfig);
        break;
      case 'linux':
        filename = `governaii-agent_${agentConfig.version}_amd64.deb`;
        contentType = 'application/x-debian-package';
        installerContent = generateLinuxDebPackage(agentConfig);
        break;
      case 'macos':
        filename = `GovernAII-Agent-${agentConfig.version}.pkg`;
        contentType = 'application/x-newton-compatible-pkg';
        installerContent = generateMacOSPackage(agentConfig);
        break;
    }

    return new Response(installerContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error generating agent installer:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateWindowsNSISInstaller(config: any): string {
  return `; GovernAII Asset Discovery Agent - NSIS Installer
; Empresa: ${config.empresa_name}
; Versão: ${config.version}
; Token: ${config.token.substring(0, 8)}...
; Gerado em: ${new Date().toISOString()}

!define PRODUCT_NAME "GovernAII Asset Discovery Agent"
!define PRODUCT_VERSION "${config.version}"
!define PRODUCT_PUBLISHER "GovernAII"
!define PRODUCT_WEB_SITE "https://governaii.com"
!define PRODUCT_DIR_REGKEY "Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\governaii-agent.exe"
!define PRODUCT_UNINST_KEY "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"
!define EMPRESA_NAME "${config.empresa_name}"
!define AGENT_TOKEN "${config.token}"
!define API_URL "${config.api_url}"

; Includes
!include "MUI2.nsh"
!include "ServiceLib.nsh"
!include "FileFunc.nsh"

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "\${NSISDIR}\\Contrib\\Graphics\\Icons\\modern-install.ico"
!define MUI_UNICON "\${NSISDIR}\\Contrib\\Graphics\\Icons\\modern-uninstall.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "\${NSISDIR}\\Contrib\\Graphics\\Header\\nsis3-metro.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "\${NSISDIR}\\Contrib\\Graphics\\Wizard\\nsis3-metro.bmp"

; Interface Configuration
!define MUI_WELCOMEPAGE_TITLE "Bem-vindo ao Instalador do GovernAII Agent"
!define MUI_WELCOMEPAGE_TEXT "Este assistente irá guiá-lo na instalação do GovernAII Asset Discovery Agent para \${EMPRESA_NAME}.$\\r$\\n$\\r$\\nO agente coletará automaticamente informações de ativos deste computador para o sistema GovernAII.$\\r$\\n$\\r$\\nClique em Avançar para continuar."

; Welcome page
!insertmacro MUI_PAGE_WELCOME

; License page
!define MUI_LICENSEPAGE_TEXT_TOP "Por favor, leia o seguinte contrato de licença antes de instalar o GovernAII Agent."
!define MUI_LICENSEPAGE_TEXT_BOTTOM "Se você aceitar os termos do contrato, clique em 'Eu aceito' para continuar."
!insertmacro MUI_PAGE_LICENSE "license.txt"

; Directory page
!define MUI_DIRECTORYPAGE_TEXT_TOP "O instalador irá instalar o GovernAII Agent no diretório a seguir. Para instalar em um diretório diferente, clique em Procurar e selecione outro diretório."
!insertmacro MUI_PAGE_DIRECTORY

; Instfiles page
!insertmacro MUI_PAGE_INSTFILES

; Finish page
!define MUI_FINISHPAGE_TITLE "Instalação Concluída"
!define MUI_FINISHPAGE_TEXT "O GovernAII Agent foi instalado com sucesso em seu computador.$\\r$\\n$\\r$\\nO serviço foi iniciado automaticamente e começará a coletar informações de ativos em breve.$\\r$\\n$\\r$\\nClique em Concluir para fechar este assistente."
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Abrir logs do agente"
!define MUI_FINISHPAGE_RUN_FUNCTION "OpenLogs"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_INSTFILES

; Language files
!insertmacro MUI_LANGUAGE "PortugueseBR"

; Version Information
VIProductVersion "${config.version}.0"
VIAddVersionKey /LANG=\${LANG_PORTUGUESEBR} "ProductName" "GovernAII Asset Discovery Agent"
VIAddVersionKey /LANG=\${LANG_PORTUGUESEBR} "Comments" "Agente de descoberta automática de ativos"
VIAddVersionKey /LANG=\${LANG_PORTUGUESEBR} "CompanyName" "GovernAII"
VIAddVersionKey /LANG=\${LANG_PORTUGUESEBR} "LegalCopyright" "© 2024 GovernAII. Todos os direitos reservados."
VIAddVersionKey /LANG=\${LANG_PORTUGUESEBR} "FileDescription" "GovernAII Asset Discovery Agent"
VIAddVersionKey /LANG=\${LANG_PORTUGUESEBR} "FileVersion" "${config.version}"
VIAddVersionKey /LANG=\${LANG_PORTUGUESEBR} "ProductVersion" "${config.version}"

; Main installer settings
Name "\${PRODUCT_NAME} \${PRODUCT_VERSION}"
OutFile "GovernAII-Agent-Setup.exe"
InstallDir "$PROGRAMFILES\\GovernAII Agent"
InstallDirRegKey HKLM "\${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show
RequestExecutionLevel admin

; Check admin privileges
Function .onInit
  UserInfo::GetAccountType
  pop $0
  \${If} $0 != "admin"
    MessageBox MB_ICONSTOP "Privilégios de administrador são necessários para instalar o GovernAII Agent."
    SetErrorLevel 740 ; ERROR_ELEVATION_REQUIRED
    Quit
  \${EndIf}
FunctionEnd

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite ifnewer
  
  ; Parar e remover serviço existente
  !insertmacro SERVICE "stop" "GovernAIIAgent" ""
  !insertmacro SERVICE "delete" "GovernAIIAgent" ""
  Sleep 2000
  
  ; Criar arquivos de configuração e licença
  Call CreateConfigFiles
  
  ; Criar script principal do agente
  Call CreateAgentScript
  
  ; Instalar serviço Windows
  !insertmacro SERVICE "create" "GovernAIIAgent" 'path=powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\\agent.ps1";autostart=1;depend=;desc=GovernAII Asset Discovery Agent - Coleta automática de ativos para \${EMPRESA_NAME};'
  
  ; Iniciar serviço
  !insertmacro SERVICE "start" "GovernAIIAgent" ""
  
  ; Registrar no Windows Registry
  WriteRegStr HKLM "\${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\\agent.ps1"
  WriteRegStr \${PRODUCT_UNINST_ROOT_KEY} "\${PRODUCT_UNINST_KEY}" "DisplayName" "\${PRODUCT_NAME}"
  WriteRegStr \${PRODUCT_UNINST_ROOT_KEY} "\${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\\uninst.exe"
  WriteRegStr \${PRODUCT_UNINST_ROOT_KEY} "\${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\\agent.ps1"
  WriteRegStr \${PRODUCT_UNINST_ROOT_KEY} "\${PRODUCT_UNINST_KEY}" "DisplayVersion" "\${PRODUCT_VERSION}"
  WriteRegStr \${PRODUCT_UNINST_ROOT_KEY} "\${PRODUCT_UNINST_KEY}" "URLInfoAbout" "\${PRODUCT_WEB_SITE}"
  WriteRegStr \${PRODUCT_UNINST_ROOT_KEY} "\${PRODUCT_UNINST_KEY}" "Publisher" "\${PRODUCT_PUBLISHER}"
  WriteRegStr \${PRODUCT_UNINST_ROOT_KEY} "\${PRODUCT_UNINST_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr \${PRODUCT_UNINST_ROOT_KEY} "\${PRODUCT_UNINST_KEY}" "EmpresaName" "\${EMPRESA_NAME}"
  
  ; Criar diretório de logs
  CreateDirectory "$INSTDIR\\logs"
  
  ; Criar desinstalador
  WriteUninstaller "$INSTDIR\\uninst.exe"
  
  ; Verificar se o serviço está funcionando
  Sleep 3000
  !insertmacro SERVICE "status" "GovernAIIAgent" "$0"
  \${If} $0 == "running"
    DetailPrint "Serviço GovernAII Agent iniciado com sucesso!"
  \${Else}
    DetailPrint "Aviso: Não foi possível verificar o status do serviço."
  \${EndIf}
SectionEnd

Function CreateConfigFiles
  ; Criar arquivo de configuração JSON
  FileOpen $4 "$INSTDIR\\config.json" w
  FileWrite $4 '{$\\r$\\n'
  FileWrite $4 '  "token": "\${AGENT_TOKEN}",$\\r$\\n'
  FileWrite $4 '  "agent_id": "${config.agent_id}",$\\r$\\n'
  FileWrite $4 '  "empresa_id": "${config.empresa_id}",$\\r$\\n'
  FileWrite $4 '  "empresa_name": "\${EMPRESA_NAME}",$\\r$\\n'
  FileWrite $4 '  "api_url": "\${API_URL}",$\\r$\\n'
  FileWrite $4 '  "api_key": "${config.api_key}",$\\r$\\n'
  FileWrite $4 '  "platform": "windows",$\\r$\\n'
  FileWrite $4 '  "heartbeat_interval": ${config.heartbeat_interval},$\\r$\\n'
  FileWrite $4 '  "sync_interval": ${config.sync_interval},$\\r$\\n'
  FileWrite $4 '  "version": "\${PRODUCT_VERSION}",$\\r$\\n'
  FileWrite $4 '  "install_date": "$(Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ")"$\\r$\\n'
  FileWrite $4 '}$\\r$\\n'
  FileClose $4
  
  ; Criar arquivo de licença
  FileOpen $4 "$INSTDIR\\license.txt" w
  FileWrite $4 'CONTRATO DE LICENÇA DO SOFTWARE GOVERNAII ASSET DISCOVERY AGENT$\\r$\\n$\\r$\\n'
  FileWrite $4 'EMPRESA: \${EMPRESA_NAME}$\\r$\\n'
  FileWrite $4 'VERSÃO: \${PRODUCT_VERSION}$\\r$\\n'
  FileWrite $4 'DATA DE INSTALAÇÃO: $(Get-Date -Format "dd/MM/yyyy")$\\r$\\n$\\r$\\n'
  FileWrite $4 'Este software é licenciado para uso exclusivo da empresa \${EMPRESA_NAME}.$\\r$\\n'
  FileWrite $4 'O GovernAII Asset Discovery Agent é projetado para coletar informações$\\r$\\n'
  FileWrite $4 'de ativos de TI para fins de inventário e gestão de compliance.$\\r$\\n$\\r$\\n'
  FileWrite $4 'FUNCIONALIDADES:$\\r$\\n'
  FileWrite $4 '- Descoberta automática de ativos de hardware e software$\\r$\\n'
  FileWrite $4 '- Monitoramento contínuo de mudanças no ambiente$\\r$\\n'
  FileWrite $4 '- Sincronização segura com a plataforma GovernAII$\\r$\\n'
  FileWrite $4 '- Relatórios detalhados de inventário$\\r$\\n$\\r$\\n'
  FileWrite $4 'SEGURANÇA E PRIVACIDADE:$\\r$\\n'
  FileWrite $4 '- Todas as informações são criptografadas durante a transmissão$\\r$\\n'
  FileWrite $4 '- Acesso restrito apenas aos administradores autorizados$\\r$\\n'
  FileWrite $4 '- Conformidade com LGPD e regulamentações de privacidade$\\r$\\n$\\r$\\n'
  FileWrite $4 'Ao instalar este software, você aceita os termos desta licença.$\\r$\\n'
  FileClose $4
FunctionEnd

Function CreateAgentScript
  ; Criar script PowerShell principal do agente
  FileOpen $4 "$INSTDIR\\agent.ps1" w
  FileWrite $4 '# GovernAII Asset Discovery Agent$\\r$\\n'
  FileWrite $4 '# Versão: \${PRODUCT_VERSION}$\\r$\\n'
  FileWrite $4 '# Empresa: \${EMPRESA_NAME}$\\r$\\n'
  FileWrite $4 '# Instalado em: $(Get-Date)$\\r$\\n$\\r$\\n'
  FileWrite $4 'param([switch]$$Debug)$\\r$\\n$\\r$\\n'
  FileWrite $4 '$$ErrorActionPreference = "Continue"$\\r$\\n'
  FileWrite $4 '$$ConfigPath = "$$PSScriptRoot\\config.json"$\\r$\\n'
  FileWrite $4 '$$LogPath = "$$PSScriptRoot\\logs\\agent.log"$\\r$\\n$\\r$\\n'
  FileWrite $4 'function Write-Log {$\\r$\\n'
  FileWrite $4 '    param([string]$$Message, [string]$$Level = "INFO")$\\r$\\n'
  FileWrite $4 '    $$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"$\\r$\\n'
  FileWrite $4 '    $$logMessage = "$$timestamp [$$Level] $$Message"$\\r$\\n'
  FileWrite $4 '    if ($$Debug) { Write-Host $$logMessage }$\\r$\\n'
  FileWrite $4 '    Add-Content -Path $$LogPath -Value $$logMessage -Force$\\r$\\n'
  FileWrite $4 '}$\\r$\\n$\\r$\\n'
  FileWrite $4 'try {$\\r$\\n'
  FileWrite $4 '    $$config = Get-Content $$ConfigPath | ConvertFrom-Json$\\r$\\n'
  FileWrite $4 '    Write-Log "GovernAII Agent iniciado (Token: $$($$config.token.Substring(0,8))...)"$\\r$\\n'
  FileWrite $4 '} catch {$\\r$\\n'
  FileWrite $4 '    Write-Log "Erro ao carregar configuração: $$_" "ERROR"$\\r$\\n'
  FileWrite $4 '    exit 1$\\r$\\n'
  FileWrite $4 '}$\\r$\\n$\\r$\\n'
  FileWrite $4 'function Send-Heartbeat {$\\r$\\n'
  FileWrite $4 '    try {$\\r$\\n'
  FileWrite $4 '        $$headers = @{$\\r$\\n'
  FileWrite $4 '            "Authorization" = "Bearer $$($config.token)"$\\r$\\n'
  FileWrite $4 '            "Content-Type" = "application/json"$\\r$\\n'
  FileWrite $4 '        }$\\r$\\n'
  FileWrite $4 '        $$body = @{$\\r$\\n'
  FileWrite $4 '            agent_id = $$config.agent_id$\\r$\\n'
  FileWrite $4 '            timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")$\\r$\\n'
  FileWrite $4 '            status = "online"$\\r$\\n'
  FileWrite $4 '            hostname = $$env:COMPUTERNAME$\\r$\\n'
  FileWrite $4 '            version = $$config.version$\\r$\\n'
  FileWrite $4 '        } | ConvertTo-Json$\\r$\\n'
  FileWrite $4 '        $$response = Invoke-RestMethod -Uri "$$($config.api_url)/functions/v1/agent-heartbeat" -Method POST -Headers $$headers -Body $$body -TimeoutSec 30$\\r$\\n'
  FileWrite $4 '        Write-Log "Heartbeat enviado com sucesso"$\\r$\\n'
  FileWrite $4 '    } catch {$\\r$\\n'
  FileWrite $4 '        Write-Log "Erro ao enviar heartbeat: $$_" "ERROR"$\\r$\\n'
  FileWrite $4 '    }$\\r$\\n'
  FileWrite $4 '}$\\r$\\n$\\r$\\n'
  FileWrite $4 'function Sync-Assets {$\\r$\\n'
  FileWrite $4 '    try {$\\r$\\n'
  FileWrite $4 '        Write-Log "Iniciando sincronização de ativos..."$\\r$\\n'
  FileWrite $4 '        $$assets = @()$\\r$\\n'
  FileWrite $4 '        $$computerInfo = Get-ComputerInfo$\\r$\\n'
  FileWrite $4 '        $$assets += @{$\\r$\\n'
  FileWrite $4 '            name = $$computerInfo.CsName$\\r$\\n'
  FileWrite $4 '            type = "Computador"$\\r$\\n'
  FileWrite $4 '            os = "$$($computerInfo.WindowsProductName) $$($computerInfo.WindowsVersion)"$\\r$\\n'
  FileWrite $4 '            hostname = $$computerInfo.CsName$\\r$\\n'
  FileWrite $4 '            ip_address = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $$_.IPAddress -ne "127.0.0.1" } | Select-Object -First 1).IPAddress$\\r$\\n'
  FileWrite $4 '            mac_address = (Get-NetAdapter | Where-Object { $$_.Status -eq "Up" } | Select-Object -First 1).MacAddress$\\r$\\n'
  FileWrite $4 '            last_seen = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")$\\r$\\n'
  FileWrite $4 '        }$\\r$\\n'
  FileWrite $4 '        Get-WmiObject -Class Win32_Product | ForEach-Object {$\\r$\\n'
  FileWrite $4 '            $$assets += @{$\\r$\\n'
  FileWrite $4 '                name = $$_.Name$\\r$\\n'
  FileWrite $4 '                type = "Software"$\\r$\\n'
  FileWrite $4 '                version = $$_.Version$\\r$\\n'
  FileWrite $4 '                vendor = $$_.Vendor$\\r$\\n'
  FileWrite $4 '                install_date = if ($$_.InstallDate) { [datetime]::ParseExact($$_.InstallDate, "yyyyMMdd", $$null).ToString("yyyy-MM-ddTHH:mm:ss.fffZ") } else { $$null }$\\r$\\n'
  FileWrite $4 '                last_seen = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")$\\r$\\n'
  FileWrite $4 '            }$\\r$\\n'
  FileWrite $4 '        }$\\r$\\n'
  FileWrite $4 '        $$headers = @{$\\r$\\n'
  FileWrite $4 '            "Authorization" = "Bearer $$($config.token)"$\\r$\\n'
  FileWrite $4 '            "Content-Type" = "application/json"$\\r$\\n'
  FileWrite $4 '        }$\\r$\\n'
  FileWrite $4 '        $$body = @{$\\r$\\n'
  FileWrite $4 '            agent_id = $$config.agent_id$\\r$\\n'
  FileWrite $4 '            assets = $$assets$\\r$\\n'
  FileWrite $4 '        } | ConvertTo-Json -Depth 3$\\r$\\n'
  FileWrite $4 '        $$response = Invoke-RestMethod -Uri "$$($config.api_url)/functions/v1/agent-sync-assets" -Method POST -Headers $$headers -Body $$body -TimeoutSec 120$\\r$\\n'
  FileWrite $4 '        Write-Log "Sincronização concluída: $$($$assets.Count) ativos enviados"$\\r$\\n'
  FileWrite $4 '    } catch {$\\r$\\n'
  FileWrite $4 '        Write-Log "Erro na sincronização: $$_" "ERROR"$\\r$\\n'
  FileWrite $4 '    }$\\r$\\n'
  FileWrite $4 '}$\\r$\\n$\\r$\\n'
  FileWrite $4 '$$lastSync = 0$\\r$\\n'
  FileWrite $4 'while ($$true) {$\\r$\\n'
  FileWrite $4 '    try {$\\r$\\n'
  FileWrite $4 '        Send-Heartbeat$\\r$\\n'
  FileWrite $4 '        $$currentTime = [int][double]::Parse((Get-Date -UFormat %%s))$\\r$\\n'
  FileWrite $4 '        if (($$currentTime - $$lastSync) -gt $$config.sync_interval) {$\\r$\\n'
  FileWrite $4 '            Sync-Assets$\\r$\\n'
  FileWrite $4 '            $$lastSync = $$currentTime$\\r$\\n'
  FileWrite $4 '        }$\\r$\\n'
  FileWrite $4 '        Start-Sleep -Seconds $$config.heartbeat_interval$\\r$\\n'
  FileWrite $4 '    } catch {$\\r$\\n'
  FileWrite $4 '        Write-Log "Erro no loop principal: $$_" "ERROR"$\\r$\\n'
  FileWrite $4 '        Start-Sleep -Seconds 60$\\r$\\n'
  FileWrite $4 '    }$\\r$\\n'
  FileWrite $4 '}$\\r$\\n'
  FileClose $4
FunctionEnd

Function OpenLogs
  ExecShell "open" "$INSTDIR\\logs\\agent.log"
FunctionEnd

Section Uninstall
  ; Parar e remover serviço
  !insertmacro SERVICE "stop" "GovernAIIAgent" ""
  !insertmacro SERVICE "delete" "GovernAIIAgent" ""
  
  ; Remover arquivos
  Delete "$INSTDIR\\agent.ps1"
  Delete "$INSTDIR\\config.json"
  Delete "$INSTDIR\\license.txt"
  Delete "$INSTDIR\\logs\\agent.log"
  Delete "$INSTDIR\\uninst.exe"
  
  ; Remover diretórios
  RMDir "$INSTDIR\\logs"
  RMDir "$INSTDIR"
  
  ; Limpar registry
  DeleteRegKey \${PRODUCT_UNINST_ROOT_KEY} "\${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "\${PRODUCT_DIR_REGKEY}"
  
  SetAutoClose true
SectionEnd
`;
}

function generateLinuxDebPackage(config: any): string {
  return `#!/bin/bash
# GovernAII Asset Discovery Agent - Linux Installer

INSTALL_DIR="/opt/governaii-agent"
CONFIG_FILE="$INSTALL_DIR/config.json"
SERVICE_FILE="/etc/systemd/system/governaii-agent.service"

if [ "$1" = "uninstall" ]; then
    echo "Removendo GovernAII Agent..."
    sudo systemctl stop governaii-agent 2>/dev/null
    sudo systemctl disable governaii-agent 2>/dev/null
    sudo rm -f $SERVICE_FILE
    sudo rm -rf $INSTALL_DIR
    sudo systemctl daemon-reload
    echo "Agent removido com sucesso!"
    exit 0
fi

echo "Instalando GovernAII Asset Discovery Agent..."

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "Por favor, execute como root (sudo)"
    exit 1
fi

# Criar diretório de instalação
mkdir -p $INSTALL_DIR

# Criar arquivo de configuração
cat > $CONFIG_FILE << EOF
{
    "token": "${config.token}",
    "empresa_id": "${config.empresa_id}",
    "api_url": "${config.api_url}",
    "api_key": "${config.api_key}",
    "platform": "linux",
    "heartbeat_interval": ${config.heartbeat_interval},
    "sync_interval": ${config.sync_interval}
}
EOF

# Script principal do agente
cat > $INSTALL_DIR/agent.py << 'EOF'
#!/usr/bin/env python3
import json
import time
import requests
import subprocess
import socket
import platform
import logging
import sys
import os

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/governaii-agent.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

class GovernAIIAgent:
    def __init__(self, config_path):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f"Bearer {self.config['api_key']}",
            'Content-Type': 'application/json'
        })
    
    def send_heartbeat(self):
        try:
            hostname = socket.gethostname()
            ip_address = socket.gethostbyname(hostname)
            
            data = {
                'agent_token': self.config['token'],
                'hostname': hostname,
                'ip_address': ip_address,
                'status': 'online'
            }
            
            response = self.session.post(
                f"{self.config['api_url']}/functions/v1/agent-heartbeat",
                json=data
            )
            
            if response.status_code == 200:
                logging.info("Heartbeat sent successfully")
            else:
                logging.error(f"Heartbeat failed: {response.status_code}")
                
        except Exception as e:
            logging.error(f"Failed to send heartbeat: {e}")
    
    def collect_system_info(self):
        try:
            # Informações básicas do sistema
            system_info = {
                'hostname': socket.gethostname(),
                'platform': platform.platform(),
                'architecture': platform.architecture(),
                'processor': platform.processor(),
                'python_version': platform.python_version()
            }
            
            # Informações de hardware
            try:
                # CPU Info
                with open('/proc/cpuinfo', 'r') as f:
                    cpu_info = f.read()
                system_info['cpu_info'] = cpu_info
                
                # Memory Info
                with open('/proc/meminfo', 'r') as f:
                    mem_info = f.read()
                system_info['memory_info'] = mem_info
                
            except Exception as e:
                logging.warning(f"Could not read hardware info: {e}")
            
            # Software instalado (se dpkg disponível)
            try:
                result = subprocess.run(['dpkg', '-l'], capture_output=True, text=True)
                if result.returncode == 0:
                    system_info['installed_packages'] = result.stdout
            except Exception:
                try:
                    result = subprocess.run(['rpm', '-qa'], capture_output=True, text=True)
                    if result.returncode == 0:
                        system_info['installed_packages'] = result.stdout
                except Exception:
                    logging.warning("Could not get package list")
            
            return system_info
            
        except Exception as e:
            logging.error(f"Failed to collect system info: {e}")
            return {}
    
    def sync_assets(self):
        try:
            system_info = self.collect_system_info()
            
            data = {
                'agent_token': self.config['token'],
                'hostname': socket.gethostname(),
                'assets': system_info
            }
            
            response = self.session.post(
                f"{self.config['api_url']}/functions/v1/agent-sync-assets",
                json=data
            )
            
            if response.status_code == 200:
                logging.info("Assets synced successfully")
            else:
                logging.error(f"Asset sync failed: {response.status_code}")
                
        except Exception as e:
            logging.error(f"Failed to sync assets: {e}")
    
    def run(self):
        logging.info("GovernAII Agent started")
        last_sync = 0
        
        while True:
            try:
                # Send heartbeat
                self.send_heartbeat()
                
                # Sync assets once a day
                current_time = time.time()
                if current_time - last_sync > self.config['sync_interval']:
                    self.sync_assets()
                    last_sync = current_time
                
                time.sleep(self.config['heartbeat_interval'])
                
            except KeyboardInterrupt:
                logging.info("Agent stopped by user")
                break
            except Exception as e:
                logging.error(f"Unexpected error: {e}")
                time.sleep(60)  # Wait before retrying

if __name__ == "__main__":
    agent = GovernAIIAgent("/opt/governaii-agent/config.json")
    agent.run()
EOF

chmod +x $INSTALL_DIR/agent.py

# Criar arquivo de serviço systemd
cat > $SERVICE_FILE << EOF
[Unit]
Description=GovernAII Asset Discovery Agent
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 $INSTALL_DIR/agent.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Recarregar systemd e iniciar serviço
systemctl daemon-reload
systemctl enable governaii-agent
systemctl start governaii-agent

echo "GovernAII Agent instalado e iniciado com sucesso!"
echo "Token do agente: ${config.token}"
echo ""
echo "Status: systemctl status governaii-agent"
echo "Logs: journalctl -u governaii-agent -f"
echo "Para desinstalar: sudo $0 uninstall"
`;
}

function generateMacOSPackage(config: any): string {
  return `#!/bin/bash
# GovernAII Asset Discovery Agent - macOS Installer

INSTALL_DIR="/usr/local/opt/governaii-agent"
CONFIG_FILE="$INSTALL_DIR/config.json"
PLIST_FILE="$HOME/Library/LaunchAgents/com.governaii.agent.plist"

if [ "$1" = "uninstall" ]; then
    echo "Removendo GovernAII Agent..."
    launchctl unload $PLIST_FILE 2>/dev/null
    rm -f $PLIST_FILE
    sudo rm -rf $INSTALL_DIR
    echo "Agent removido com sucesso!"
    exit 0
fi

echo "Instalando GovernAII Asset Discovery Agent..."

# Criar diretório de instalação
sudo mkdir -p $INSTALL_DIR

# Criar arquivo de configuração
sudo tee $CONFIG_FILE > /dev/null << EOF
{
    "token": "${config.token}",
    "empresa_id": "${config.empresa_id}",
    "api_url": "${config.api_url}",
    "api_key": "${config.api_key}",
    "platform": "macos",
    "heartbeat_interval": ${config.heartbeat_interval},
    "sync_interval": ${config.sync_interval}
}
EOF

# Script principal do agente
sudo tee $INSTALL_DIR/agent.py > /dev/null << 'EOF'
#!/usr/bin/env python3
import json
import time
import requests
import subprocess
import socket
import platform
import logging
import sys
import os

# Configurar logging
log_file = os.path.expanduser('~/Library/Logs/governaii-agent.log')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout)
    ]
)

class GovernAIIAgent:
    def __init__(self, config_path):
        with open(config_path, 'r') as f:
            self.config = json.load(f)
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f"Bearer {self.config['api_key']}",
            'Content-Type': 'application/json'
        })
    
    def send_heartbeat(self):
        try:
            hostname = socket.gethostname()
            ip_address = socket.gethostbyname(hostname)
            
            data = {
                'agent_token': self.config['token'],
                'hostname': hostname,
                'ip_address': ip_address,
                'status': 'online'
            }
            
            response = self.session.post(
                f"{self.config['api_url']}/functions/v1/agent-heartbeat",
                json=data
            )
            
            if response.status_code == 200:
                logging.info("Heartbeat sent successfully")
            else:
                logging.error(f"Heartbeat failed: {response.status_code}")
                
        except Exception as e:
            logging.error(f"Failed to send heartbeat: {e}")
    
    def collect_system_info(self):
        try:
            # Informações básicas do sistema
            system_info = {
                'hostname': socket.gethostname(),
                'platform': platform.platform(),
                'architecture': platform.architecture(),
                'processor': platform.processor(),
                'python_version': platform.python_version()
            }
            
            # Informações específicas do macOS
            try:
                result = subprocess.run(['system_profiler', 'SPHardwareDataType', '-json'], 
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    system_info['hardware_info'] = result.stdout
                    
                result = subprocess.run(['system_profiler', 'SPSoftwareDataType', '-json'], 
                                      capture_output=True, text=True)
                if result.returncode == 0:
                    system_info['software_info'] = result.stdout
                    
            except Exception as e:
                logging.warning(f"Could not get system profiler info: {e}")
            
            # Aplicações instaladas
            try:
                result = subprocess.run(['ls', '/Applications'], capture_output=True, text=True)
                if result.returncode == 0:
                    system_info['installed_applications'] = result.stdout.split('\n')
            except Exception as e:
                logging.warning(f"Could not get applications list: {e}")
            
            return system_info
            
        except Exception as e:
            logging.error(f"Failed to collect system info: {e}")
            return {}
    
    def sync_assets(self):
        try:
            system_info = self.collect_system_info()
            
            data = {
                'agent_token': self.config['token'],
                'hostname': socket.gethostname(),
                'assets': system_info
            }
            
            response = self.session.post(
                f"{self.config['api_url']}/functions/v1/agent-sync-assets",
                json=data
            )
            
            if response.status_code == 200:
                logging.info("Assets synced successfully")
            else:
                logging.error(f"Asset sync failed: {response.status_code}")
                
        except Exception as e:
            logging.error(f"Failed to sync assets: {e}")
    
    def run(self):
        logging.info("GovernAII Agent started")
        last_sync = 0
        
        while True:
            try:
                # Send heartbeat
                self.send_heartbeat()
                
                # Sync assets once a day
                current_time = time.time()
                if current_time - last_sync > self.config['sync_interval']:
                    self.sync_assets()
                    last_sync = current_time
                
                time.sleep(self.config['heartbeat_interval'])
                
            except KeyboardInterrupt:
                logging.info("Agent stopped by user")
                break
            except Exception as e:
                logging.error(f"Unexpected error: {e}")
                time.sleep(60)  # Wait before retrying

if __name__ == "__main__":
    agent = GovernAIIAgent("/usr/local/opt/governaii-agent/config.json")
    agent.run()
EOF

sudo chmod +x $INSTALL_DIR/agent.py

# Criar arquivo plist para LaunchAgent
mkdir -p "$HOME/Library/LaunchAgents"
tee $PLIST_FILE > /dev/null << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.governaii.agent</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>$INSTALL_DIR/agent.py</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$HOME/Library/Logs/governaii-agent.log</string>
    <key>StandardErrorPath</key>
    <string>$HOME/Library/Logs/governaii-agent.log</string>
</dict>
</plist>
EOF

# Carregar o agente
launchctl load $PLIST_FILE

echo "GovernAII Agent instalado e iniciado com sucesso!"
echo "Token do agente: ${config.token}"
echo ""
echo "Logs: tail -f ~/Library/Logs/governaii-agent.log"
echo "Para desinstalar: $0 uninstall"
`;
}