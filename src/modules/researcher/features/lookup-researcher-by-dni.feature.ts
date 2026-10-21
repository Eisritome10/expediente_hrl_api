import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { ReniecPerson } from '../dtos/response/reniec-person.response.dto';
import { ReniecDniNotFoundException } from '../exceptions/reniec-dni-not-found.exception';
import { ReniecNotConfiguredException } from '../exceptions/reniec-not-configured.exception';
import { ReniecUnavailableException } from '../exceptions/reniec-unavailable.exception';
import { ResearcherDniAlreadyExistsException } from '../exceptions/researcher-dni-already-exists.exception';

const REQUEST_TIMEOUT_MS = 5000;

interface ReniecResponse {
  encontrado?: boolean;
  paciente?: { dni?: string; nombres?: string; ap_pat?: string; ap_mat?: string } | null;
}

// Consulta el DNI en RENIEC (proveedor NUITI) para autocompletar nombres y apellidos al crear un investigador.
@Injectable()
export class LookupResearcherByDniFeature {
  private readonly logger = new Logger(LookupResearcherByDniFeature.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dni: string): Promise<ReniecPerson> {
    const baseUrl = this.configService.get<string>('reniec.baseUrl');
    const token = this.configService.get<string>('reniec.token');

    if (!baseUrl || !token) {
      throw new ReniecNotConfiguredException();
    }

    // Si ya está registrado no tiene sentido consultar: el alta fallaría igual por DNI duplicado.
    const existing = await this.prisma.researcher.findUnique({ where: { dni }, select: { id: true } });
    if (existing) {
      throw new ResearcherDniAlreadyExistsException(dni);
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl.replace(/\/$/, '')}/${dni}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      this.logger.warn(`RENIEC request failed: ${(error as Error).message}`);
      throw new ReniecUnavailableException();
    }

    if (response.status === 404) {
      throw new ReniecDniNotFoundException(dni);
    }
    if (!response.ok) {
      // 401/403 = token inválido; 5xx = caída del proveedor. En ambos casos el usuario puede seguir a mano.
      this.logger.warn(`RENIEC responded with status ${response.status}`);
      throw new ReniecUnavailableException();
    }

    let body: ReniecResponse;
    try {
      body = (await response.json()) as ReniecResponse;
    } catch {
      throw new ReniecUnavailableException();
    }

    const person = body.paciente;
    if (!body.encontrado || !person?.nombres || !person.ap_pat) {
      throw new ReniecDniNotFoundException(dni);
    }

    // Se conservan todos los nombres y ambos apellidos tal como los devuelve RENIEC (solo se limpian espacios).
    const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toUpperCase();

    return {
      dni,
      firstName: normalize(person.nombres),
      lastName: normalize([person.ap_pat, person.ap_mat].filter(Boolean).join(' ')),
    };
  }
}
