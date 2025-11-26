import { registerAs } from '@nestjs/config';

export default registerAs('bitrix', () => ({
  webhook: process.env.BITRIX_WEBHOOK,
}));
