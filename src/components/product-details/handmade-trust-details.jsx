import React from "react";

const HandmadeTrustDetails = ({ attributes = [] }) => {
  if (!attributes.length) return null;

  return (
    <div className="tp-product-details-trust" aria-label="Handmade product details">
      {attributes.map((attribute) => (
        <span className="tp-product-details-trust-badge" key={attribute.key}>
          <strong>{attribute.name}:</strong> {attribute.value}
        </span>
      ))}
    </div>
  );
};

export default HandmadeTrustDetails;
