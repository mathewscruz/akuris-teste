import { jsPDF } from 'jspdf';
import { RiscosStats } from '@/hooks/useRiscosStats';
import { loadAkurisLogo, addAkurisHeader, addAkurisFooter, addSectionTitle, drawProgressBar, drawTableHeader, formatLabel, AKURIS_COLORS } from '@/lib/pdf-utils';

interface RiscoExport {
  nome: string;
  categoria?: { nome: string };
  nivel_risco_inicial: string;
  nivel_risco_residual?: string;
  status: string;
  responsavel_nome?: string;
  data_proxima_revisao?: string;
}

export async function exportRiscosPDF(riscos: RiscoExport[], stats: RiscosStats | undefined) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  const logo = await loadAkurisLogo();
  let y = addAkurisHeader(doc, logo);

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(AKURIS_COLORS.text);
  doc.text('Relatório de Gestão de Riscos', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(AKURIS_COLORS.textLight);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, y, { align: 'center' });
  y += 12;

  // KPIs
  if (stats) {
    y = addSectionTitle(doc, 'Resumo Executivo', y, margin);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(AKURIS_COLORS.text);
    const kpis = [
      `Total de Riscos: ${stats.total}`,
      `Críticos: ${stats.criticos} | Altos: ${stats.altos} | Médios: ${stats.medios} | Baixos: ${stats.baixos}`,
      `Riscos Aceitos: ${stats.aceitos} | Tratados: ${stats.tratados}`,
      `Tratamentos: ${stats.tratamentos_concluidos} concluídos, ${stats.tratamentos_andamento} em andamento, ${stats.tratamentos_pendentes} pendentes`,
      `Score de Risco: ${stats.scoreAtual}/100`,
    ];
    kpis.forEach(kpi => {
      doc.text(kpi, margin + 8, y);
      y += 6;
    });

    // Score bar
    y += 2;
    drawProgressBar(doc, margin + 8, y, contentWidth - 16, 5, stats.scoreAtual, AKURIS_COLORS.primary);
    y += 12;
  }

  // Table
  y = addSectionTitle(doc, 'Lista de Riscos', y, margin);

  drawTableHeader(doc, [
    { text: 'Nome', x: margin + 2 },
    { text: 'Categoria', x: margin + 62 },
    { text: 'Nível', x: margin + 102 },
    { text: 'Residual', x: margin + 125 },
    { text: 'Status', x: margin + 150 },
  ], y, margin, contentWidth);
  y += 5;

  doc.setFont('helvetica', 'normal');
  riscos.forEach((risco, i) => {
    if (y > pageHeight - 25) {
      doc.addPage();
      y = addAkurisHeader(doc, logo);
    }

    if (i % 2 === 0) {
      doc.setFillColor(248, 247, 255);
      doc.rect(margin, y - 3.5, contentWidth, 5.5, 'F');
    }

    doc.setFontSize(7);
    doc.setTextColor(AKURIS_COLORS.text);
    doc.text(risco.nome.substring(0, 30), margin + 2, y);
    doc.text(risco.categoria?.nome?.substring(0, 20) || '-', margin + 62, y);
    doc.text(formatLabel(risco.nivel_risco_inicial) || '-', margin + 102, y);
    doc.text(formatLabel(risco.nivel_risco_residual || '') || '-', margin + 125, y);
    doc.text(formatLabel(risco.status) || '-', margin + 150, y);
    y += 5.5;
  });

  addAkurisFooter(doc);
  doc.save('relatorio-riscos.pdf');
}

export function exportRiscosCSV(riscos: RiscoExport[]) {
  const headers = ['Nome', 'Categoria', 'Nível Inicial', 'Nível Residual', 'Status', 'Responsável', 'Próxima Revisão'];
  const rows = riscos.map(r => [
    r.nome,
    r.categoria?.nome || '',
    formatLabel(r.nivel_risco_inicial),
    formatLabel(r.nivel_risco_residual || ''),
    formatLabel(r.status),
    r.responsavel_nome || '',
    r.data_proxima_revisao || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `riscos-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
}
