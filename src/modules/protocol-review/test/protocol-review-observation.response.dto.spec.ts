import { Committee, ObservationType, ProtocolStatus, ReviewOutcome } from '@prisma/client';
import { ProtocolReviewObservationResponseDto } from '../dtos/response/protocol-review-observation.response.dto';
import { ResearcherProtocolDetailResponseDto } from '../../protocol/dtos/response/researcher-protocol-detail.response.dto';
import type { ResearcherProtocolDetail } from '../../protocol/protocol.include';

describe('ProtocolReviewObservationResponseDto.listFrom', () => {
  it('returns the typed items when the review has them, ignoring the legacy text', () => {
    const result = ProtocolReviewObservationResponseDto.listFrom(
      [
        { type: ObservationType.ADMINISTRATIVE, text: 'Falta la boleta' },
        { type: ObservationType.METHODOLOGICAL, text: 'Objetivo ambiguo' },
      ],
      'TEXTO VIEJO',
    );

    expect(result).toEqual([
      { type: ObservationType.ADMINISTRATIVE, text: 'Falta la boleta' },
      { type: ObservationType.METHODOLOGICAL, text: 'Objetivo ambiguo' },
    ]);
  });

  it('exposes a legacy free-text observation as a single item without type', () => {
    expect(ProtocolReviewObservationResponseDto.listFrom([], 'TEXTO VIEJO')).toEqual([
      { type: null, text: 'TEXTO VIEJO' },
    ]);
  });

  it('returns an empty list when there are neither items nor legacy text', () => {
    expect(ProtocolReviewObservationResponseDto.listFrom([], null)).toEqual([]);
  });
});

describe('ResearcherProtocolDetailResponseDto.from', () => {
  const createdAt = new Date('2026-03-01T00:00:00.000Z');

  const protocol = {
    id: 'p1',
    nroExpediente: '542/2026',
    titulo: 'ESTUDIO',
    fechaRecepcion: createdAt,
    status: ProtocolStatus.CIC_OBSERVED,
    investigadorPrincipal: { id: 'r1', dni: '12345678', firstName: 'ROSA', lastName: 'PINEDO' },
    esEnmienda: false,
    protocoloOriginal: null,
    corrections: [{ id: 'c1', comment: 'Corregido fuera del sistema', createdAt }],
    reviews: [
      {
        id: 'v2',
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: null,
        observationItems: [{ type: ObservationType.INFORMED_CONSENT, text: 'Consentimiento mal redactado' }],
        createdAt,
      },
      {
        id: 'v1',
        committee: Committee.CIC,
        outcome: ReviewOutcome.OBSERVED,
        observations: 'TEXTO VIEJO',
        observationItems: [],
        createdAt,
      },
    ],
    createdAt,
    updatedAt: createdAt,
  } as unknown as ResearcherProtocolDetail;

  it('maps typed and legacy observations and never exposes the reviewer nor payment data', () => {
    const dto = ResearcherProtocolDetailResponseDto.from(protocol);

    expect(dto.reviews[0].observations).toEqual([
      { type: ObservationType.INFORMED_CONSENT, text: 'Consentimiento mal redactado' },
    ]);
    expect(dto.reviews[1].observations).toEqual([{ type: null, text: 'TEXTO VIEJO' }]);
    expect(dto.corrections).toEqual([{ id: 'c1', comment: 'Corregido fuera del sistema', createdAt }]);
    expect(Object.keys(dto.reviews[0])).not.toContain('reviewer');
    expect(Object.keys(dto)).not.toContain('pagoRevision');
  });
});
