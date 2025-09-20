"use client";

import { useEffect, useState } from "react";
import { Form } from "antd";

type Account = {
  id: string;
  rank: string | null;
  price: number;
  heroesCount: number;
  skinsCount: number;
  images: unknown;
  description: string | null;
  status: string;
  createdAt: string;
  characterSkins?: unknown;
};

type ApiResponse = {
  items: Account[];
  total: number;
  page: number;
  pageSize: number;
};

export default function useAccounts() {
  const [form] = Form.useForm();
  const [data, setData] = useState<Account[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const values = form.getFieldsValue();
    const query = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      q: values.q || "",
      rank: values.rank || "",
      minPrice: values.minPrice != null ? String(values.minPrice) : "",
      maxPrice: values.maxPrice != null ? String(values.maxPrice) : "",
      minHeroes: values.minHeroes != null ? String(values.minHeroes) : "",
      minSkins: values.minSkins != null ? String(values.minSkins) : "",
    });
    const res = await fetch(`/api/accounts?${query.toString()}`);
    const json: ApiResponse = await res.json();
    setData(json.items);
    setTotal(json.total);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const onSearch = () => {
    setPage(1);
    fetchData();
  };

  return {
    form,
    data,
    total,
    page,
    pageSize,
    loading,
    setPage,
    setPageSize,
    onSearch,
  };
}
