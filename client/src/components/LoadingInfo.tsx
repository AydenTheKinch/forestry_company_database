import React from "react";

export const LoadingInfo: React.FC = () => (
  <div className="mb-6 max-w-4xl mx-auto text-center">
    <h3 className="font-bold mb-2">Loading Results...</h3>
    <p className="font-bold">
      The server is processing your request. If the server hasn't been activated in a while, it may take a couple of minutes to start up. Thank you for your patience!
    </p>
  </div>
);