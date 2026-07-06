import store from "@/redux/store";
import { Provider } from "react-redux";
import ReactModal from "react-modal";
import "bootstrap/dist/css/bootstrap.min.css";
import "slick-carousel/slick/slick.css";
import "swiper/css/bundle";
import "react-modal-video/scss/modal-video.scss";
import '../styles/index.scss';
if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

if (typeof window !== "undefined") {
  ReactModal.setAppElement("body");
}

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <div id="root">
        <Component {...pageProps} />
      </div>
    </Provider>
  )
}
