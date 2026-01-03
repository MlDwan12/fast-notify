export enum LeadSource {
  CALL = 'CALL', // Входящий звонок
  CALLBACK = 'CALLBACK', // Веб-сайт (обратный звонок)
  WEBFORM = 'WEBFORM', // Электронная почта / CRM-форма
  RC_GENERATOR = 'RC_GENERATOR', // Генератор продаж
  STORE = 'STORE', // Интернет-магазин
  PARTNER = 'PARTNER', // Обзвон закрытых сделок
  RECOMMENDATION = 'RECOMMENDATION', // По рекомендации
  TRADE_SHOW = 'TRADE_SHOW', // Выставка
  BOOKING = 'BOOKING', // Онлайн-запись
  OTHER = 'OTHER', // Другое

  // Мессенджеры / открытые линии
  TELEGRAM = '3|TELEGRAM',
  WHATSAPP = '9|OLCHAT_WA_CONNECTOR_2',
  WHATSAPP_OL_1 = '11|OLCHAT_WA_CONNECTOR_2',

  NEXTBOT_8 = '15|NEXTBOT',
  NEXTBOT_9 = '17|NEXTBOT',
  NEXTBOT_10 = '19|NEXTBOT',

  OPENLINE_CHAT = '1|OPENLINE',

  REPEAT_SALE = 'REPEAT_SALE', // Повторные продажи
}
