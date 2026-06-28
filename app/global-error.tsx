"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-4">Đã xảy ra lỗi hệ thống!</h2>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
