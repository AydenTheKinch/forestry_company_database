import React from "react";

export const LoadingInfo: React.FC = () => (
  <div className="mb-6 max-w-4xl mx-auto text-center text-red-600">
    <p className="font-bold">
      The server is processing your request. Due to the nature of this demo, the server may take up to two minutes to start up if it was inactive for a long period of time. The page will automatically update when the response is received!
    </p>
  </div>
);