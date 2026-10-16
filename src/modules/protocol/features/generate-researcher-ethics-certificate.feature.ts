import { ConflictException, Injectable } from '@nestjs/common';
import { Committee, ProtocolStatus, ReviewOutcome } from '@prisma/client';
import PDFDocument from 'pdfkit';
import { FindResearcherProtocolByIdFeature } from './find-researcher-protocol-by-id.feature';

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

    const document = new PDFDocument({ size: 'A4', margin: 64 });
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('end', () => resolve(Buffer.concat(chunks)));
      document.on('error', reject);

      document.font('Helvetica-Bold').fontSize(16).text('COMITÉ DE ÉTICA EN INVESTIGACIÓN', { align: 'center' });
      document.moveDown(0.5);
      document.font('Helvetica').fontSize(12).text('CONSTANCIA DE APROBACIÓN ÉTICA', { align: 'center' });
      document.moveDown(3);
      document.fontSize(12).text(
        `Se deja constancia de que el protocolo de investigación N° ${protocol.nroExpediente}, titulado «${protocol.titulo}», cuyo investigador principal es ${protocol.investigadorPrincipal.firstName} ${protocol.investigadorPrincipal.lastName}, fue aprobado por el Comité de Ética en Investigación (CIEI).`,
        { align: 'justify', lineGap: 8 },
      );
      document.moveDown(1.5);
      document.text(
        `Fecha del dictamen final: ${finalReview.createdAt.toLocaleDateString('es-PE', { timeZone: 'America/Lima' })}.`,
        { align: 'justify' },
      );
      document.moveDown(4);
      document.text('__________________________________', { align: 'center' });
      document.text('Comité de Ética en Investigación (CIEI)', { align: 'center' });
      document.end();
    });
  }
}