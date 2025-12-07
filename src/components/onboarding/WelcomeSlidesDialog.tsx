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

  // Slide content
  const slides = [
    {
      headline: "Your recipes. All in one place.",
      description: "Import from URLs, photos, or type manually. Your collection, your way.",
      icon: <Book className="w-8 h-8 text-[#E07A5F]" />,
      mockup: (
        <div className="relative w-full">
          {/* Floating import method icons */}
          <div className="absolute -top-4 -left-2 p-2 bg-white/20 backdrop-blur-sm rounded-xl animate-pulse">
            <Link className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-2 -right-4 p-2 bg-white/20 backdrop-blur-sm rounded-xl animate-pulse" style={{ animationDelay: "0.5s" }}>
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -bottom-2 left-4 p-2 bg-white/20 backdrop-blur-sm rounded-xl animate-pulse" style={{ animationDelay: "1s" }}>
            <FileText className="w-5 h-5 text-white" />
          </div>
          
          {/* Recipe cards stack */}
          <div className="relative mx-auto w-48">
            <div className="absolute top-4 left-4 w-full h-32 bg-white/10 rounded-2xl transform rotate-3" />
            <div className="absolute top-2 left-2 w-full h-32 bg-white/20 rounded-2xl transform -rotate-2" />
            <div className="relative w-full h-32 bg-gradient-to-br from-[#48A97D]/80 to-[#48A97D]/60 rounded-2xl p-4 shadow-xl">
              <div className="w-full h-12 bg-white/30 rounded-lg mb-2" />
              <div className="w-3/4 h-3 bg-white/40 rounded" />
              <div className="w-1/2 h-3 bg-white/30 rounded mt-2" />
            </div>
          </div>
        </div>
      ),
    },
    {
      headline: "Plan meals in seconds.",
      description: "Drag and drop recipes to your weekly calendar. Share plans with your household.",
      icon: <CalendarDays className="w-8 h-8 text-[#E07A5F]" />,
      mockup: (
        <div className="relative w-full">
          {/* Floating icons */}
          <div className="absolute -top-2 right-0 p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <GripVertical className="w-5 h-5 text-white" />
          </div>
          <div className="absolute bottom-0 -left-2 p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <Users className="w-5 h-5 text-white" />
          </div>
          
          {/* Weekly calendar mockup */}
          <div className="mx-auto w-56 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="grid grid-cols-7 gap-1 mb-3">
              {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                <div key={i} className="text-center text-xs text-white/60">{day}</div>
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
                          ? "bg-[#48A97D]/70"
                          : "bg-white/10"
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
      icon: <ShoppingCart className="w-8 h-8 text-[#E07A5F]" />,
      mockup: (
        <div className="relative w-full">
          {/* Floating checkmark */}
          <div className="absolute -top-2 -right-2 p-2 bg-[#48A97D]/30 backdrop-blur-sm rounded-xl">
            <ListChecks className="w-5 h-5 text-[#48A97D]" />
          </div>
          
          {/* Shopping list mockup */}
          <div className="mx-auto w-52 bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3">
            <div className="text-xs text-white/60 font-medium">🥬 Produce</div>
            <div className="space-y-2">
              {["Tomatoes", "Onions", "Garlic"].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 ${i === 0 ? "bg-[#48A97D] border-[#48A97D]" : "border-white/40"}`} />
                  <span className={`text-sm ${i === 0 ? "text-white/50 line-through" : "text-white"}`}>{item}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-white/60 font-medium pt-2">🥛 Dairy</div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-white/40" />
              <span className="text-sm text-white">Milk</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      headline: "Your personal AI chef.",
      description: "Get recipe ideas, cooking tips, and ingredient substitutions from RealiChef.",
      icon: <Sparkles className="w-8 h-8 text-[#E07A5F]" />,
      mockup: (
        <div className="relative w-full">
          {/* Chat mockup */}
          <div className="mx-auto w-56 bg-white/10 backdrop-blur-sm rounded-2xl p-4 space-y-3">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-[#48A97D]/70 rounded-2xl rounded-br-md px-3 py-2 max-w-[80%]">
                <p className="text-xs text-white">What can I make with chicken?</p>
              </div>
            </div>
            
            {/* AI response */}
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#E07A5F]/30 flex items-center justify-center shrink-0">
                <UtensilsCrossed className="w-3 h-3 text-[#E07A5F]" />
              </div>
              <div className="bg-white/20 rounded-2xl rounded-bl-md px-3 py-2">
                <p className="text-xs text-white">Try my Easy Jerk Chicken or a classic Chicken Stir Fry! 🍗</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      headline: "Ready to cook something amazing?",
      description: "Let's start building your recipe collection together.",
      icon: <UtensilsCrossed className="w-8 h-8 text-[#E07A5F]" />,
      mockup: (
        <div className="relative w-full flex items-center justify-center">
          {/* Logo/hero visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-[#48A97D]/30 rounded-full blur-3xl scale-150" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-[#48A97D] to-[#48A97D]/70 rounded-full flex items-center justify-center shadow-2xl">
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
        className="max-w-md w-[95vw] h-[85vh] p-0 border-0 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] overflow-hidden [&>button]:hidden"
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white text-sm font-medium transition-colors"
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
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#16213e] to-transparent">
          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? "w-6 bg-[#E07A5F]" 
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={scrollNext}
            className="w-full bg-[#E07A5F] hover:bg-[#E07A5F]/90 text-white font-semibold py-6 rounded-xl text-base"
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
