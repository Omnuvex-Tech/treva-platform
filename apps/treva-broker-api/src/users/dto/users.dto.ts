import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  normalizeEmail,
  trimString,
  trimStringList,
} from '../../auth/dto/normalize';

/**
 * The shapes below are treva-broker's `UserInput` / `UserListQuery`
 * (apps/treva-broker/src/features/users/types.ts). Change both together.
 */
export const USER_ROLES = ['broker', 'top_broker', 'admin'] as const;
export type UserRoleValue = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'blocked', 'invited'] as const;
export type UserStatusValue = (typeof USER_STATUSES)[number];

export class UserListQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number;

  @ApiPropertyOptional({ description: 'Name, surname, phone or email' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: USER_STATUSES })
  @IsOptional()
  @IsIn(USER_STATUSES)
  status?: UserStatusValue;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(60)
  cooperationType?: string;
}

/** Everything is optional so the one DTO serves create, edit and Profile. */
export class SaveUserDto {
  @ApiPropertyOptional({ example: 'Nigar' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(60)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Hasanova' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(60)
  lastName?: string;

  @ApiPropertyOptional({ example: 'nigar.hasanova@example.com' })
  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email?: string;

  /** Profile's own field; bcrypt reads only the first 72 bytes. */
  @ApiPropertyOptional({ minLength: 8, maxLength: 72 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;

  /**
   * Every number on the account, primary first — the "add another number"
   * button beside the field (873:48716). Blank entries are dropped.
   */
  @ApiPropertyOptional({ example: ['+994 50 292 62 12'], type: [String] })
  @IsOptional()
  @Transform(trimStringList)
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  phones?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  jobTitle?: string;

  /** Sent by the form alongside `agency`; the agency is what is stored. */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  organization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(60)
  cooperationType?: string;

  /** A Real Estate Agency's name, or empty for none. */
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  agency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(60)
  accessPermission?: string;

  @ApiPropertyOptional({ enum: USER_ROLES })
  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRoleValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  blocked?: boolean;
}

/** Create needs a name and an address to sign in with. */
export class CreateUserDto extends SaveUserDto {
  @ApiPropertyOptional({ example: 'Nigar' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(60)
  declare firstName: string;

  @ApiPropertyOptional({ example: 'nigar.hasanova@example.com' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'A valid email is required' })
  @MaxLength(254)
  declare email: string;

  /** "Primary number*" on the form (873:48716): at least one is required. */
  @ApiPropertyOptional({ example: ['+994 50 292 62 12'], type: [String] })
  @Transform(trimStringList)
  @IsArray()
  @ArrayMinSize(1, { message: 'Primary number is required' })
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  declare phones: string[];
}

/**
 * The Real Estate Agencies form. The fields are the tab's own five columns
 * (873:48597): Name, Manager, Contacts, Organization and E-Mail.
 *
 * A company cannot exist without an owner, so the manager's three fields are
 * the account that owns it — created alongside the agency, exactly as signing
 * up creates both at once.
 */
export class SaveAgencyDto {
  /**
   * An existing account to put in charge. When it is set, `managerName` and
   * `email` are the account's own and are not read from the form; when it is
   * not, those two fields create the account instead.
   */
  @ApiPropertyOptional({ description: 'An existing unassigned account' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  managerId?: string;

  @ApiPropertyOptional({ example: 'Deha Emlak' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({ example: 'Nigar Hasanova' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  managerName?: string;

  /** The manager's numbers, primary first. */
  @ApiPropertyOptional({ example: ['+994 50 292 62 12'], type: [String] })
  @IsOptional()
  @Transform(trimStringList)
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  phones?: string[];

  /**
   * The new manager's sign-in password. Only read when an account is being
   * created; blank generates a temporary one. bcrypt reads 72 bytes at most.
   */
  @ApiPropertyOptional({ minLength: 8, maxLength: 72 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;

  @ApiPropertyOptional({ example: 'Deha Group MMC' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  organization?: string;

  @ApiPropertyOptional({ example: 'nigar.hasanova@example.com' })
  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail()
  @MaxLength(254)
  email?: string;
}

/** Create needs the agency's name and a manager to own it. */
export class CreateAgencyDto extends SaveAgencyDto {
  @ApiPropertyOptional({ example: 'Deha Emlak' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty({ message: 'Agency name is required' })
  @MaxLength(120)
  declare name: string;

  /**
   * Required only when no `managerId` is chosen — the service checks that,
   * because class-validator cannot express "one of these two".
   */
  @ApiPropertyOptional({ example: 'Nigar Hasanova' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  declare managerName?: string;

  @ApiPropertyOptional({ example: 'nigar.hasanova@example.com' })
  @IsOptional()
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'A valid email is required' })
  @MaxLength(254)
  declare email?: string;
}

export class AgencyListQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;
}
