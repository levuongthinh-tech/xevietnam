import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🚘</span>
            <span className="font-bold text-white">XeVietnam</span>
          </div>
          <p className="leading-relaxed">Nền tảng dữ liệu xe ô tô và xe máy Việt Nam.</p>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Ô tô</h4>
          <ul className="space-y-2">
            <li><Link href="/xe-oto" className="hover:text-white transition">Tất cả ô tô</Link></li>
            <li><Link href="/xe-oto?segment=Sedan" className="hover:text-white transition">Sedan</Link></li>
            <li><Link href="/xe-oto?segment=SUV" className="hover:text-white transition">SUV</Link></li>
            <li><Link href="/xe-oto?segment=MPV" className="hover:text-white transition">MPV</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Xe máy</h4>
          <ul className="space-y-2">
            <li><Link href="/xe-may" className="hover:text-white transition">Tất cả xe máy</Link></li>
            <li><Link href="/xe-may?brand=honda" className="hover:text-white transition">Xe ga</Link></li>
            <li><Link href="/xe-may?brand=yamaha" className="hover:text-white transition">Sportbike</Link></li>
            <li><Link href="/xe-may?brand=vinfast" className="hover:text-white transition">Xe điện</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-3">Tiện ích</h4>
          <ul className="space-y-2">
            <li><Link href="/so-sanh" className="hover:text-white transition">So sánh xe</Link></li>
            <li><Link href="/tu-van" className="hover:text-white transition">Tư vấn AI</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} XeVietnam.vn · Dữ liệu tổng hợp, cập nhật thủ công
      </div>
    </footer>
  )
}
