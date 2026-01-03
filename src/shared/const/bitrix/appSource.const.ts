import { AppSource } from 'src/shared/enums/appSource.enum';
import { LeadSource } from 'src/shared/enums/leadSource.enum';

export const AppSourceToBitrix: Record<AppSource, LeadSource> = {
  [AppSource.TELEGRAM]: LeadSource.TELEGRAM,
  [AppSource.WHATSAPP]: LeadSource.WHATSAPP,
  [AppSource.SITE]: LeadSource.CALLBACK,
};
