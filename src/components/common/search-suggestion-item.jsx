import Image from "next/image";
import { formatPrice } from "@/utils/formatPrice";

const SearchSuggestionItem = ({ product, onSelect }) => (
  <button
    type="button"
    className="tp-search-suggestion-item"
    onClick={() => onSelect(product)}
    aria-label={`${product.title}, ${formatPrice(product.price)}`}
  >
    <Image
      src={product.img}
      alt=""
      width={52}
      height={52}
      sizes="52px"
      className="tp-search-suggestion-item-thumb"
    />
    <span className="tp-search-suggestion-item-content">
      <strong>{product.title}</strong>
      <small>{product.parent}</small>
    </span>
    <span className="tp-search-suggestion-item-price">
      {formatPrice(product.price)}
      {product.discount > 0 && product.regularPrice > product.price && (
        <del>{formatPrice(product.regularPrice)}</del>
      )}
    </span>
  </button>
);

export default SearchSuggestionItem;
