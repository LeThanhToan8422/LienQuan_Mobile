import { App, FormInstance } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../../constants";
import { ImageItem } from "../../../types";

/**
 * Custom hook for managing image state and operations
 * Handles image upload, display, reordering, and form synchronization
 * @returns Object containing image state and manipulation functions
 */
export default function useImageManagement() {
  // State to store the current list of images
  const [images, setImages] = useState<ImageItem[]>([]);

  // Ref to store the current form instance
  const formRef = useRef<FormInstance | null>(null);

  // Hooks for displaying notifications and confirmation modals
  const { message, modal } = App.useApp();

  // Effect to sync form when images change
  useEffect(() => {
    if (formRef.current && images.length >= 0) {
      const urls = images.map((item) => item.url);
      formRef.current.setFieldsValue({ imagesText: urls.join(", ") });
    }
  }, [images]);

  /**
   * Set the form instance for synchronization
   * @param form - Form instance to sync with
   */
  const setForm = useCallback((form: FormInstance) => {
    formRef.current = form;
  }, []);

  /**
   * Add a new image to the list
   * Creates preview URL and marks image as new (not yet uploaded)
   * @param file - Selected image file
   * @param form - Form instance to sync with
   */
  const addImage = useCallback(
    (file: File, form: FormInstance) => {
      try {
        // Create new image item with preview URL and new flag
        const newImageItem: ImageItem = {
          url: URL.createObjectURL(file), // Create blob URL for preview
          file, // Store original file for later upload
          isNew: true, // Mark as new image (not yet uploaded to Cloudinary)
        };

        // Set form instance for synchronization
        setForm(form);

        // Update state with new image
        setImages((prev) => [...prev, newImageItem]);

        // Show success message
        message.success(MESSAGES.ADD_IMAGE_SUCCESS);
      } catch {
        // Show error message if something goes wrong
        message.error(MESSAGES.ADD_IMAGE_ERROR);
      }
    },
    [message, setForm]
  );

  /**
   * Remove image from list with confirmation dialog
   * Shows modal confirmation before removing the image
   * @param url - URL of the image to remove
   * @param form - Form instance to sync with
   */
  const removeImage = useCallback(
    (url: string, form: FormInstance) => {
      // Show confirmation modal before removal
      modal.confirm({
        title: "Xác nhận xóa ảnh",
        content: "Bạn có chắc chắn muốn xóa ảnh này?",
        okText: "Xóa",
        cancelText: "Hủy",
        okType: "danger",
        onOk() {
          // Set form instance for synchronization
          setForm(form);

          // Filter out image with matching URL
          setImages((prev) => prev.filter((img) => img.url !== url));

          // Show success message
          message.success(MESSAGES.REMOVE_IMAGE_SUCCESS);
        },
      });
    },
    [message, modal, setForm]
  );

  /**
   * Move image up or down in the list
   * Swaps image positions using destructuring assignment
   * @param index - Current position of the image
   * @param direction - Direction to move (-1: up, 1: down)
   * @param form - Form instance to sync with
   */
  const moveImage = useCallback(
    (index: number, direction: -1 | 1, form: FormInstance) => {
      // Calculate target position
      const target = index + direction;

      // Validate target position is within bounds
      if (target < 0 || target >= images.length) return;

      // Set form instance for synchronization
      setForm(form);

      // Update state with new order
      setImages((prev) => {
        const newImages = [...prev];

        // Swap images at index and target positions
        // Using destructuring assignment for safe swapping
        [newImages[index], newImages[target]] = [
          newImages[target],
          newImages[index],
        ];

        return newImages;
      });

      // Show success message
      message.success(MESSAGES.MOVE_IMAGE_SUCCESS);
    },
    [images.length, message, setForm]
  );

  /**
   * Set image as cover (move to front of list)
   * Removes image from current position and places it at the beginning
   * @param url - URL of the image to set as cover
   * @param form - Form instance to sync with
   */
  const setCover = useCallback(
    (url: string, form: FormInstance) => {
      // Set form instance for synchronization
      setForm(form);

      setImages((prev) => {
        const currentImages = [...prev];

        // Find index of image to set as cover
        const targetIndex = currentImages.findIndex((img) => img.url === url);
        if (targetIndex === -1) return prev; // Image not found

        // Remove image from current position
        const [targetImage] = currentImages.splice(targetIndex, 1);

        // Place image at the beginning of the list
        return [targetImage, ...currentImages];
      });

      // Show success message
      message.success(MESSAGES.SET_COVER_SUCCESS);
    },
    [message, setForm]
  );

  /**
   * Load images from URLs (used when editing existing account)
   * Creates ImageItem objects from URL strings
   * @param urls - Array of image URLs
   * @param form - Form instance to sync with
   */
  const loadImages = useCallback((urls: string[], form: FormInstance) => {
    // Create ImageItem objects from URLs
    const imageItems: ImageItem[] = urls.map((url) => ({
      url,
      isNew: false, // Mark as existing image (already on Cloudinary)
    }));
    // Update state and sync form
    setImages(imageItems);

    // Sync form directly with new state
    form?.setFieldsValue({ imagesText: urls.join(", ") });
  }, []);

  /**
   * Clear all images from the list
   * Resets the image state to empty array
   */
  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  // Return object containing state and functions
  return {
    images, // Current list of images
    addImage, // Function to add new image
    removeImage, // Function to remove image
    moveImage, // Function to move image
    setCover, // Function to set cover image
    loadImages, // Function to load images from URLs
    clearImages, // Function to clear all images
    previewUrls: images.map((img) => img.url), // Array of URLs for preview display
    newFiles: images
      .filter((img) => img.isNew && img.file) // Filter new images with files
      .map((img) => img.file!), // Extract file objects for upload
  };
}
