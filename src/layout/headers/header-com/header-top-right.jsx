import Link from "next/link";
import React, { useState } from "react";

// language
function Language({active,handleActive}) {
  return (
    <div className="tp-header-top-menu-item tp-header-lang">
      <span
        onClick={() => handleActive('lang')}
        className="tp-header-lang-toggle"
        id="tp-header-lang-toggle"
      >
        English
      </span>
      <ul className={active === 'lang' ? "tp-lang-list-open" : ""}>
        <li>
          <a href="#">Bangla</a>
        </li>
      </ul>
    </div>
  );
}

// currency
function Currency({active,handleActive}) {
  return (
    <div className="tp-header-top-menu-item tp-header-currency">
      <span
        onClick={() => handleActive('currency')}
        className="tp-header-currency-toggle"
        id="tp-header-currency-toggle"
      >
        BDT
      </span>
      <ul className={active === 'currency' ? "tp-currency-list-open" : ""}>
        <li>
          <a href="#">৳ BDT</a>
        </li>
      </ul>
    </div>
  );
}

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
      <Language active={active} handleActive={handleActive} />
      <Currency active={active} handleActive={handleActive} />
      <ProfileSetting active={active} handleActive={handleActive} />
    </div>
  );
};

export default HeaderTopRight;
