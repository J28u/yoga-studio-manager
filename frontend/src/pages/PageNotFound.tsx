import { JSX } from "react";

const PageNotFound = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md text-center p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">404</h2>
        <p className="text-xl">Page Not Found</p>
      </div>
    </div>
  );
};

export default PageNotFound;
