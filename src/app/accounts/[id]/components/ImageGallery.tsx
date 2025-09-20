"use client";

import { Typography, Image as AntImage } from "antd";

type ImageGalleryProps = {
  images: string[];
  title?: string;
};

export default function ImageGallery({
  images,
  title = "Hình ảnh chi tiết",
}: ImageGalleryProps) {
  if (!images?.length) return null;
  return (
    <div className="mt-8">
      <Typography.Title level={5} className="!mb-4 text-gray-800 font-bold">
        {title}
      </Typography.Title>
      <AntImage.PreviewGroup>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.slice(0, 6).map((src, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl">
              <AntImage
                src={src}
                alt={`img-${idx}`}
                className="rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer"
                preview={true}
              />
            </div>
          ))}
        </div>
      </AntImage.PreviewGroup>
    </div>
  );
}
