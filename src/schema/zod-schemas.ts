import { z } from 'zod';

export const FieldTypeSchema = z.enum([
  'text',
  'email',
  'password',
  'number',
  'tel',
  'url',
  'date',
  'datetime-local',
  'time',
  'textarea',
  'select',
  'radio',
  'checkbox',
]);

export const SelectOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const FieldDefinitionSchema = z
  .object({
    key: z.string().min(1, 'Field key must not be empty'),
    label: z.string().min(1, 'Field label must not be empty'),
    description: z.string().optional(),
    type: FieldTypeSchema,
    options: z.array(SelectOptionSchema).optional(),
    required: z.boolean().optional(),
    selector: z.string().optional(),
  })
  .refine(
    (field) => {
      if (field.type === 'select' || field.type === 'radio') {
        return Array.isArray(field.options) && field.options.length > 0;
      }
      return true;
    },
    { message: 'Fields of type "select" or "radio" must have at least one option' }
  );

export const FormConfigSchema = z.object({
  title: z.string().min(1, 'Form title must not be empty'),
  description: z.string().optional(),
  fields: z
    .array(FieldDefinitionSchema)
    .min(1, 'Form must have at least one field')
    .refine(
      (fields) => {
        const keys = fields.map((f) => f.key);
        return new Set(keys).size === keys.length;
      },
      { message: 'All field keys must be unique' }
    ),
});

export type FormConfigInput = z.input<typeof FormConfigSchema>;

export function validateFormConfig(config: unknown) {
  return FormConfigSchema.safeParse(config);
}
