import React from "react";
import { useRouter } from "next/router";

function SingleNav({ active = false, id, title, icon, onSelect }) {
  return (
    <button
      className={`nav-link ${active ? "active" : ""}`}
      id={`nav-${id}-tab`}
      data-bs-toggle="tab"
      data-bs-target={`#nav-${id}`}
      type="button"
      role="tab"
      aria-controls={id}
      aria-selected={active ? "true" : "false"}
      onClick={() => onSelect(id)}
    >
      <span>
        <i className={icon}></i>
      </span>
      {title}
    </button>
  );
}

const ProfileNavTab = () => {
  const router = useRouter();
  const handleSelect = (section) => {
    router.replace({ pathname: "/profile", query: { section } }, undefined, { shallow: true });
  };
  return (
    <nav>
      <div
        className="nav nav-tabs tp-tab-menu flex-column"
        id="profile-tab"
        role="tablist"
      >
        <SingleNav
          active={true}
          id="profile"
          title="Profile"
          icon="fa-regular fa-user-pen"
          onSelect={handleSelect}
        />
        <SingleNav
          id="information"
          title="Information"
          icon="fa-regular fa-circle-info"
          onSelect={handleSelect}
        />
        <SingleNav
          id="order"
          title="My Orders"
          icon="fa-light fa-clipboard-list-check"
          onSelect={handleSelect}
        />
        <SingleNav
          id="password"
          title="Change Password"
          icon="fa-regular fa-lock"
          onSelect={handleSelect}
        />
      </div>
    </nav>
  );
};

export default ProfileNavTab;
