"use client";

import { useEffect, useState } from "react";
import { Form, App } from "antd";
import { AdminAccount } from "../types";

/**
 * Custom hook for managing admin accounts page functionality
 * Handles data fetching, pagination, search, modal operations, and CRUD operations
 * @returns Object containing state, handlers, and form instance
 */
export default function useAdminAccounts() {
  // Form instance for search and filter functionality
  const [form] = Form.useForm();

  // Data state
  const [data, setData] = useState<AdminAccount[]>([]); // List of accounts
  const [total, setTotal] = useState(0); // Total number of accounts
  const [page, setPage] = useState(1); // Current page number
  const [pageSize, setPageSize] = useState(10); // Number of items per page
  const [loading, setLoading] = useState(false); // Loading state for data fetching

  // Modal state
  const [modalOpen, setModalOpen] = useState(false); // Whether modal is open
  const [editing, setEditing] = useState<AdminAccount | null>(null); // Account being edited

  // Thêm state cho modal mode
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">(
    "create"
  );

  // Hooks for displaying notifications and confirmation modals
  const { message, modal } = App.useApp();

  /**
   * Fetch accounts data from API
   * Builds query parameters from form values and fetches paginated data
   */
  const fetchData = async () => {
    setLoading(true);

    // Get form values for search and filter
    const values = form.getFieldsValue();

    // Build query parameters
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      q: values.q || "", // Search query
      rank: values.rank || "", // Rank filter
      minPrice: values.minPrice != null ? String(values.minPrice) : "", // Minimum price
      maxPrice: values.maxPrice != null ? String(values.maxPrice) : "", // Maximum price
    });

    try {
      // Fetch data from API
      const res = await fetch(`/api/accounts?${query.toString()}`);
      const json = await res.json();

      // Update state with fetched data
      setData(json.items);
      setTotal(json.total);
    } catch (error) {
      console.error("Fetch data error:", error);
      message.error("Lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect to fetch data when page or pageSize changes
   * Automatically refetches data when pagination changes
   */
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  /**
   * Handle search form submission
   * Resets to first page and fetches data with new search criteria
   */
  const onSearch = () => {
    setPage(1); // Reset to first page
    fetchData(); // Fetch data with new search criteria
  };

  /**
   * Open modal for creating new account
   * Resets editing state and opens modal
   */
  const openCreate = () => {
    setEditing(null); // No account being edited
    setModalMode("create"); // Set modal mode to create
    setModalOpen(true); // Open modal
  };

  /**
   * Open modal for editing existing account
   * Sets editing state and opens modal
   * @param record - Account to edit
   */
  const openEdit = (record: AdminAccount) => {
    setEditing(record); // Set account being edited
    setModalMode("edit"); // Set modal mode to edit
    setModalOpen(true); // Open modal
  };

  /**
   * Open modal for viewing existing account
   * Sets editing state and opens modal
   * @param record - Account to view
   */
  const openView = (record: AdminAccount) => {
    setEditing(record); // Set account being edited
    setModalMode("view"); // Set modal mode to view
    setModalOpen(true); // Open modal
  };

  /**
   * Close modal and reset editing state
   * Clears editing state and closes modal
   */
  const closeModal = () => {
    setModalOpen(false); // Close modal
    setEditing(null); // Clear editing state
  };

  /**
   * Handle account deletion with confirmation
   * Shows confirmation modal before deleting account
   * @param record - Account to delete
   */
  const handleDelete = async (record: AdminAccount) => {
    modal.confirm({
      title: "Xác nhận xóa tài khoản",
      content: `Bạn có chắc chắn muốn xóa tài khoản ${
        record.rank || "N/A"
      } - ${new Intl.NumberFormat("vi-VN").format(record.price)} ₫?`,
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          // Show loading message
          const loadingMessage = message.loading("Đang xóa tài khoản...", 0);

          // Send DELETE request to API
          const res = await fetch(`/api/accounts/${record.id}`, {
            method: "DELETE",
          });

          // Check if deletion was successful
          if (!res.ok) {
            throw new Error(`API Error: ${res.status}`);
          }

          // Hide loading message and show success
          loadingMessage();
          message.success("Xóa tài khoản thành công");

          // Refresh data list
          onSearch();
        } catch (error) {
          // Show error message
          message.error("Xóa tài khoản thất bại");
          console.error("Delete error:", error);
        }
      },
    });
  };

  /**
   * Handle modal success callback
   * Closes modal and refreshes data after successful operation
   */
  const onModalSuccess = () => {
    closeModal(); // Close modal
    onSearch(); // Refresh data
  };

  // Return object containing state, handlers, and form instance
  return {
    // Form and data
    form, // Form instance for search
    data, // List of accounts
    total, // Total number of accounts
    page, // Current page number
    pageSize, // Items per page
    loading, // Loading state

    // Pagination handlers
    setPage, // Set current page
    setPageSize, // Set items per page

    // Search and filter
    onSearch, // Handle search form submission

    // Modal state and handlers
    modalOpen, // Whether modal is open
    openCreate, // Open create modal
    openEdit, // Open edit modal
    openView, // Open view modal
    closeModal, // Close modal
    editing, // Account being edited
    modalMode, // Modal mode

    // CRUD operations
    handleDelete, // Handle account deletion
    onModalSuccess, // Handle modal success
  };
}
