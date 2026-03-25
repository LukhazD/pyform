import {
  type QuestionType,
  questionTypes,
  type ValidationRules,
  type QuestionOption,
} from "@/models/Question";
import type { FormSettings, FormStyling } from "@/models/Form";

// ---------------------------------------------------------------------------
// Pyform JSON Schema / AST types (what pyform would emit)
// ---------------------------------------------------------------------------

/** A single field definition from pyform's output AST. */
export interface PyformFieldDefinition {
  id: string;
  type: string;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  order?: number;
  validation?: Record<string, unknown>;
  options?: { label: string; value: string }[];
  properties?: Record<string, unknown>;
}

/** Full form schema as emitted by pyform. */
export interface PyformSchema {
  title: string;
  description?: string;
  fields: PyformFieldDefinition[];
  settings?: Partial<FormSettings>;
  styling?: Partial<FormStyling>;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Adapted output types (ready for Mongoose)
// ---------------------------------------------------------------------------

export interface AdaptedQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  isRequired: boolean;
  placeholder?: string;
  order: number;
  validation: ValidationRules;
  options?: QuestionOption[];
}

export interface AdaptedForm {
  title: string;
  description?: string;
  settings: Partial<FormSettings>;
  styling: Partial<FormStyling>;
  questions: AdaptedQuestion[];
  /** Fields that pyform emitted but could not be mapped. */
  unmappedFields: UnmappedField[];
}

