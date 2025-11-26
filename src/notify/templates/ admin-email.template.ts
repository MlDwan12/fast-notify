import { LeadPayload } from 'src/shared/types/leadPayload.type';

export function adminEmailTemplate(data: LeadPayload): string {
  return `
Новый лид с сайта vals.digital

Имя: ${data.firstName}
Фамилия: ${data.lastName ?? ''}
Телефон: ${data.phone}
Email: ${data.email}

---
Отправлено автоматически с сайта.
  `;
}
