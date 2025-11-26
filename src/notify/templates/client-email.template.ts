import { LeadPayload } from 'src/shared/types/leadPayload.type';

export function clientEmailTemplate(data: LeadPayload): string {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial; line-height: 1.6;">

    <h2>Здравствуйте, ${data.firstName}!</h2>

    <p>
      Мы получили ваше обращение и уже работаем над ним.
      В ближайшее время с вами свяжется эксперт.
    </p>

    <p>Вы оставили следующие данные:</p>
    <ul>
      <li>Имя: ${data.firstName}</li>
      <li>Email: ${data.email}</li>
      <li>Телефон: ${data.phone}</li>
    </ul>

    <br />
    <p>Спасибо, что выбрали <b>Vals.Digital</b>.</p>

  </body>
</html>
`;
}
