import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsDateStringBiggerThen(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsDateBiggerThen',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          const currentDate = new Date(value);
          const prevDate = new Date(relatedValue);
          return typeof value === 'string' && typeof relatedValue === 'string' && currentDate > prevDate;
        },
      },
    });
  };
}