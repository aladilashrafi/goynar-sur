import Link from "next/link";
// internal
import SEO from "@/components/seo";
import Wrapper from "@/layout/wrapper";
import HeaderTwo from "@/layout/headers/header-2";
import Footer from "@/layout/footers/footer";

const SingleOrder = ({ params }) => {
  const orderId = params.id;

  return (
    <Wrapper>
      <SEO pageTitle="Order Confirmed" />
      <HeaderTwo style_2={true} />
      <section className="invoice__area pt-120 pb-120">
        <div className="container">
          <div className="invoice__wrapper grey-bg-2 pt-60 pb-60 pl-40 pr-40 text-center">
            <p className="text-black alert alert-success mb-30">
              Thank you. Your order has been received.
            </p>
            <h3 className="mb-15">Order #{orderId}</h3>
            <p className="mb-10">
              <strong>Payment Method:</strong> Cash on Delivery
            </p>
            <p className="mb-35">
              Our team will contact you soon to confirm delivery.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link href="/shop" className="tp-btn">
                Continue Shopping
              </Link>
              <Link href="/contact" className="tp-btn tp-btn-border">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer primary_style={true} />
    </Wrapper>
  );
};

export const getServerSideProps = async ({ params }) => {
  return {
    props: { params },
  };
};

export default SingleOrder;
