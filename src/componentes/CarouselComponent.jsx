import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";

export function CarouselComponent() {
  return (
    <Carousel>
      <Carousel.Item>
        <img
          className="d-block"
          style={{ width: "90%", margin: "0 auto" }}
          src="imagen1.jpg"
          alt="First slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block"
          style={{ width: "90%", margin: "0 auto" }}
          src="imagen2.jpg"
          alt="Second slide"
        />
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block"
          style={{ width: "90%", margin: "0 auto" }}
          src="imagen3.jpg"
          alt="Third slide"
        />
      </Carousel.Item>
    </Carousel>
  );
}
