import Link from "next/link";
import React, { useState } from "react";

// setting
function ProfileSetting({active,handleActive}) {
  return (
    <div className="tp-header-top-menu-item tp-header-setting">
      <span
        onClick={() => handleActive('setting')}
        className="tp-header-setting-toggle"
        id="tp-header-setting-toggle"
      >
        Shop
      </span>
      <ul className={active === 'setting' ? "tp-setting-list-open" : ""}>
        <li>
          <Link href="/wishlist">Wishlist</Link>
        </li>
        <li>
          <Link href="/cart">Cart</Link>
        </li>
        <li>
          <Link href="/checkout">Checkout</Link>
        </li>
      </ul>
    </div>
  );
}

const HeaderTopRight = () => {
  const [active, setIsActive] = useState('');
  // handle active
  const handleActive = (type) => {
    if(type === active){
      setIsActive('')
    }
    else {
      setIsActive(type)
    }
  }
  return (
    <div className="tp-header-top-menu d-flex align-items-center justify-content-end">
      <ProfileSetting active={active} handleActive={handleActive} />
    </div>
  );
};

export default HeaderTopRight;
