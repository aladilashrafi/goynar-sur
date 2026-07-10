import Link from "next/link";
import React from "react";

const EmptyState = ({
  title,
  message,
  actionHref = "/shop",
  actionLabel = "Continue Shopping",
  secondaryHref = "/contact",
  secondaryLabel = "Contact Us",
}) => {
  return (
    <section className="tp-error-area pt-80 pb-80">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-7 col-lg-8">
            <div className="tp-error-content text-center">
              <h3 className="tp-error-title">{title}</h3>
              {message && <p>{message}</p>}
              <div className="tp-error-btn mt-30">
                {actionHref && (
                  <Link href={actionHref} className="tp-btn tp-btn-2 tp-btn-blue mr-10 mb-10">
                    {actionLabel}
                  </Link>
                )}
                {secondaryHref && (
                  <Link href={secondaryHref} className="tp-btn tp-btn-border mb-10">
                    {secondaryLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmptyState;
