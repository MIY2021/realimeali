import { ReactNode } from "react";

interface WelcomeSlideProps {
  headline: string;
  description: string;
  icon: ReactNode;
  mockup: ReactNode;
}

export const WelcomeSlide = ({ headline, description, icon, mockup }: WelcomeSlideProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-12 h-full text-center">
      {/* Icon */}
      <div className="mb-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
        {icon}
      </div>
      
      {/* Mockup area */}
      <div className="flex-1 flex items-center justify-center w-full max-w-sm mb-8">
        {mockup}
      </div>
      
      {/* Text content */}
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {headline}
        </h2>
        <p className="text-base sm:text-lg text-white/70 max-w-xs mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
};
