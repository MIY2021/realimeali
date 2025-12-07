import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WelcomeSlide } from "./WelcomeSlide";
import { 
  Book, 
  CalendarDays, 
  ShoppingCart, 
  Sparkles, 
  UtensilsCrossed,
  Link,
  Camera,
  FileText,
  GripVertical,
  Users,
  ListChecks,
  ArrowRight
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface WelcomeSlidesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export const WelcomeSlidesDialog = ({ open, onOpenChange, onComplete }: WelcomeSlidesDialogProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const totalSlides = 5;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    } else {
      handleComplete();
    }
  }, [emblaApi]);

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  const handleSkip = () => {
    handleComplete();
  };

  // Slide content with light theme
  const slides = [
    {
      headline: "Your recipes. All in one place.",
      description: "Import from URLs, photos, or type manually. Your collection, your way.",
      icon: <Book className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full">
          {/* Floating import method icons */}
          <div className="absolute -top-4 -left-2 p-2.5 bg-[#48A97D]/10 border border-[#48A97D]/20 rounded-xl animate-pulse shadow-sm">
            <Link className="w-5 h-5 text-[#48A97D]" />
          </div>
          <div className="absolute -top-2 -right-4 p-2.5 bg-[#E07A5F]/10 border border-[#E07A5F]/20 rounded-xl animate-pulse shadow-sm" style={{ animationDelay: "0.5s" }}>
            <Camera className="w-5 h-5 text-[#E07A5F]" />
          </div>
          <div className="absolute -bottom-2 left-4 p-2.5 bg-[#FEEA97]/30 border border-[#F5B82E]/20 rounded-xl animate-pulse shadow-sm" style={{ animationDelay: "1s" }}>
            <FileText className="w-5 h-5 text-[#D4A500]" />
          </div>
          
          {/* Recipe cards stack */}
          <div className="relative mx-auto w-48">
            <div className="absolute top-4 left-4 w-full h-32 bg-[#E5E7EB] rounded-2xl transform rotate-3 shadow-md" />
            <div className="absolute top-2 left-2 w-full h-32 bg-[#F3F4F6] rounded-2xl transform -rotate-2 shadow-md" />
            <div className="relative w-full h-32 bg-gradient-to-br from-[#48A97D] to-[#3D9168] rounded-2xl p-4 shadow-xl">
              <div className="w-full h-12 bg-white/40 rounded-lg mb-2" />
              <div className="w-3/4 h-3 bg-white/50 rounded" />
              <div className="w-1/2 h-3 bg-white/40 rounded mt-2" />
            </div>
          </div>
        </div>
      ),
    },
    {
      headline: "Plan meals in seconds.",
      description: "Drag and drop recipes to your weekly calendar. Share plans with your household.",
      icon: <CalendarDays className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full">
          {/* Floating icons */}
          <div className="absolute -top-2 right-0 p-2.5 bg-[#48A97D]/10 border border-[#48A97D]/20 rounded-xl shadow-sm">
            <GripVertical className="w-5 h-5 text-[#48A97D]" />
          </div>
          <div className="absolute bottom-0 -left-2 p-2.5 bg-[#E07A5F]/10 border border-[#E07A5F]/20 rounded-xl shadow-sm">
            <Users className="w-5 h-5 text-[#E07A5F]" />
          </div>
          
          {/* Weekly calendar mockup */}
          <div className="mx-auto w-56 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-lg">
            <div className="grid grid-cols-7 gap-1 mb-3">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div key={i} className="text-center text-xs text-[#6B7280] font-medium">{day}</div>
              ))}
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                    <div 
                      key={col} 
                      className={`flex-1 h-6 rounded ${
                        (row === 0 && col === 2) || (row === 1 && col === 4) || (row === 2 && col === 1)
                          ? "bg-[#48A97D]"
                          : "bg-[#F3F4F6]"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      headline: "Shop smarter, not harder.",
      description: "Auto-generated shopping lists organized by category. Never forget an ingredient.",
      icon: <ShoppingCart className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full">
          {/* Floating checkmark */}
          <div className="absolute -top-2 -right-2 p-2.5 bg-[#48A97D]/10 border border-[#48A97D]/20 rounded-xl shadow-sm">
            <ListChecks className="w-5 h-5 text-[#48A97D]" />
          </div>
          
          {/* Shopping list mockup */}
          <div className="mx-auto w-52 bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="text-xs text-[#6B7280] font-semibold">🥬 Produce</div>
            <div className="space-y-2">
              {["Tomatoes", "Onions", "Garlic"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 ${i === 0 ? "bg-[#48A97D] border-[#48A97D]" : "border-[#D1D5DB]"}`} />
                  <span className={`text-sm ${i === 0 ? "text-[#9CA3AF] line-through" : "text-[#374151]"}`}>{item}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-[#6B7280] font-semibold pt-2">🥛 Dairy</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-[#D1D5DB]" />
              <span className="text-sm text-[#374151]">Milk</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      headline: "Your personal AI chef.",
      description: "Get recipe ideas, cooking tips, and ingredient substitutions from RealiChef.",
      icon: <Sparkles className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full">
          {/* Chat mockup */}
          <div className="mx-auto w-56 bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 shadow-lg">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-[#48A97D] rounded-2xl rounded-br-md px-3 py-2 max-w-[80%]">
                <p className="text-xs text-white">What can I make with chicken?</p>
              </div>
            </div>
            
            {/* AI response */}
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FEEA97] flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-3 h-3 text-[#D4A500]" />
              </div>
              <div className="bg-[#F3F4F6] rounded-2xl rounded-bl-md px-3 py-2">
                <p className="text-xs text-[#374151]">Try my Easy Jerk Chicken or a classic Chicken Stir Fry! 🍗</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      headline: "Ready to cook something amazing?",
      description: "Let's start building your recipe collection together.",
      icon: <UtensilsCrossed className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full flex items-center justify-center">
          {/* Logo/hero visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#FEEA97]/50 rounded-full blur-3xl scale-150" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-[#FEEA97] to-[#F5B82E] rounded-full flex items-center justify-center shadow-2xl border-4 border-white">
              <img 
                src="/lovable-uploads/48805e49-e8eb-4205-a741-e7fb6446e6d1.png" 
                alt="RealiMeali" 
                className="w-20 h-20 object-contain"
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md w-[95vw] h-[85vh] p-0 border border-[#E5E7EB] bg-[#FDF8F3] overflow-hidden [&>button]:hidden rounded-3xl"
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 text-[#6B7280] hover:text-[#374151] text-sm font-medium transition-colors"
        >
          Skip
        </button>

        {/* Carousel */}
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0">
                <WelcomeSlide
                  headline={slide.headline}
                  description={slide.description}
                  icon={slide.icon}
                  mockup={slide.mockup}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDF8F3] via-[#FDF8F3] to-transparent">
          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? "w-6 bg-[#48A97D]" 
                    : "bg-[#D1D5DB] hover:bg-[#9CA3AF]"
                }`}
              />
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={scrollNext}
            className="w-full bg-[#48A97D] hover:bg-[#3D9168] text-white font-semibold py-6 rounded-xl text-base shadow-lg"
          >
            {currentSlide === totalSlides - 1 ? (
              <>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
