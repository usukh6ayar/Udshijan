import { allProducts } from "@/lib/data/products";
import { StyleguideContent } from "./StyleguideContent";

/** Үзүүлэнгийн жишээ барааг DB-ээс сервер тал татаж клиент давхарга руу өгнө */
export default async function StyleguidePage() {
  const samples = (await allProducts()).slice(0, 4);
  return <StyleguideContent samples={samples} />;
}
