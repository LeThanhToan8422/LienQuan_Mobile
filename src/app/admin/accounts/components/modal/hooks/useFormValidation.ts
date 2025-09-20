"use client";

import { ModalValues } from "../../../types";

/**
 * Custom hook for form validation logic
 * Handles validation rules and error checking
 */
export default function useFormValidation() {
  /**
   * Validates the form data before submission
   * @param values - Form values to validate
   * @returns Object with validation result and errors
   */
  const validateForm = (values: ModalValues) => {
    const errors: string[] = [];

    // Basic validation
    if (!values.price || values.price <= 0) {
      errors.push("Giá phải lớn hơn 0");
    }
    if (!values.heroesCount || values.heroesCount <= 0) {
      errors.push("Số tướng phải lớn hơn 0");
    }
    if (!values.skinsCount || values.skinsCount <= 0) {
      errors.push("Số skin phải lớn hơn 0");
    }

    // New metadata validation
    if (!values.level || values.level <= 0) {
      errors.push("Cấp độ phải lớn hơn 0");
    }
    if (!values.matches || values.matches <= 0) {
      errors.push("Số trận phải lớn hơn 0");
    }
    if (values.winRate < 0 || values.winRate > 100) {
      errors.push("Tỷ lệ thắng phải từ 0 đến 100");
    }
    if (values.reputation < 0 || values.reputation > 100) {
      errors.push("Uy tín phải từ 0 đến 100");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  return {
    validateForm,
  };
}
