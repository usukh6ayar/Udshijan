import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/admin/auth";

/**
 * Cookie БАЙГАА эсэхийг л шалгана — гарын үсгийг шалгахгүй.
 * Энэ бол зөвхөн UX-ийн чиглүүлэлт, аюулгүй байдлын хил БИШ.
 * Жинхэнэ шалгалт Server Action бүрийн дотор явагдана.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/newterh") {
    if (!request.cookies.get(SESSION_COOKIE)) {
      return NextResponse.redirect(new URL("/admin/newterh", request.url));
    }
  }

  return NextResponse.next();
}

// `/admin/:path*` нь `/admin`-ыг өөрийг нь хамрахгүй тул хоёуланг нь бичив.
export const config = { matcher: ["/admin", "/admin/:path*"] };
