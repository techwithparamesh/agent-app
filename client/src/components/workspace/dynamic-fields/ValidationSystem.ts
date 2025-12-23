/**
 * Field Validation System
 * 
 * Comprehensive validation for dynamic fields with:
 * - Rule-based validation
 * - Real-time validation
 * - Pre-execution validation
 * - Error aggregation and display
 */

import type { 
  FieldSchema, 
  ActionSchema, 
  FieldValidation,
  AIValidationResult 
} from './types';

// ============================================
// TYPES
// ============================================

export interface ValidationError {
  fieldId: string;
  fieldName: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  fieldErrors: Record<string, string[]>;
}

export interface FieldValidationContext {
  field: FieldSchema;
  value: any;
  allValues: Record<string, any>;
  nodeType: 'trigger' | 'action';
}

// ============================================
// VALIDATION RULES
// ============================================

type ValidationRule = (context: FieldValidationContext) => string | null;

/**
 * Required field validation
 */
const requiredRule: ValidationRule = ({ field, value }) => {
  if (!field.validation?.required) return null;
  
  if (value === undefined || value === null || value === '') {
    return `${field.name} is required`;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return `${field.name} requires at least one item`;
  }
  
  return null;
};

/**
 * String length validation
 */
const stringLengthRule: ValidationRule = ({ field, value }) => {
  if (typeof value !== 'string') return null;
  
  const { minLength, maxLength } = field.validation || {};
  
  if (minLength !== undefined && value.length < minLength) {
    return `${field.name} must be at least ${minLength} characters`;
  }
  
  if (maxLength !== undefined && value.length > maxLength) {
    return `${field.name} must be at most ${maxLength} characters`;
  }
  
  return null;
};

/**
 * Number range validation
 */
const numberRangeRule: ValidationRule = ({ field, value }) => {
  if (typeof value !== 'number') return null;
  
  const { min, max } = field.validation || {};
  
  if (min !== undefined && value < min) {
    return `${field.name} must be at least ${min}`;
  }
  
  if (max !== undefined && value > max) {
    return `${field.name} must be at most ${max}`;
  }
  
  return null;
};

/**
 * Pattern validation
 */
const patternRule: ValidationRule = ({ field, value }) => {
  if (typeof value !== 'string' || !field.validation?.pattern) return null;
  
  const regex = new RegExp(field.validation.pattern);
  if (!regex.test(value)) {
    return field.validation.patternMessage || `${field.name} format is invalid`;
  }
  
  return null;
};

/**
 * Email validation
 */
const emailRule: ValidationRule = ({ field, value }) => {
  if (field.type !== 'email' || !value) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return `${field.name} must be a valid email address`;
  }
  
  return null;
};

/**
 * URL validation
 */
const urlRule: ValidationRule = ({ field, value }) => {
  if (field.type !== 'url' || !value) return null;
  
  try {
    new URL(value);
    return null;
  } catch {
    return `${field.name} must be a valid URL`;
  }
};

/**
 * JSON validation
 */
const jsonRule: ValidationRule = ({ field, value }) => {
  if (field.type !== 'json') return null;
  if (!value) return null;
  
  if (typeof value === 'string') {
    try {
      JSON.parse(value);
      return null;
    } catch {
      return `${field.name} must be valid JSON`;
    }
  }
  
  return null;
};

/**
 * Select option validation
 */
const selectOptionRule: ValidationRule = ({ field, value }) => {
  if (field.type !== 'select' || !value) return null;
  if (field.allowCustom) return null;
  if (!field.options?.length) return null;
  
  const validValues = field.options.map(o => o.value);
  if (!validValues.includes(value)) {
    return `${field.name} must be one of the available options`;
  }
  
  return null;
};

/**
 * Multi-select validation
 */
const multiSelectRule: ValidationRule = ({ field, value }) => {
  if (field.type !== 'multi-select') return null;
  if (!Array.isArray(value) || !value.length) return null;
  if (field.allowCustom) return null;
  if (!field.options?.length) return null;
  
  const validValues = field.options.map(o => o.value);
  const invalidValues = value.filter(v => !validValues.includes(v));
  
  if (invalidValues.length > 0) {
    return `${field.name} contains invalid options: ${invalidValues.join(', ')}`;
  }
  
  return null;
};

/**
 * Array validation
 */
const arrayRule: ValidationRule = ({ field, value }) => {
  if (field.type !== 'array') return null;
  
  const { minItems, maxItems } = field.validation || {};
  
  if (!Array.isArray(value)) {
    if (minItems && minItems > 0) {
      return `${field.name} is required`;
    }
    return null;
  }
  
  if (minItems !== undefined && value.length < minItems) {
    return `${field.name} must have at least ${minItems} items`;
  }
  
  if (maxItems !== undefined && value.length > maxItems) {
    return `${field.name} must have at most ${maxItems} items`;
  }
  
  return null;
};

/**
 * Custom validator function
 */
