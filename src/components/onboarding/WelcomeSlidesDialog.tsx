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
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Check
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
  const [canScrollPrev, setCanScrollPrev] = useState(false);

  const totalSlides = 7;

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
    setCanScrollNext(emblaApi.canScrollNext());
    setCanScrollPrev(emblaApi.canScrollPrev());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleComplete = useCallback(() => {
    onComplete();
    onOpenChange(false);
  }, [onComplete, onOpenChange]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollNext()) {
      emblaApi.scrollNext();
    } else {
      handleComplete();
    }
  }, [emblaApi, handleComplete]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const handleSkip = () => {
    handleComplete();
  };

  const handleDotClick = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  }, [emblaApi]);

  // Slide content with light theme
  const slides = [
    {
      headline: "Your recipes. All in one place.",
      description: "Import from URLs, photos, or type manually. Your collection, your way.",
      icon: <Book className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full h-48 sm:h-64 flex items-center justify-center">
          {/* Central Recipe Book/Collection */}
          <div className="relative z-20">
            <div className="w-32 h-40 bg-gradient-to-br from-[#48A97D] to-[#3D9168] rounded-2xl shadow-2xl p-4 flex flex-col items-center justify-center border-4 border-white">
              <Book className="w-12 h-12 text-white mb-2" />
              <div className="w-full h-1 bg-white/40 rounded mb-1" />
              <div className="w-3/4 h-1 bg-white/30 rounded mb-1" />
              <div className="w-full h-1 bg-white/40 rounded mb-1" />
              <div className="w-2/3 h-1 bg-white/30 rounded" />
            </div>
            {/* Stacked pages effect */}
            <div className="absolute -bottom-1 left-1 right-1 h-2 bg-white/20 rounded-b-2xl" />
            <div className="absolute -bottom-2 left-2 right-2 h-2 bg-white/10 rounded-b-2xl" />
          </div>

          {/* Recipe cards floating around with arrows pointing to book */}
          
          {/* Top Left Recipe Card */}
          <div className="absolute -top-2 -left-8 z-10 animate-pulse" style={{ animationDelay: "0s" }}>
            <div className="w-20 h-24 bg-white rounded-xl shadow-lg p-2 border-2 border-[#E5E7EB] transform rotate-6">
              <div className="w-full h-12 bg-gradient-to-br from-[#E07A5F] to-[#D65A3F] rounded-lg mb-1" />
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded mb-0.5" />
              <div className="w-2/3 h-1.5 bg-[#E5E7EB] rounded" />
            </div>
            {/* Arrow pointing to book */}
            <div className="absolute top-1/2 -right-6">
              <ArrowRight className="w-5 h-5 text-[#48A97D] animate-pulse" />
            </div>
          </div>

          {/* Top Right Recipe Card */}
          <div className="absolute -top-4 -right-6 z-10 animate-pulse" style={{ animationDelay: "0.3s" }}>
            <div className="w-20 h-24 bg-white rounded-xl shadow-lg p-2 border-2 border-[#E5E7EB] transform -rotate-6">
              <div className="w-full h-12 bg-gradient-to-br from-[#FEEA97] to-[#F5B82E] rounded-lg mb-1" />
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded mb-0.5" />
              <div className="w-3/4 h-1.5 bg-[#E5E7EB] rounded" />
            </div>
            {/* Arrow pointing to book */}
            <div className="absolute top-1/2 -left-6">
              <ArrowRight className="w-5 h-5 text-[#48A97D] rotate-180 animate-pulse" />
            </div>
          </div>

          {/* Bottom Left Recipe Card */}
          <div className="absolute -bottom-2 -left-6 z-10 animate-pulse" style={{ animationDelay: "0.6s" }}>
            <div className="w-20 h-24 bg-white rounded-xl shadow-lg p-2 border-2 border-[#E5E7EB] transform rotate-3">
              <div className="w-full h-12 bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] rounded-lg mb-1" />
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded mb-0.5" />
              <div className="w-2/3 h-1.5 bg-[#E5E7EB] rounded" />
            </div>
            {/* Arrow pointing to book */}
            <div className="absolute top-1/2 -right-6">
              <ArrowRight className="w-5 h-5 text-[#48A97D] animate-pulse" />
            </div>
          </div>

          {/* Bottom Right Recipe Card */}
          <div className="absolute -bottom-4 -right-8 z-10 animate-pulse" style={{ animationDelay: "0.9s" }}>
            <div className="w-20 h-24 bg-white rounded-xl shadow-lg p-2 border-2 border-[#E5E7EB] transform -rotate-3">
              <div className="w-full h-12 bg-gradient-to-br from-[#3498DB] to-[#2980B9] rounded-lg mb-1" />
              <div className="w-full h-1.5 bg-[#E5E7EB] rounded mb-0.5" />
              <div className="w-3/4 h-1.5 bg-[#E5E7EB] rounded" />
            </div>
            {/* Arrow pointing to book */}
            <div className="absolute top-1/2 -left-6">
              <ArrowRight className="w-5 h-5 text-[#48A97D] rotate-180 animate-pulse" />
            </div>
          </div>

          {/* Import method icons floating */}
          <div className="absolute top-8 left-1/4 p-2 bg-[#48A97D]/10 border border-[#48A97D]/20 rounded-lg shadow-sm animate-pulse" style={{ animationDelay: "1.2s" }}>
            <Link className="w-4 h-4 text-[#48A97D]" />
          </div>
          <div className="absolute top-12 right-1/4 p-2 bg-[#E07A5F]/10 border border-[#E07A5F]/20 rounded-lg shadow-sm animate-pulse" style={{ animationDelay: "1.5s" }}>
            <Camera className="w-4 h-4 text-[#E07A5F]" />
          </div>
          <div className="absolute bottom-12 left-1/3 p-2 bg-[#FEEA97]/30 border border-[#F5B82E]/20 rounded-lg shadow-sm animate-pulse" style={{ animationDelay: "1.8s" }}>
            <FileText className="w-4 h-4 text-[#D4A500]" />
          </div>
        </div>
      ),
    },
    {
      headline: "Discover ready-made recipes.",
      description: "Browse curated recipes and import them into your collection with one tap.",
      icon: <Search className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full h-48 sm:h-64 flex items-center justify-center">
          {/* Search/Discovery interface mockup */}
          <div className="mx-auto w-56 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-lg">
            {/* Search bar */}
            <div className="flex items-center gap-2 mb-4 p-2 bg-[#F3F4F6] rounded-lg">
              <Search className="w-4 h-4 text-[#48A97D] animate-pulse" style={{ animationDelay: "0s" }} />
              <div className="flex-1 h-2 bg-[#E5E7EB] rounded" />
            </div>
            
            {/* Recipe feed/list */}
            <div className="space-y-2">
              {/* Recipe 1 */}
              <div className="flex items-center gap-2 p-2 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E07A5F] to-[#D65A3F] rounded-lg flex-shrink-0 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="flex-1 min-w-0">
                  <div className="w-full h-2 bg-[#E5E7EB] rounded mb-1" />
                  <div className="w-2/3 h-1.5 bg-[#E5E7EB] rounded" />
                </div>
                <div className="w-6 h-6 bg-[#48A97D] rounded-full flex items-center justify-center flex-shrink-0 animate-pulse" style={{ animationDelay: "0.4s" }}>
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* Recipe 2 */}
              <div className="flex items-center gap-2 p-2 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FEEA97] to-[#F5B82E] rounded-lg flex-shrink-0 animate-pulse" style={{ animationDelay: "0.6s" }} />
                <div className="flex-1 min-w-0">
                  <div className="w-full h-2 bg-[#E5E7EB] rounded mb-1" />
                  <div className="w-3/4 h-1.5 bg-[#E5E7EB] rounded" />
                </div>
                <div className="w-6 h-6 bg-[#48A97D] rounded-full flex items-center justify-center flex-shrink-0 animate-pulse" style={{ animationDelay: "0.8s" }}>
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* Recipe 3 */}
              <div className="flex items-center gap-2 p-2 bg-[#F9FAFB] rounded-lg hover:bg-[#F3F4F6] transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] rounded-lg flex-shrink-0 animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="flex-1 min-w-0">
                  <div className="w-full h-2 bg-[#E5E7EB] rounded mb-1" />
                  <div className="w-2/3 h-1.5 bg-[#E5E7EB] rounded" />
                </div>
                <div className="w-6 h-6 bg-[#48A97D] rounded-full flex items-center justify-center flex-shrink-0 animate-pulse" style={{ animationDelay: "1.2s" }}>
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating search icon */}
          <div className="absolute -top-2 -right-4 p-2.5 bg-[#48A97D]/10 border border-[#48A97D]/20 rounded-xl shadow-sm animate-pulse" style={{ animationDelay: "1.4s" }}>
            <Search className="w-5 h-5 text-[#48A97D]" />
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
          <div className="absolute -top-2 right-0 p-2.5 bg-[#48A97D]/10 border border-[#48A97D]/20 rounded-xl shadow-sm animate-pulse" style={{ animationDelay: "0s" }}>
            <GripVertical className="w-5 h-5 text-[#48A97D]" />
          </div>
          <div className="absolute bottom-0 -left-2 p-2.5 bg-[#E07A5F]/10 border border-[#E07A5F]/20 rounded-xl shadow-sm animate-pulse" style={{ animationDelay: "0.5s" }}>
            <Users className="w-5 h-5 text-[#E07A5F]" />
          </div>
          
          {/* Weekly calendar mockup */}
          <div className="mx-auto w-56 bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-lg animate-pulse" style={{ animationDelay: "1s" }}>
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
      description: "Auto-generated shopping lists. Never forget an ingredient.",
      icon: <ShoppingCart className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full">
          {/* Floating checkmark */}
          <div className="absolute -top-2 -right-2 p-2.5 bg-[#48A97D]/10 border border-[#48A97D]/20 rounded-xl shadow-sm animate-pulse" style={{ animationDelay: "0s" }}>
            <ListChecks className="w-5 h-5 text-[#48A97D]" />
          </div>
          
          {/* Shopping list mockup */}
          <div className="mx-auto w-52 bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-2 shadow-lg animate-pulse" style={{ animationDelay: "0.5s" }}>
            {["Tomatoes", "Onions", "Garlic", "Milk", "Chicken", "Rice"].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded border-2 ${i === 0 ? "bg-[#48A97D] border-[#48A97D]" : "border-[#D1D5DB]"}`} />
                <span className={`text-sm ${i === 0 ? "text-[#9CA3AF] line-through" : "text-[#374151]"}`}>{item}</span>
              </div>
            ))}
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
          <div className="mx-auto w-56 bg-white border border-[#E5E7EB] rounded-2xl p-4 space-y-3 shadow-lg animate-pulse" style={{ animationDelay: "0s" }}>
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-[#48A97D] rounded-2xl rounded-br-md px-3 py-2 max-w-[80%]">
                <p className="text-xs text-white">What can I make with chicken?</p>
              </div>
            </div>
            
            {/* AI response */}
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#FEEA97] flex items-center justify-center shrink-0 animate-pulse" style={{ animationDelay: "0.5s" }}>
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
      headline: "Everything you need to cook with confidence.",
      description: "All your culinary tools in one place.",
      icon: <ListChecks className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full h-48 sm:h-64 flex items-center justify-center">
          {/* Summary checklist card */}
          <div className="mx-auto w-64 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-lg">
            <div className="space-y-3">
              {/* Feature 1: Save recipes */}
              <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: "0s" }}>
                <div className="w-8 h-8 bg-[#48A97D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Book className="w-4 h-4 text-[#48A97D]" />
                </div>
                <span className="text-sm text-[#374151] font-medium flex-1">Save & organize recipes</span>
                <div className="w-5 h-5 bg-[#48A97D] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* Feature 2: Plan meals */}
              <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: "0.2s" }}>
                <div className="w-8 h-8 bg-[#48A97D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CalendarDays className="w-4 h-4 text-[#48A97D]" />
                </div>
                <span className="text-sm text-[#374151] font-medium flex-1">Plan weekly meals</span>
                <div className="w-5 h-5 bg-[#48A97D] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* Feature 3: Shopping list */}
              <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: "0.4s" }}>
                <div className="w-8 h-8 bg-[#48A97D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingCart className="w-4 h-4 text-[#48A97D]" />
                </div>
                <span className="text-sm text-[#374151] font-medium flex-1">Auto-generate shopping lists</span>
                <div className="w-5 h-5 bg-[#48A97D] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
              
              {/* Feature 4: Discover recipes */}
              <div className="flex items-center gap-3 animate-pulse" style={{ animationDelay: "0.6s" }}>
                <div className="w-8 h-8 bg-[#48A97D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Search className="w-4 h-4 text-[#48A97D]" />
                </div>
                <span className="text-sm text-[#374151] font-medium flex-1">Discover new recipes</span>
                <div className="w-5 h-5 bg-[#48A97D] rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Decorative sparkles */}
          <div className="absolute -top-1 -left-2">
            <Sparkles className="w-4 h-4 text-[#FEEA97] animate-pulse" style={{ animationDelay: "0.8s" }} />
          </div>
          <div className="absolute -bottom-1 -right-2">
            <Sparkles className="w-4 h-4 text-[#48A97D] animate-pulse" style={{ animationDelay: "1s" }} />
          </div>
        </div>
      ),
    },
    {
      headline: "Ready to cook something amazing?",
      description: "Let's start building your recipe collection together.",
      icon: <UtensilsCrossed className="w-8 h-8 text-[#48A97D]" />,
      mockup: (
        <div className="relative w-full h-48 sm:h-64 flex items-center justify-center">
          {/* Central collection book with sparkles */}
          <div className="relative z-20">
            <div className="w-32 h-40 bg-gradient-to-br from-[#48A97D] to-[#3D9168] rounded-2xl shadow-2xl p-4 flex flex-col items-center justify-center border-4 border-white">
              <Book className="w-12 h-12 text-white mb-2" />
              <div className="w-full h-1 bg-white/40 rounded mb-1" />
              <div className="w-3/4 h-1 bg-white/30 rounded mb-1" />
              <div className="w-full h-1 bg-white/40 rounded mb-1" />
              <div className="w-2/3 h-1 bg-white/30 rounded" />
            </div>
            {/* Stacked pages effect */}
            <div className="absolute -bottom-1 left-1 right-1 h-2 bg-white/20 rounded-b-2xl" />
            <div className="absolute -bottom-2 left-2 right-2 h-2 bg-white/10 rounded-b-2xl" />
            
            {/* Sparkles around book */}
            <div className="absolute -top-2 -left-2">
              <Sparkles className="w-5 h-5 text-[#FEEA97] animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-2">
              <Sparkles className="w-4 h-4 text-[#48A97D] animate-pulse" style={{ animationDelay: "0.3s" }} />
            </div>
            <div className="absolute -bottom-1 -left-3">
              <Sparkles className="w-4 h-4 text-[#E07A5F] animate-pulse" style={{ animationDelay: "0.6s" }} />
            </div>
            <div className="absolute -bottom-1 -right-3">
              <Sparkles className="w-5 h-5 text-[#FEEA97] animate-pulse" style={{ animationDelay: "0.9s" }} />
            </div>
          </div>

          {/* Recipe cards floating around - showing collection growing */}
          {/* Top Left Recipe Card */}
          <div className="absolute top-0 left-4 z-10 animate-pulse" style={{ animationDelay: "0s" }}>
            <div className="w-16 h-20 bg-white rounded-xl shadow-lg p-1.5 border-2 border-[#E5E7EB] transform rotate-6">
              <div className="w-full h-10 bg-gradient-to-br from-[#E07A5F] to-[#D65A3F] rounded-lg mb-1" />
              <div className="w-full h-1 bg-[#E5E7EB] rounded mb-0.5" />
              <div className="w-2/3 h-1 bg-[#E5E7EB] rounded" />
            </div>
            {/* Checkmark showing it's saved */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#48A97D] rounded-full flex items-center justify-center shadow-md">
              <ListChecks className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Top Right Recipe Card */}
          <div className="absolute top-2 -right-4 z-10 animate-pulse" style={{ animationDelay: "0.3s" }}>
            <div className="w-16 h-20 bg-white rounded-xl shadow-lg p-1.5 border-2 border-[#E5E7EB] transform -rotate-6">
              <div className="w-full h-10 bg-gradient-to-br from-[#FEEA97] to-[#F5B82E] rounded-lg mb-1" />
              <div className="w-full h-1 bg-[#E5E7EB] rounded mb-0.5" />
              <div className="w-3/4 h-1 bg-[#E5E7EB] rounded" />
            </div>
            {/* Checkmark */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#48A97D] rounded-full flex items-center justify-center shadow-md">
              <ListChecks className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Bottom Left Recipe Card */}
          <div className="absolute -bottom-4 left-2 z-10 animate-pulse" style={{ animationDelay: "0.6s" }}>
            <div className="w-16 h-20 bg-white rounded-xl shadow-lg p-1.5 border-2 border-[#E5E7EB] transform rotate-3">
              <div className="w-full h-10 bg-gradient-to-br from-[#9B59B6] to-[#8E44AD] rounded-lg mb-1" />
              <div className="w-full h-1 bg-[#E5E7EB] rounded mb-0.5" />
              <div className="w-2/3 h-1 bg-[#E5E7EB] rounded" />
            </div>
            {/* Checkmark */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#48A97D] rounded-full flex items-center justify-center shadow-md">
              <ListChecks className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Bottom Right Recipe Card */}
          <div className="absolute -bottom-6 -right-2 z-10 animate-pulse" style={{ animationDelay: "0.9s" }}>
            <div className="w-16 h-20 bg-white rounded-xl shadow-lg p-1.5 border-2 border-[#E5E7EB] transform -rotate-3">
              <div className="w-full h-10 bg-gradient-to-br from-[#3498DB] to-[#2980B9] rounded-lg mb-1" />
              <div className="w-full h-1 bg-[#E5E7EB] rounded mb-0.5" />
              <div className="w-3/4 h-1 bg-[#E5E7EB] rounded" />
            </div>
            {/* Checkmark */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#48A97D] rounded-full flex items-center justify-center shadow-md">
              <ListChecks className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-md w-[95vw] h-[75vh] sm:h-[80vh] p-0 border border-[#E5E7EB] bg-[#FDF8F3] overflow-hidden [&>button]:hidden rounded-3xl"
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-30 text-[#6B7280] hover:text-[#374151] text-sm font-medium transition-colors"
        >
          Skip
        </button>

        {/* Carousel */}
        <div className="relative h-full overflow-hidden" ref={emblaRef}>
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
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-t from-[#FDF8F3] via-[#FDF8F3] to-transparent pt-12 sm:pt-16 z-20">
          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mb-3 sm:mb-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDotClick(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-125 ${
                  currentSlide === index 
                    ? "w-6 bg-[#48A97D]" 
                    : "bg-[#D1D5DB] hover:bg-[#9CA3AF]"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-center items-center gap-4 mb-4">
            <button
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={`p-3 rounded-full bg-white border-2 border-[#48A97D]/20 shadow-xl hover:bg-[#48A97D] hover:border-[#48A97D] transition-all group ${
                canScrollPrev ? 'opacity-100 cursor-pointer hover:scale-110' : 'opacity-40 cursor-not-allowed'
              }`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-[#48A97D] group-hover:text-white transition-colors" />
            </button>
            <button
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={`p-3 rounded-full bg-white border-2 border-[#48A97D]/20 shadow-xl hover:bg-[#48A97D] hover:border-[#48A97D] transition-all group ${
                canScrollNext ? 'opacity-100 cursor-pointer hover:scale-110' : 'opacity-40 cursor-not-allowed'
              }`}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-[#48A97D] group-hover:text-white transition-colors" />
            </button>
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
