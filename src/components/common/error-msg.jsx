import React from "react";


const ErrorMsg = ({ id, msg }) => {
  if (!msg) return null;
  return <div id={id} className="form-field-error" role="alert">{msg}</div>;
};

export default ErrorMsg;
