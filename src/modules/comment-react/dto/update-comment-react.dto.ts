import { PartialType } from '@nestjs/mapped-types';
import { CreateCommentReactDto } from './create-comment-react.dto';

export class UpdateCommentReactDto extends PartialType(CreateCommentReactDto) {}
