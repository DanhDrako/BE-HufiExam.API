import { PartialType } from '@nestjs/mapped-types';
import { CreateUser2userMessageDto } from './create-user2user-message.dto';

export class UpdateUser2userMessageDto extends PartialType(CreateUser2userMessageDto) {}
