// components/BareLayout.jsx
import { Outlet } from "react-router-dom";

export const BareLayout = () => {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
};
