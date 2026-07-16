"use client";
import React from "react";
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi hệ thống! / A system error occurred.</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Thử lại / Try again
      </button>
    </div>
  );
}
