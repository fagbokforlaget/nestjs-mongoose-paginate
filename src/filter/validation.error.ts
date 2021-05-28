import { BadRequestException } from '@nestjs/common';

export class FilterValidationError extends BadRequestException {}
