import { ConflictException, Injectable } from '@nestjs/common';
import { Committee, ProtocolStatus, ReviewOutcome, RiskLevel } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { FindResearcherProtocolByIdFeature } from './find-researcher-protocol-by-id.feature';

const BRAND = '#146c43';
const BRAND_DARK = '#0f4c29';
const BRAND_LIGHT = '#eaf5ee';
const TEXT = '#1c1f1d';
const MUTED = '#5c655f';
const BORDER = '#d5dbd7';

const MARGIN = 56;
const TIME_ZONE = 'America/Lima';

const RISK_LABELS: Record<RiskLevel, string> = {
  NO_RISK: 'Sin riesgo',
  MINIMAL_RISK: 'Riesgo mínimo',
  MODERATE_RISK: 'Riesgo moderado',
  HIGH_RISK: 'Riesgo alto',
};

function formatLongDate(date: Date): string {
  return date.toLocaleDateString('es-PE', { timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric' });
}

@Injectable()
export class GenerateResearcherEthicsCertificateFeature {
  constructor(private readonly findResearcherProtocolByIdFeature: FindResearcherProtocolByIdFeature) {}

  async execute(userId: string, protocolId: string): Promise<Buffer> {
    const protocol = await this.findResearcherProtocolByIdFeature.execute(userId, protocolId);
    const finalReview = protocol.reviews.find(
      (review) => review.committee === Committee.CIEI && review.outcome === ReviewOutcome.FINALIZED,
    );

    if (protocol.status !== ProtocolStatus.FINALIZED || !finalReview) {
      throw new ConflictException('La constancia estará disponible cuando el CIEI finalice la aprobación.');
    }

    const document = new PDFDocument({ size: 'A4', margin: MARGIN, info: { Title: `Constancia de aprobación ética ${protocol.nroExpediente}` } });
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      const pageWidth = document.page.width;
      const pageHeight = document.page.height;
      const contentWidth = pageWidth - MARGIN * 2;

      // Banda institucional
      document.rect(0, 0, pageWidth, 118).fill(BRAND);
      document.rect(0, 118, pageWidth, 4).fill(BRAND_DARK);
      document
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(19)
        .text('HOSPITAL REGIONAL DE LORETO', MARGIN, 34, { width: contentWidth, align: 'center' });
      document
        .font('Helvetica')
        .fontSize(11)
        .text('Comité de Ética en Investigación (CIEI)', MARGIN, 62, { width: contentWidth, align: 'center' });
      document
        .fontSize(9)
        .fillColor('#cbe6d3')
        .text('Oficina de Apoyo a la Docencia e Investigación', MARGIN, 82, { width: contentWidth, align: 'center' });

      // Título
      document
        .fillColor(BRAND_DARK)
        .font('Helvetica-Bold')
        .fontSize(18)
        .text('CONSTANCIA DE APROBACIÓN ÉTICA', MARGIN, 166, { width: contentWidth, align: 'center' });
      document
        .moveTo(pageWidth / 2 - 40, 196)
        .lineTo(pageWidth / 2 + 40, 196)
        .lineWidth(2)
        .strokeColor(BRAND)
        .stroke();

      // Cuerpo
      const investigator = `${protocol.investigadorPrincipal.firstName} ${protocol.investigadorPrincipal.lastName}`;
      document
        .fillColor(TEXT)
        .font('Helvetica')
        .fontSize(11.5)
        .text(
          `Se deja constancia de que el protocolo de investigación detallado a continuación fue evaluado y aprobado por el Comité de Ética en Investigación (CIEI) del Hospital Regional de Loreto.`,
          MARGIN,
          222,
          { width: contentWidth, align: 'justify', lineGap: 5 },
        );

      // Tabla de datos
      const rows: [string, string][] = [
        ['N° de expediente', protocol.nroExpediente],
        ['Título del protocolo', protocol.titulo],
        ['Investigador principal', investigator],
      ];
      if (protocol.catalogadoRiesgo) {
        rows.push(['Nivel de riesgo catalogado', RISK_LABELS[protocol.catalogadoRiesgo]]);
      }
      rows.push(['Fecha del dictamen final', formatLongDate(finalReview.createdAt)]);

      const labelWidth = 185;
      const cellPadding = 9;
      let y = document.y + 22;

      rows.forEach(([label, value], index) => {
        document.font('Helvetica-Bold').fontSize(10.5);
        const valueHeight = document.font('Helvetica').fontSize(11).heightOfString(value, { width: contentWidth - labelWidth - cellPadding * 2 });
        const rowHeight = Math.max(valueHeight, 14) + cellPadding * 2;

        document.rect(MARGIN, y, contentWidth, rowHeight).fill(index % 2 === 0 ? BRAND_LIGHT : '#ffffff');
        document
          .rect(MARGIN, y, contentWidth, rowHeight)
          .lineWidth(0.5)
          .strokeColor(BORDER)
          .stroke();
        document
          .fillColor(BRAND_DARK)
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(label.toUpperCase(), MARGIN + cellPadding, y + cellPadding + 1, { width: labelWidth - cellPadding });
        document
          .fillColor(TEXT)
          .font('Helvetica')
          .fontSize(11)
          .text(value, MARGIN + labelWidth + cellPadding, y + cellPadding, { width: contentWidth - labelWidth - cellPadding * 2 });

        y += rowHeight;
      });

      // Firma
      const signatureY = Math.max(y + 110, 600);
      document
        .moveTo(pageWidth / 2 - 110, signatureY)
        .lineTo(pageWidth / 2 + 110, signatureY)
        .lineWidth(0.8)
        .strokeColor(TEXT)
        .stroke();
      document
        .fillColor(TEXT)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('Comité de Ética en Investigación', MARGIN, signatureY + 8, { width: contentWidth, align: 'center' });
      document
        .fillColor(MUTED)
        .font('Helvetica')
        .fontSize(10)
        .text('Hospital Regional de Loreto', MARGIN, signatureY + 24, { width: contentWidth, align: 'center' });

      // Pie de página (sin margen inferior para que pdfkit no abra otra página)
      document.page.margins.bottom = 0;
      document.rect(MARGIN, pageHeight - 62, contentWidth, 0.8).fill(BORDER);
      document
        .fillColor(MUTED)
        .font('Helvetica')
        .fontSize(8.5)
        .text(
          `Documento generado automáticamente por el sistema de seguimiento de protocolos el ${formatLongDate(new Date())}.`,
          MARGIN,
          pageHeight - 50,
          { width: contentWidth, align: 'center', lineBreak: false },
        );

      document.end();
    });
  }
}
