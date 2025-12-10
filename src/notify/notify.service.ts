import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

import { LeadPayload } from 'src/shared/types/leadPayload.type';
import { adminEmailTemplate } from './templates/ admin-email.template';
import { clientEmailTemplate } from './templates/client-email.template';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { adminTitle, userTitle } from 'src/shared/const/mail.const';

@Injectable()
export class NotifyService {
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
      family: 4,
    } as SMTPTransport.Options);
    this.transporter.verify((err, success) => {
      console.log('SMTP verify:', err, success);
    });
  }

  sendMail(params: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    try {
      this.transporter
        .sendMail({
          from: this.config.get('mail.from'),
          ...params,
        })
        .catch((e) => console.log(e));
    } catch (error) {
      console.error('Ошибка sendMail:', error);
      throw new InternalServerErrorException('Ошибка интеграции с mail');
    }
  }

  async createBitrixLead(data: LeadPayload) {
    const { firstName, lastName, phone, email, serviceId } = data;

    const onlyEmail = email && !firstName && !lastName && !phone;

    const fields = onlyEmail
      ? {
          TITLE: 'Новый лид с сайта на рассылку',
          NAME: '',
          LAST_NAME: '',
          EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
          COMMENTS: `Форма с сайта (рассылки). Email: ${email}`,
          UF_CRM_1667207127324: serviceId ?? null,
          UF_CRM_CREATED_BY_API: true,
        }
      : {
          TITLE: 'Новый лид с сайта',
          NAME: firstName ?? '',
          LAST_NAME: lastName ?? '',
          PHONE: phone ? [{ VALUE: phone, VALUE_TYPE: 'WORK' }] : [],
          EMAIL: email ? [{ VALUE: email, VALUE_TYPE: 'WORK' }] : [],
          COMMENTS: `Форма с сайта: https://valsdigital.ru. Телефон: ${phone}. Email: ${email}`,
          SOURCE_ID: 'CALLBACK',
          WEB: [
            {
              VALUE: 'https://valsdigital.ru',
              VALUE_TYPE: 'WORK',
            },
          ],
          UF_CRM_1667207127324: serviceId ? String(serviceId) : undefined,
          UF_CRM_CREATED_BY_API: true,
        };

    try {
      const webhook = this.config.get<string>('bitrix.webhook');
      // const res = await axios.get(`${webhook}/crm.lead.fields`);
      // const services = res.data.result.UF_CRM_1667207127324.items;

      await axios
        .post(`${webhook}/crm.lead.add`, {
          fields,
        })
        .catch((e) => console.log(e));
    } catch (err) {
      console.error('Ошибка Bitrix:', err);
      throw new InternalServerErrorException('Ошибка интеграции с Bitrix');
    }
  }

  async sendAndCreateLead(dto: LeadPayload) {
    console.log(dto);

    await this.createBitrixLead(dto);

    const adminEmail = this.config.get<string>('mail.admin');
    if (!adminEmail) {
      throw new Error('MAIL_ADMIN is not configured');
    }

    if (dto.email) {
      this.sendMail({
        to: adminEmail,
        subject: adminTitle,
        text: adminEmailTemplate(dto),
      });

      this.sendMail({
        to: dto.email,
        subject: userTitle,
        html: clientEmailTemplate(dto),
      });
    }
  }
}
