import Link from "next/link";
import { Clock, MapPin, Phone, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navConfig } from "@/config/navigation";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-nail-200 bg-white/70">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        {/* Cột 1: Thương hiệu */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-nail-500" />
            <span className="font-serif text-xl font-bold text-nail-950">
              {siteConfig.name}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>
        </div>

        {/* Cột 2: Liên kết */}
        <div className="space-y-3">
          <h3 className="font-serif text-base font-semibold text-nail-900">
            Khám phá
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {navConfig.mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:text-nail-500">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 3: Liên hệ */}
        <div className="space-y-3">
          <h3 className="font-serif text-base font-semibold text-nail-900">
            Cửa hàng {siteConfig.shortName}
          </h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-nail-400" />
              <span>{siteConfig.contact.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-nail-400" />
              <span>{siteConfig.contact.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-nail-400" />
              <span>{siteConfig.contact.openHours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-nail-100 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}