import store from "@/redux/store";
import { Provider } from "react-redux";
import { useEffect } from "react";
import ReactModal from "react-modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "swiper/css";
import "swiper/css/navigation";
import "react-modal-video/css/modal-video.css";
import "../styles/index.css";

export default function App({ Component, pageProps }) {
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap");
    ReactModal.setAppElement("body");
  }, []);

  return (
    <Provider store={store}>
      <div id="root">
        <Component {...pageProps} />
      </div>
    </Provider>
  )
}
