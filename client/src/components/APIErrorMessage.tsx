import React from "react";

export const APIErrorMessage: React.FC = () => (
  <div className="mb-8 max-w-2xl mx-auto flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-lg shadow p-8">
    <h3 className="font-bold text-lg text-red-800 mb-2">Error Loading Results</h3>
    <p className="font-medium text-red-800">
      There was a problem connecting to the server or processing your request.<br />
    </p>
  </div>
);