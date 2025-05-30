import { Header } from "./Header";
import { CarouselComponent } from "./CarouselComponent";
import { Precios } from "./Precios";
import { Footer } from "./Footer";

export function Home() {
  return (
    <div>
      <Header />
      <div style={{ margin: "24px 0" }} />
      <CarouselComponent />
      <div style={{ margin: "24px 0" }} />
      <Precios />
      <div style={{ margin: "24px 0" }} />
      <Footer />
    </div>
  );
}
