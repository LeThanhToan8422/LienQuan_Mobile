import { App } from "antd";
import { useCallback } from "react";
import { UploadResult } from "../../../types";
import { MESSAGES } from "../../../constants";

/**
 * Custom hook for handling Cloudinary image uploads
 * Manages file upload process with loading states and error handling
 * @returns Object containing upload function
 */
export default function useCloudinaryUpload() {
  // Hook for displaying notifications
  const { message } = App.useApp();

  /**
   * Upload multiple files to Cloudinary
   * Creates FormData, sends POST request, and handles response
   * @param fileList - Array of files to upload
   * @returns Promise resolving to array of upload results
   */
  const uploadFiles = useCallback(
    async (fileList: File[]): Promise<UploadResult[]> => {
      // Return empty array if no files
      if (!fileList.length) return [];

      try {
        // Show loading message
        const loadingMessage = message.loading(
          "Đang tải ảnh lên Cloudinary...",
          0
        );

        // Create FormData for file upload
        const formData = new FormData();
        fileList.forEach((file) => formData.append("files", file));

        // Send POST request to Cloudinary upload API
        const response = await fetch("/api/upload/cloudinary", {
          method: "POST",
          body: formData,
        });

        // Check if upload was successful
        if (!response.ok) {
          throw new Error("Upload failed");
        }

        // Parse response and get upload results
        const result = await response.json();

        // Hide loading message and show success
        loadingMessage();
        message.success(`${MESSAGES.UPLOAD_SUCCESS} ${fileList.length} ảnh`);

        // Return upload results with proper typing
        return result.uploads as UploadResult[];
      } catch (error) {
        // Show error message and re-throw error
        message.error(MESSAGES.UPLOAD_ERROR);
        throw error;
      }
    },
    [message]
  );

  // Return upload function
  return { uploadFiles };
}
