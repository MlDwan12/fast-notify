import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

import { LeadPayload } from 'src/shared/types/leadPayload.type';
import { adminEmailTemplate } from './templates/admin-email.template';
import { clientEmailTemplate } from './templates/client-email.template';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { adminTitle, userTitle } from 'src/shared/const/mail.const';
import { AppSourceToBitrix } from 'src/shared/const/bitrix/appSource.const';

@Injectable()
export class NotifyService implements OnModuleInit {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('mail.host'),
      port: this.config.get<number>('mail.port'),
      secure: this.config.get<boolean>('mail.secure'),

      auth: {
        user: this.config.get<string>('mail.user'),
        pass: this.config.get<string>('mail.pass'),
      },
      connectionTimeout: 10_000,
      socketTimeout: 10_000,
      greetingTimeout: 10_000,
      family: 4,
    } as SMTPTransport.Options);
    // this.transporter.verify((err, success) => {
    //   console.log('SMTP verify:', err, success);
    // });
  }

  /**
   * Проверяем SMTP ОДИН РАЗ при старте приложения
   * Ошибка здесь НЕ валит приложение
   */
  async onModuleInit() {
    try {
      await this.transporter.verify();
      console.log('[MAIL] SMTP connection ready');
    } catch (err) {
      console.error('[MAIL] SMTP verify failed:', err);
    }
  }

  private async sendMail(params: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('mail.from'),
        ...params,
      });
    } catch (err) {
      console.error('[MAIL] sendMail failed:', err);
    }
  }

  async createBitrixLead(data: LeadPayload, origin: string) {
    const { firstName, lastName, phone, email, serviceId } = data;

    const onlyEmail = email && !firstName && !lastName && !phone;

    const fields = onlyEmail
      ? {
          TITLE: 'Новый лид с сайта на рассылку',
          NAME: '',
          LAST_NAME: '',
          COMMENTS: `Форма с сайта (рассылки). Email: ${email}`,
          EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
          UF_CRM_1667207127324: serviceId ?? null,
          UF_CRM_CREATED_BY_API: true,
        }
      : {
          TITLE: 'Новый лид с сайта',
          NAME: firstName ?? '',
          LAST_NAME: lastName ?? '',
          //           OPPORTUNITY: payload.opportunity || 0,
          //           CURRENCY_ID: payload.currency_id || BitrixCurrency.RUB,
          PHONE: phone ? [{ VALUE: phone, VALUE_TYPE: 'WORK' }] : [],
          EMAIL: email ? [{ VALUE: email, VALUE_TYPE: 'WORK' }] : [],
          COMMENTS: `Форма с сайта: ${origin}. Телефон: ${phone}. Email: ${email}`,
          SOURCE_ID: AppSourceToBitrix.SITE,
          WEB: [
            {
              VALUE: origin,
              VALUE_TYPE: 'WORK',
            },
          ],
          UF_CRM_1667207127324: serviceId ? String(serviceId) : undefined,
          UF_CRM_CREATED_BY_API: true,
        };

    const webhook = this.config.get<string>('bitrix.webhook');

    if (!webhook) {
      throw new InternalServerErrorException(
        'Bitrix webhook is not configured',
      );
    }

    try {
      await axios.post(
        `${webhook}/crm.lead.add`,
        { fields },
        { timeout: 10_000 },
      );
    } catch (err) {
      console.error('[BITRIX] error:', err);
      throw new InternalServerErrorException('Ошибка интеграции с Bitrix');
    }
  }

  async sendAndCreateLead(dto: LeadPayload, origin: string): Promise<void> {
    await this.createBitrixLead(dto, origin);

    const adminEmail = this.config.get<string>('mail.admin');
    if (!adminEmail) {
      console.warn('[MAIL] MAIL_ADMIN is not configured');
      return;
    }

    // письмо админу
    await this.sendMail({
      to: adminEmail,
      subject: adminTitle,
      text: adminEmailTemplate(dto, origin),
    });

    // письмо клиенту (если есть email)
    if (dto.email) {
      await this.sendMail({
        to: dto.email,
        subject: userTitle,
        html: clientEmailTemplate(dto),
      });
    }
  }
}
