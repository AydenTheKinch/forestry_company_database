import React from "react";
import { ClipLoader } from "react-spinners";

export const LoadingInfo: React.FC = () => (
  <div className="mb-8 max-w-2xl mx-auto flex flex-col items-center justify-center bg-blue-50 border border-blue-200 rounded-lg shadow p-8">
    <ClipLoader
      color="#002145"
      size={64}
      aria-label="Loading Spinner"
      data-testid="loader"
      className="mb-6"
    />
    <h3 className="font-bold text-lg text-blue-800 mb-2">Loading Results...</h3>
    <p className="font-medium text-blue-800">
      The server is processing your request.<br />
      <span className="text-blue-800">
        If the server hasn&apos;t been activated in a while, it may take up to two minutes to start up. The page will automatically update when the response is received!
      </span>
    </p>
  </div>
);