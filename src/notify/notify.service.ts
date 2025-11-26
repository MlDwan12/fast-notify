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
    try {
      const webhook = this.config.get<string>('bitrix.webhook');
      // const res = await axios.get(`${webhook}/crm.lead.fields`);
      // const services = res.data.result.UF_CRM_1667207127324.items;
      await axios
        .post(`${webhook}/crm.lead.add`, {
          fields: {
            TITLE: 'Новый лид с сайта',
            NAME: data.firstName,
            LAST_NAME: data.lastName ?? '',
            PHONE: [{ VALUE: data.phone, VALUE_TYPE: 'WORK' }],
            EMAIL: [{ VALUE: data.email ?? '', VALUE_TYPE: 'WORK' }],
            COMMENTS: `Форма с сайта. Телефон: ${data.phone}. Email: ${data.email}`,
            UF_CRM_1667207127324: data.serviceId ?? null,
            UF_CRM_CREATED_BY_API: true,
          },
        })
        .catch((e) => console.log(e));
    } catch (err) {
      console.error('Ошибка Bitrix:', err);
      throw new InternalServerErrorException('Ошибка интеграции с Bitrix');
    }
  }

  async sendAndCreateLead(dto: LeadPayload) {
    await this.createBitrixLead(dto);

    const adminEmail = this.config.get<string>('mail.admin');
    if (!adminEmail) {
      throw new Error('MAIL_ADMIN is not configured');
    }

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
