"use client";

import { Toaster } from 'react-hot-toast';

export default function ToasterHost() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: { fontSize: 14 },
      }}
    />
  );
}