export interface UnmappedField {
  originalId: string;
  originalType: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Type mapping
// ---------------------------------------------------------------------------

const KNOWN_TYPES = new Set<string>(questionTypes);

/**
 * Maps a pyform field type string to the closest QuestionType.
 * Returns null if no safe mapping exists.
 */
const TYPE_ALIASES: Record<string, QuestionType> = {
  // Common aliases pyform or external tools might emit
  string: "TEXT",
  text: "TEXT",
  short_text: "TEXT",
  long_text: "TEXTAREA",
  textarea: "TEXTAREA",
  email: "EMAIL",
  number: "NUMBER",
  integer: "NUMBER",
  float: "NUMBER",
  phone: "PHONE",
  tel: "PHONE",
  url: "URL",
  link: "URL",
  select: "DROPDOWN",
  dropdown: "DROPDOWN",
  radio: "MULTIPLE_CHOICE",
  multiple_choice: "MULTIPLE_CHOICE",
  checkbox: "CHECKBOXES",
  checkboxes: "CHECKBOXES",
  multi_select: "CHECKBOXES",
  date: "DATE",
  datetime: "DATE",
  file: "FILE_UPLOAD",
  file_upload: "FILE_UPLOAD",
  attachment: "FILE_UPLOAD",
  welcome: "WELCOME",
  intro: "WELCOME",
  goodbye: "GOODBYE",
  thank_you: "GOODBYE",
  quote: "QUOTE",
  statement: "QUOTE",
};

function resolveQuestionType(rawType: string): QuestionType | null {
  const upper = rawType.toUpperCase();
  if (KNOWN_TYPES.has(upper)) return upper as QuestionType;

  const lower = rawType.toLowerCase();
  return TYPE_ALIASES[lower] ?? null;
}

// ---------------------------------------------------------------------------
// Validation mapping
// ---------------------------------------------------------------------------

function adaptValidation(
  raw: Record<string, unknown> | undefined
): ValidationRules {
  if (!raw) return {};
  const rules: ValidationRules = {};

  if (typeof raw.minLength === "number") rules.minLength = raw.minLength;
  if (typeof raw.maxLength === "number") rules.maxLength = raw.maxLength;
  if (typeof raw.min === "number") rules.min = raw.min;
  if (typeof raw.max === "number") rules.max = raw.max;
  if (typeof raw.pattern === "string") rules.pattern = raw.pattern;
  if (typeof raw.customErrorMessage === "string")
    rules.customErrorMessage = raw.customErrorMessage;

  if (Array.isArray(raw.fileTypes)) {
    rules.fileTypes = raw.fileTypes.filter(
      (t): t is string => typeof t === "string"
    );
  }
  if (typeof raw.maxFileSize === "number") rules.maxFileSize = raw.maxFileSize;

  return rules;
}

// ---------------------------------------------------------------------------
// Options mapping
// ---------------------------------------------------------------------------

/** Turns a label into a URL-safe slug suitable as option value. */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function adaptOptions(
  rawOptions: { label: string; value: string }[] | undefined
): QuestionOption[] | undefined {
  if (!rawOptions || rawOptions.length === 0) return undefined;

  const seen = new Set<string>();

  return rawOptions.map((opt, index) => {
    // Defensive: fall back to slugified label when value is missing/empty
    let value =
      typeof opt.value === "string" && opt.value.trim() !== ""
        ? opt.value
        : slugify(opt.label || `option_${index}`);

    // Ensure uniqueness — duplicate values break RadioGroup selection
    const base = value;
    let suffix = 2;
    while (seen.has(value)) {
      value = `${base}_${suffix++}`;
    }
    seen.add(value);

    return {
      id: `opt_${index}`,
      label: opt.label,
      value,
      order: index,
    };
  });
}

// ---------------------------------------------------------------------------
// Main adapter
// ---------------------------------------------------------------------------

/**
 * PyformAdapter bridges pyform's dynamic JSON Schema / AST output
 * into pyform's strict Mongoose-backed types (IForm, IQuestion).
 *
 * Design principles:
 * - Never throws on unknown field types — collects them as unmappedFields
 * - Validates each field independently so partial schemas still produce usable output
 * - Open/Closed: add new entries to TYPE_ALIASES to support new pyform field types
 */
export function adaptPyformSchema(schema: PyformSchema): AdaptedForm {
  const questions: AdaptedQuestion[] = [];
  const unmappedFields: UnmappedField[] = [];

  for (let i = 0; i < schema.fields.length; i++) {
    const field = schema.fields[i];
    const resolvedType = resolveQuestionType(field.type);

    if (!resolvedType) {
      unmappedFields.push({
        originalId: field.id,
        originalType: field.type,
        reason: `Unknown field type "${field.type}" has no mapping to a supported QuestionType`,
      });
      continue;
    }

    questions.push({
      id: field.id,
      type: resolvedType,
      title: field.label,
      description: field.description,
      isRequired: field.required ?? false,
      placeholder: field.placeholder,
      order: field.order ?? i,
      validation: adaptValidation(field.validation),
      options: adaptOptions(field.options),
    });
  }

  return {
    title: schema.title,
    description: schema.description,
    settings: schema.settings ?? {},
    styling: schema.styling ?? {},
    questions,
    unmappedFields,
  };
}

export type ParseSuccess = { ok: true; schema: PyformSchema };
export type ParseFailure = { ok: false; errors: string[] };
export type ParseResult = ParseSuccess | ParseFailure;

/**
 * Validates a raw unknown payload as a PyformSchema.
 * Returns a typed schema or an array of error strings.
 */
export function parsePyformPayload(raw: unknown): ParseResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { ok: false, errors: ["Payload must be a non-null object"] };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.title !== "string" || obj.title.trim().length === 0) {
    errors.push("title is required and must be a non-empty string");
  }

  if (!Array.isArray(obj.fields)) {
    errors.push("fields must be an array");
  } else {
    const OPTION_TYPES = new Set(["MULTIPLE_CHOICE", "multiple_choice", "radio", "CHECKBOXES", "checkboxes", "checkbox", "multi_select", "DROPDOWN", "dropdown", "select"]);

    for (let i = 0; i < obj.fields.length; i++) {
      const f = obj.fields[i] as Record<string, unknown>;
      if (typeof f.id !== "string") errors.push(`fields[${i}].id must be a string`);
      if (typeof f.type !== "string") errors.push(`fields[${i}].type must be a string`);
      if (typeof f.label !== "string") errors.push(`fields[${i}].label must be a string`);

      // Validate options for types that require them
      if (typeof f.type === "string" && OPTION_TYPES.has(f.type)) {
        if (!Array.isArray(f.options) || f.options.length === 0) {
          errors.push(`fields[${i}] (${f.type}) requires a non-empty options array`);
        } else {
          for (let j = 0; j < (f.options as unknown[]).length; j++) {
            const opt = (f.options as Record<string, unknown>[])[j];
            if (typeof opt.label !== "string" || opt.label.trim() === "") {
              errors.push(`fields[${i}].options[${j}].label must be a non-empty string`);
            }
          }
        }
      }
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    schema: {
      title: obj.title as string,
      description: typeof obj.description === "string" ? obj.description : undefined,
      fields: (obj.fields as PyformFieldDefinition[]),
      settings: typeof obj.settings === "object" ? (obj.settings as Partial<FormSettings>) : undefined,
      styling: typeof obj.styling === "object" ? (obj.styling as Partial<FormStyling>) : undefined,
      metadata: typeof obj.metadata === "object" ? (obj.metadata as Record<string, unknown>) : undefined,
    },
  };
}
