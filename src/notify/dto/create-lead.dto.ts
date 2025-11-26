import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { LeadServiceEnum } from 'src/shared/enums/leadService.enum';
import { LeadPayload } from 'src/shared/types/leadPayload.type';

export class CreateLeadDto implements LeadPayload {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  agreement: boolean;

  @IsOptional()
  @IsEnum(LeadServiceEnum)
  serviceId?: LeadServiceEnum;
}
