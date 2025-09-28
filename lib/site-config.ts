// Central place to configure public social links used across the app
// TODO: replace placeholders with your real links
export const social = {
  telegram: "https://t.me/s7robotics",         // e.g. https://t.me/<username>
  whatsapp: "https://wa.me/77000000000",      // e.g. https://wa.me/<phone_without_plus>
  phone: "+7 700 000 00 00",                  // human-readable phone, used for tel:
  email: "info@s7robotics.kz",                 // email address
  instagram: "https://instagram.com/s7robotics", // optional
  vk: "https://vk.com/s7robotics",             // optional
}

export function linkFor(type: keyof typeof social): string {
  switch (type) {
    case "telegram":
      return social.telegram
    case "whatsapp":
      return social.whatsapp
    case "email":
      return `mailto:${social.email}`
    case "phone":
      // strip spaces for tel link
      return `tel:${social.phone.replace(/\s+/g, '')}`
    case "instagram":
      return social.instagram
    case "vk":
      return social.vk
    default:
      return "#"
  }
}