const customValidatorRule: ValidationRule = ({ field, value, allValues }) => {
  if (!field.validation?.custom) return null;
  
  // If custom is a function, call it
  if (typeof field.validation.custom === 'function') {
    try {
      const result = field.validation.custom(value, allValues);
      if (typeof result === 'string') {
        return result;
      }
      return null;
    } catch (error) {
      return `Validation error: ${(error as Error).message}`;
    }
  }
  
  // If custom is a string, it's a pattern or expression - skip for now
  return null;
};

// Collect all validation rules
const validationRules: ValidationRule[] = [
  requiredRule,
  stringLengthRule,
  numberRangeRule,
  patternRule,
  emailRule,
  urlRule,
  jsonRule,
  selectOptionRule,
  multiSelectRule,
  arrayRule,
  customValidatorRule,
];

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate a single field
 */
export function validateField(context: FieldValidationContext): string[] {
  const errors: string[] = [];
  
  for (const rule of validationRules) {
    const error = rule(context);
    if (error) {
      errors.push(error);
    }
  }
  
  return errors;
}

/**
 * Validate all fields in an action
 */
export function validateAction(
  schema: ActionSchema,
  values: Record<string, any>,
  nodeType: 'trigger' | 'action' = 'action'
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const fieldErrors: Record<string, string[]> = {};
  
  // Validate each field
  for (const field of schema.fields || []) {
    // Skip hidden fields
    if (!isFieldVisible(field, values)) continue;
    
    const context: FieldValidationContext = {
      field,
      value: values[field.id],
      allValues: values,
      nodeType,
    };
    
    const fieldValidationErrors = validateField(context);
    
    if (fieldValidationErrors.length > 0) {
      fieldErrors[field.id] = fieldValidationErrors;
      
      fieldValidationErrors.forEach(message => {
        errors.push({
          fieldId: field.id,
          fieldName: field.name,
          type: 'error',
          message,
        });
      });
    }
  }
  
  // Check credential if required
  if (schema.requiresCredential && !values._credential) {
    errors.push({
      fieldId: '_credential',
      fieldName: 'Credentials',
      type: 'error',
      message: `${schema.name} requires credentials to be configured`,
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    fieldErrors,
  };
}

/**
 * Validate multiple nodes before workflow execution
 */
export function validateWorkflow(
  nodes: Array<{
    id: string;
    schema: ActionSchema;
    values: Record<string, any>;
    type: 'trigger' | 'action';
  }>
): {
  isValid: boolean;
  nodeErrors: Record<string, ValidationResult>;
  totalErrors: number;
  totalWarnings: number;
} {
  const nodeErrors: Record<string, ValidationResult> = {};
  let totalErrors = 0;
  let totalWarnings = 0;
  
  for (const node of nodes) {
    const result = validateAction(node.schema, node.values, node.type);
    nodeErrors[node.id] = result;
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;
  }
  
  return {
    isValid: totalErrors === 0,
    nodeErrors,
    totalErrors,
    totalWarnings,
  };
}

// ============================================
// VISIBILITY HELPERS
// ============================================

/**
 * Check if a field should be visible based on conditions
 */
export function isFieldVisible(field: FieldSchema, allValues: Record<string, any>): boolean {
  // Check showWhen conditions (all must be true to show)
  if (field.showWhen && field.showWhen.length > 0) {
    const shouldShow = field.showWhen.every(condition => {
      const fieldValue = allValues[condition.field];
      return evaluateCondition(condition, fieldValue);
    });
    if (!shouldShow) return false;
  }
  
  // Check hideWhen conditions (any true = hide)
  if (field.hideWhen && field.hideWhen.length > 0) {
    const shouldHide = field.hideWhen.some(condition => {
      const fieldValue = allValues[condition.field];
      return evaluateCondition(condition, fieldValue);
    });
    if (shouldHide) return false;
  }
  
  return true;
}

/**
 * Evaluate a display condition
 */
function evaluateCondition(
  condition: { field: string; condition: string; value?: any; values?: any[] },
  fieldValue: any
): boolean {
  switch (condition.condition) {
    case 'equals':
      return fieldValue === condition.value;
    case 'notEquals':
      return fieldValue !== condition.value;
    case 'in':
      return condition.values?.includes(fieldValue) ?? false;
    case 'notIn':
      return !(condition.values?.includes(fieldValue) ?? true);
    case 'empty':
      return !fieldValue || fieldValue === '' || 
             (Array.isArray(fieldValue) && fieldValue.length === 0);
    case 'notEmpty':
      return fieldValue && fieldValue !== '' && 
             (!Array.isArray(fieldValue) || fieldValue.length > 0);
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(condition.value);
    case 'greaterThan':
      return typeof fieldValue === 'number' && fieldValue > condition.value;
    case 'lessThan':
      return typeof fieldValue === 'number' && fieldValue < condition.value;
    default:
      return true;
  }
}

// ============================================
// ERROR FORMATTING
// ============================================

/**
 * Format validation errors for display
 */
export function formatValidationErrors(result: ValidationResult): string {
  if (result.isValid) return '';
  
  const errorMessages = result.errors.map(e => `• ${e.message}`);
  return errorMessages.join('\n');
}

/**
 * Get error summary for a workflow validation
 */
export function getValidationSummary(
  nodeErrors: Record<string, ValidationResult>
): string {
  const errorCount = Object.values(nodeErrors)
    .reduce((sum, r) => sum + r.errors.length, 0);
  
  const warningCount = Object.values(nodeErrors)
    .reduce((sum, r) => sum + r.warnings.length, 0);
  
  if (errorCount === 0 && warningCount === 0) {
    return 'Workflow is valid';
  }
  
  const parts: string[] = [];
  if (errorCount > 0) {
    parts.push(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
  }
  if (warningCount > 0) {
    parts.push(`${warningCount} warning${warningCount > 1 ? 's' : ''}`);
  }
  
  return parts.join(', ');
}

// ============================================
// REAL-TIME VALIDATION HOOK
// ============================================

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseFieldValidationOptions {
  debounceMs?: number;
  validateOnChange?: boolean;
}

interface UseFieldValidationResult {
  errors: Record<string, string[]>;
  validateField: (fieldId: string, value: any) => void;
  validateAll: () => ValidationResult;
  clearErrors: () => void;
  isValidating: boolean;
}

export function useFieldValidation(
  schema: ActionSchema,
  values: Record<string, any>,
  options?: UseFieldValidationOptions
): UseFieldValidationResult {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const debounceMs = options?.debounceMs ?? 300;
  const validateOnChange = options?.validateOnChange ?? true;
  
  const validateSingleField = useCallback((fieldId: string, value: any) => {
    const field = schema.fields?.find(f => f.id === fieldId);
    if (!field) return;
    
    const context: FieldValidationContext = {
      field,
      value,
      allValues: { ...values, [fieldId]: value },
      nodeType: 'action',
    };
    
    const fieldErrors = validateField(context);
    
    setErrors(prev => ({
      ...prev,
      [fieldId]: fieldErrors,
    }));
  }, [schema.fields, values]);
  
  const validateFieldDebounced = useCallback((fieldId: string, value: any) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsValidating(true);
    
    timeoutRef.current = setTimeout(() => {
      validateSingleField(fieldId, value);
      setIsValidating(false);
    }, debounceMs);
  }, [validateSingleField, debounceMs]);
  
  const validateAll = useCallback(() => {
    setIsValidating(true);
    const result = validateAction(schema, values);
    setErrors(result.fieldErrors);
    setIsValidating(false);
    return result;
  }, [schema, values]);
  
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  // Auto-validate on value changes if enabled
  useEffect(() => {
    if (validateOnChange) {
      // Don't validate on mount, only on subsequent changes
      // This is handled by the parent component
    }
  }, [values, validateOnChange]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    errors,
    validateField: validateFieldDebounced,
    validateAll,
    clearErrors,
    isValidating,
  };
}

// ============================================
// PRE-EXECUTION VALIDATOR
// ============================================

export interface PreExecutionValidationResult {
  canExecute: boolean;
  blockers: ValidationError[];
  warnings: ValidationError[];
  suggestions: string[];
}

/**
 * Perform comprehensive pre-execution validation
 */
export function preExecutionValidation(
  schema: ActionSchema,
  values: Record<string, any>,
  previousNodeOutputs?: Record<string, any>
): PreExecutionValidationResult {
  const result = validateAction(schema, values);
  const suggestions: string[] = [];
  
  // Check for unresolved expressions
  for (const field of schema.fields || []) {
    const value = values[field.id];
    if (typeof value === 'string' && value.includes('{{')) {
      // Check if the referenced node exists
      const matches = value.match(/\$node\.([^.]+)/g);
      if (matches) {
        for (const match of matches) {
          const nodeId = match.replace('$node.', '');
          if (previousNodeOutputs && !previousNodeOutputs[nodeId]) {
            result.warnings.push({
              fieldId: field.id,
              fieldName: field.name,
              type: 'warning',
              message: `Reference to node "${nodeId}" may not be available`,
            });
          }
        }
      }
    }
  }
  
  // Add execution-specific checks
  if (schema.requiresCredential && !values._credential) {
    result.errors.push({
      fieldId: '_credential',
      fieldName: 'Credentials',
      type: 'error',
      message: 'Credentials must be configured before execution',
    });
  }
  
  // Generate suggestions
  if (result.errors.length > 0) {
    suggestions.push('Fix all errors before executing the workflow');
  }
  
  if (result.warnings.length > 0) {
    suggestions.push('Review warnings - they may cause unexpected behavior');
  }
  
  return {
    canExecute: result.errors.length === 0,
    blockers: result.errors,
    warnings: result.warnings,
    suggestions,
  };
}

export default {
  validateField,
  validateAction,
  validateWorkflow,
  isFieldVisible,
  formatValidationErrors,
  getValidationSummary,
  preExecutionValidation,
  useFieldValidation,
};
