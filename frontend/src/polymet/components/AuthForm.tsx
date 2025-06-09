import React, { ReactNode } from "react";
import { Link } from "react-router-dom";

type AuthFormProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  submitText: string;
  onSubmit: (e: React.FormEvent) => void;
  footer: ReactNode;
};

const AuthForm = ({
  title,
  subtitle,
  children,
  submitText,
  onSubmit,
  footer,
}: AuthFormProps) => {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
  backgroundImage: "url('/image.png')",
}}
      >
      {/* Overlay blur */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-lg rounded-lg shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-600 mt-1">{subtitle}</p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col space-y-6">
          {children}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            {submitText}
          </button>
        </form>

        <div className="text-center mt-6">{footer}</div>
      </div>
    </div>
  );
};

export default AuthForm;

