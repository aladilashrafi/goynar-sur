import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
// internal
import { Minus, Plus } from '@/svg';
import { decrement, increment } from '@/redux/features/cartSlice';

const ProductQuantity = ({ product }) => {
  const { orderQuantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  // handleIncrease
  const handleIncrease = () => {
    dispatch(increment(product));
  };
  // handleDecrease
  const handleDecrease = () => {
    dispatch(decrement());
  };
  return (
    <div className="tp-product-details-quantity">
    <div className="tp-product-quantity mb-15 mr-15">
      <button
        type="button"
        className="tp-cart-minus"
        onClick={handleDecrease}
        aria-label="Decrease quantity"
      >
        <Minus />
      </button>
      <input
        className="tp-cart-input"
        type="text"
        readOnly
        value={orderQuantity}
        aria-label="Product quantity"
      />
      <button
        type="button"
        className="tp-cart-plus"
        onClick={handleIncrease}
        aria-label="Increase quantity"
      >
        <Plus />
      </button>
    </div>
  </div>
  );
};

export default ProductQuantity;
