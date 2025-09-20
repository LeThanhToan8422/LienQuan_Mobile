/**
 * Constants for admin accounts functionality
 * Contains validation rules, messages, and configuration values
 */

/**
 * Validation rules for account data
 * Defines minimum values for various account fields
 */
export const VALIDATION_RULES = {
  MIN_PRICE: 0, // Minimum price for account (in VND)
  MIN_HEROES_COUNT: 0, // Minimum number of heroes
  MIN_SKINS_COUNT: 0, // Minimum number of skins
} as const;

/**
 * User interface messages
 * Contains all success, error, and validation messages
 */
export const MESSAGES = {
  // Image upload messages
  UPLOAD_SUCCESS: "Tải lên thành công",
  UPLOAD_ERROR: "Tải ảnh lên thất bại",

  // Image management messages
  ADD_IMAGE_SUCCESS: "Đã thêm ảnh",
  ADD_IMAGE_ERROR: "Thêm ảnh thất bại",
  MOVE_IMAGE_SUCCESS: "Đã di chuyển ảnh",
  SET_COVER_SUCCESS: "Đã đặt làm ảnh bìa",
  REMOVE_IMAGE_SUCCESS: "Đã xóa ảnh",

  // Account operation messages
  SUBMIT_SUCCESS_CREATE: "Tạo tài khoản mới thành công",
  SUBMIT_SUCCESS_UPDATE: "Cập nhật tài khoản thành công",
  SUBMIT_ERROR_CREATE: "Tạo tài khoản mới thất bại",
  SUBMIT_ERROR_UPDATE: "Cập nhật tài khoản thất bại",

  // Validation error messages
  VALIDATION_PRICE: "Giá phải lớn hơn 0",
  VALIDATION_HEROES: "Số tướng không hợp lệ",
  VALIDATION_SKINS: "Số skin không hợp lệ",
} as const;
