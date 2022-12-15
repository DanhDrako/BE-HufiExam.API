import { PartialType } from '@nestjs/swagger';
import { CreateRealExamOwnDto } from './create-real-exam-own.dto';

export class UpdateRealExamOwnDto extends PartialType(CreateRealExamOwnDto) {}
