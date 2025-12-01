import {
  IsString,
  IsEmail,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { LeadServiceEnum } from 'src/shared/enums/leadService.enum';
import { LeadPayload } from 'src/shared/types/leadPayload.type';

export class CreateLeadDto implements LeadPayload {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsBoolean()
  agreement?: boolean;

  @IsOptional()
  @IsEnum(LeadServiceEnum)
  serviceId?: LeadServiceEnum;
}
