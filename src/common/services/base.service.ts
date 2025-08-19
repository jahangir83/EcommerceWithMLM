import {
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

export abstract class BaseService<T> {
  /**
   * Throw a NotFoundException with optional entity + id
   */
  protected throwNotFound(entity: string, id?: string | number): never {
    throw new NotFoundException(
      id ? `${entity} with id ${id} not found` : `${entity} not found`,
    );
  }

  /**
   * Throw a BadRequestException with custom message
   */
  protected throwBadRequest(message: string): never {
    throw new BadRequestException(message);
  }

  /**
   * Throw a ConflictException with optional message
   */
  protected throwConflict(entity: string, field?: string): never {
    throw new ConflictException(
      field
        ? `${entity} with ${field} already exists`
        : `${entity} conflict occurred`,
    );
  }

  /**
   * Throw a ForbiddenException with custom message
   */
  protected throwForbidden(message: string): never {
    throw new ForbiddenException(message);
  }

  /**
   * Generic error handler with context-aware logging
   */
  protected handleError(error: any, context = 'BaseService'): never {
    console.error(`[${context}]`, error);

    if (error instanceof BadRequestException) throw error;
    if (error instanceof ConflictException) throw error;
    if (error instanceof NotFoundException) throw error;
    if (error instanceof ForbiddenException) throw error;

    throw new InternalServerErrorException(
      error.message || `Unexpected error occurred in ${context}`,
    );
  }
}
