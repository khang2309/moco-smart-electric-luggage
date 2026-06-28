import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">404 - Không tìm thấy trang</h2>
      <p className="text-gray-600 mb-8">Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
      <Link 
        href="/"
        className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
      >
        Trở về trang chủ
      </Link>
    </div>
  );
}
export const dynamic = 'force-dynamic';
