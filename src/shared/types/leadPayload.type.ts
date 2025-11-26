import { LeadServiceEnum } from '../enums/leadService.enum';

export interface LeadPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  agreement: boolean;
  serviceId?: LeadServiceEnum;
}
