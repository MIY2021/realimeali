import { ReactNode } from "react";

interface WelcomeSlideProps {
  headline: string;
  description: string;
  icon: ReactNode;
  mockup: ReactNode;
}

export const WelcomeSlide = ({ headline, description, icon, mockup }: WelcomeSlideProps) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 sm:px-8 pt-8 sm:pt-12 pb-24 sm:pb-28 h-full text-center">
      {/* Icon */}
      <div className="mb-1.5 sm:mb-3 p-3 sm:p-4 rounded-2xl bg-[#48A97D]/10 border border-[#48A97D]/20 shadow-sm">
        {icon}
      </div>
      
      {/* Text content - moved up */}
      <div className="space-y-1 sm:space-y-1.5 mb-0.5 sm:mb-1">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2C3E50] leading-tight">
          {headline}
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-[#6B7280] max-w-xs mx-auto">
          {description}
        </p>
      </div>
      
      {/* Mockup area */}
      <div className="flex-1 flex items-center justify-center w-full max-w-sm my-auto">
        {mockup}
      </div>
    </div>
  );
};
