import Image from "next/image";
import Link from "next/link";

const PhaseOneDisabled = ({ title, message, primaryLabel = "Continue Shopping", primaryHref = "/shop" }) => {
  return (
    <section className="tp-login-area pb-120 p-relative z-index-1 fix">
      <div className="tp-login-shape">
        <Image className="tp-login-shape-1" src="/assets/img/login/login-shape-1.png" alt="" width={60} height={60} />
        <Image className="tp-login-shape-2" src="/assets/img/login/login-shape-2.png" alt="" width={60} height={60} />
        <Image className="tp-login-shape-3" src="/assets/img/login/login-shape-3.png" alt="" width={60} height={60} />
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="tp-login-wrapper text-center">
              <h3 className="tp-login-title">{title}</h3>
              <p className="mb-35">{message}</p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link href={primaryHref} className="tp-login-btn">
                  {primaryLabel}
                </Link>
                <Link href="/contact" className="tp-btn tp-btn-border">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PhaseOneDisabled;
