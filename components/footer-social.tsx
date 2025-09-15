export default function FooterSocial() {
  const items = [
    { href: '#', label: 'Информация', icon: 'bi-info-circle' },
    { href: 'https://instagram.com/', label: 'Instagram', icon: 'bi-instagram' },
    { href: '#', label: 'Threads', icon: 'bi-at' },
    { href: 'https://t.me/', label: 'Telegram', icon: 'bi-telegram' },
    { href: 'https://wa.me/', label: 'WhatsApp', icon: 'bi-whatsapp' },
    { href: 'mailto:info@example.com', label: 'Email', icon: 'bi-envelope' },
  ]

  return (
    <div className="fixed right-6 bottom-6 z-30">
      <div className="grid grid-cols-3 gap-3 bg-transparent p-1 rounded-2xl">
        {items.map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            aria-label={item.label}
            className="group w-12 h-12 rounded-xl border border-white/10 bg-[#16161c] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:bg-white/5 hover:border-white/20 transition"
          >
            <i className={`bi ${item.icon} text-xl opacity-80 group-hover:opacity-100`}></i>
            <span className="sr-only">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
