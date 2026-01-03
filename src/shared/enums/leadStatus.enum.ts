export enum LeadStatus {
  // PROCESS
  NEW = 'NEW', // Не обработан
  IN_PROCESS = 'IN_PROCESS', // Взят в работу
  DIALOG = 'UC_25IK7W', // Ведется переписка
  INTERNAL_DIALOG = 'UC_ISZTT1', // Внутренние переписки

  // SUCCESS
  CONVERTED = 'CONVERTED', // Качественный лид

  // FAILURE (системные)
  JUNK = 'JUNK', // Не целевой

  // FAILURE (кастомные)
  NOT_PROVIDE_SERVICE = '1', // Целевой, но не можем оказать услугу
  SPAM = '3', // Спам
  OTHER = '2', // Другое
  INTEREST_ONLY = '4', // Интересант
  TOO_EXPENSIVE = '5', // Дорого
  NO_RESPONSE = 'UC_MM8ILW', // Не отвечает
  POSTPONED = 'UC_N9EWL9', // Отложили покупку
}
