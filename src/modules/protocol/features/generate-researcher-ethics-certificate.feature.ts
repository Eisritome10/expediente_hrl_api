import { ConflictException, Injectable } from '@nestjs/common';
import { Committee, ProtocolStatus, ReviewOutcome, RiskLevel } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { FindResearcherProtocolByIdFeature } from './find-researcher-protocol-by-id.feature';

const TEXT = '#000000';
const HEADER_GRAY = '#6b6b6b';

const FRAME_INSET = 24;
const MARGIN = 62;
const TIME_ZONE = 'America/Lima';
const VALIDITY_YEARS = 1;

const RISK_TEXT: Record<RiskLevel, { classification: string; phrase: string }> = {
  NO_RISK: { classification: 'ESTUDIO SIN RIESGO', phrase: 'sin riesgo' },
  MINIMAL_RISK: { classification: 'ESTUDIO CON RIESGO MÍNIMO', phrase: 'de riesgo mínimo' },
  MODERATE_RISK: { classification: 'ESTUDIO CON RIESGO MODERADO', phrase: 'de riesgo moderado' },
  HIGH_RISK: { classification: 'ESTUDIO CON RIESGO ALTO', phrase: 'de riesgo alto' },
};

type Segment = { text: string; bold?: boolean };

// Formato de la constancia física: "05 de enero del 2026".
function formatCertificateDate(date: Date): string {
  const parts = new Intl.DateTimeFormat('es-PE', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('day')} de ${part('month')} del ${part('year')}`;
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

    const document = new PDFDocument({
      size: 'A4',
      margin: MARGIN,
      info: { Title: `Constancia de ética ${protocol.nroExpediente}` },
    });
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      const pageWidth = document.page.width;
      const pageHeight = document.page.height;
      const contentWidth = pageWidth - MARGIN * 2;

      // Párrafo justificado con tramos en negrita: pdfkit pierde los espacios en los cortes de estilo, así que se maqueta a mano.
      const drawRich = (segments: Segment[], x: number, startY: number, width: number, fontSize: number, lineGap: number): number => {
        type Piece = { text: string; bold?: boolean; gap: boolean; width: number };
        const measure = (text: string, bold?: boolean) =>
          document.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize).widthOfString(text);
        const spaceWidth = measure(' ');

        const pieces: Piece[] = [];
        let gap = false;
        for (const segment of segments) {
          for (const token of segment.text.match(/\S+|\s+/g) ?? []) {
            if (/^\s/.test(token)) {
              gap = true;
            } else {
              pieces.push({ text: token, bold: segment.bold, gap: gap && pieces.length > 0, width: measure(token, segment.bold) });
              gap = false;
            }
          }
        }

        const lines: Piece[][] = [[]];
        let lineWidth = 0;
        for (const piece of pieces) {
          const current = lines[lines.length - 1];
          const added = (piece.gap && current.length ? spaceWidth : 0) + piece.width;
          if (current.length && piece.gap && lineWidth + added > width) {
            lines.push([{ ...piece, gap: false }]);
            lineWidth = piece.width;
          } else {
            current.push(piece);
            lineWidth += added;
          }
        }

        const lineHeight = document.font('Helvetica').fontSize(fontSize).currentLineHeight(true) + lineGap;
        let y = startY;
        lines.forEach((line, index) => {
          const gaps = line.filter((piece, i) => i > 0 && piece.gap).length;
          const natural = line.reduce((sum, piece, i) => sum + piece.width + (i > 0 && piece.gap ? spaceWidth : 0), 0);
          const isLast = index === lines.length - 1;
          const gapWidth = !isLast && gaps > 0 ? spaceWidth + (width - natural) / gaps : spaceWidth;
          let cursorX = x;
          line.forEach((piece, i) => {
            if (i > 0 && piece.gap) cursorX += gapWidth;
            document.font(piece.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(fontSize).fillColor(TEXT);
            document.text(piece.text, cursorX, y, { lineBreak: false });
            cursorX += piece.width;
          });
          y += lineHeight;
        });
        return y;
      };

      // Marco de la página
      document
        .rect(FRAME_INSET, FRAME_INSET, pageWidth - FRAME_INSET * 2, pageHeight - FRAME_INSET * 2)
        .lineWidth(0.8)
        .strokeColor(TEXT)
        .stroke();

      // Encabezado institucional
      document.fillColor(HEADER_GRAY).font('Helvetica');
      document.fontSize(11.5).text('GERENCIA REGIONAL DE SALUD - LORETO', MARGIN, 52, { width: contentWidth, align: 'center', lineBreak: false });
      document
        .fontSize(12.5)
        .text('HOSPITAL REGIONAL DE LORETO “FELIPE ARRIOLA IGLESIAS”', MARGIN, 69, { width: contentWidth, align: 'center', lineBreak: false });
      document
        .fontSize(12.5)
        .text('COMITÉ INSTITUCIONAL DE ÉTICA EN INVESTIGACIÓN', MARGIN, 87, { width: contentWidth, align: 'center', lineBreak: false });
      document
        .fontSize(8.5)
        .text('REGISTRADO ANTE EL INSTITUTO NACIONAL DE SALUD | CÓDIGO N.° 026-2026', MARGIN, 107, {
          width: contentWidth,
          align: 'center',
          lineBreak: false,
        });
      document.moveTo(MARGIN, 124).lineTo(pageWidth - MARGIN, 124).lineWidth(0.6).strokeColor(HEADER_GRAY).stroke();

      // Título
      document
        .fillColor(TEXT)
        .font('Helvetica-Bold')
        .fontSize(15)
        .text('CONSTANCIA DE ÉTICA', MARGIN, 146, { width: contentWidth, align: 'center', lineBreak: false });

      // Párrafo de aprobación
      const risk = protocol.catalogadoRiesgo ? RISK_TEXT[protocol.catalogadoRiesgo] : null;
      const approval: Segment[] = [
        {
          text: 'El presidente del Comité Institucional de Ética en Investigación (CIEI) del Hospital Regional de Loreto a través de la Oficina de Apoyo a la Docencia e Investigación, ',
        },
        { text: 'HACE CONSTAR', bold: true },
        { text: ' que el presente proyecto de Investigación, consignado líneas abajo, fue ' },
        { text: 'APROBADO', bold: true },
        {
          text: ', de acuerdo con la normativa nacional vigente y los procedimientos del CIEI-HRL, la evaluación riesgo-beneficio y confiabilidad de la información.',
        },
      ];
      if (risk) {
        approval.push({ text: ' El proyecto fue clasificado como ' }, { text: risk.classification, bold: true });
      }
      approval.push({ text: ', según detalle:' });

      let y = drawRich(approval, MARGIN, 182, contentWidth, 10.5, 4);

      // Detalle del proyecto (etiqueta + valor en negrita)
      const labelWidth = 170;
      const valueWidth = contentWidth - labelWidth;
      y += 18;

      const rows: [string, string][] = [['Título del Proyecto:', `“${protocol.titulo.toUpperCase()}”`]];
      if (protocol.modalidad?.name) rows.push(['Modalidad de investigación:', protocol.modalidad.name.toUpperCase()]);
      rows.push([
        'Investigador principal:',
        `${protocol.investigadorPrincipal.firstName} ${protocol.investigadorPrincipal.lastName}`.toUpperCase(),
      ]);

      rows.forEach(([label, value]) => {
        document.font('Helvetica').fontSize(10.5).fillColor(TEXT).text(label, MARGIN, y, { width: labelWidth - 10 });
        document.font('Helvetica-Bold').fontSize(10.5);
        const height = document.heightOfString(value, { width: valueWidth, align: 'justify', lineGap: 3 });
        document.text(value, MARGIN + labelWidth, y, { width: valueWidth, align: 'justify', lineGap: 3 });
        y += Math.max(height, 14) + 16;
      });

      // Clasificación de riesgo
      if (risk) {
        y = drawRich(
          [
            { text: 'El CIEI clasificó el proyecto como investigación con participación de seres humanos ' },
            { text: risk.phrase, bold: true },
            { text: '.' },
          ],
          MARGIN,
          y + 2,
          contentWidth,
          10.5,
          4,
        );
        y += 14;
      }

      // Vigencia
      const dictamenDate = finalReview.createdAt;
      const expiration = new Date(dictamenDate);
      expiration.setFullYear(expiration.getFullYear() + VALIDITY_YEARS);
      y = drawRich(
        [
          {
            text: `El presente documento tiene vigencia hasta el ${formatCertificateDate(expiration)}. El trámite para su renovación se realizará con un mínimo de 30 días de anticipación a su vencimiento.`,
          },
        ],
        MARGIN,
        y,
        contentWidth,
        10.5,
        4,
      );

      // Lugar y fecha
      drawRich([{ text: `Punchana, ${formatCertificateDate(dictamenDate)}.` }], MARGIN, y + 14, contentWidth, 10.5, 4);

      document.end();
    });
  }
}
