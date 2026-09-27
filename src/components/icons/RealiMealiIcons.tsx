import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const RecipeCardIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
    <path d="M8 7.5h8M8 11h5.5" />
    <path d="M8 15.3c1.1-1.7 2.7-1.7 3.8 0 1.1-1.7 2.7-1.7 3.8 0" />
    <path d="M17.5 14.2v4.3M15.8 16.4h3.4" />
  </svg>
);

export const MealPlanIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <path d="M7.5 2.8v3.4M16.5 2.8v3.4M3.5 9h17" />
    <circle cx="12" cy="14.2" r="3.1" />
    <path d="M10.2 13.8c.7-1.1 1.8-1.1 2.5 0 .7-1.1 1.8-1.1 2.5 0M12 11.1v-.8" />
  </svg>
);

export const ShoppingBasketIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 9.5h16l-1.5 9.2a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7L4 9.5Z" />
    <path d="M8 9.5 10.5 5M16 9.5 13.5 5" />
    <path d="M7.2 13.2h9.6M8 16.2h8" />
    <path d="M10.2 5.1c.6-1.4 3-1.4 3.6 0" />
  </svg>
);

export const DiscoverRecipeIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="4" y="4" width="13.5" height="16" rx="2.2" />
    <path d="M7.5 8h6.5M7.5 11.2h4.2M7.5 15c1.2-1.5 2.5-1.5 3.7 0" />
    <path d="M18.2 4.5v5.5M15.5 7.2h5.4M18.2 4.5l1.2 1.2M18.2 10l-1.2-1.2" />
  </svg>
);

export const RealiChefIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M6.2 11.2V8.5a5.8 5.8 0 0 1 11.6 0v2.7" />
    <path d="M5.2 10.5h13.6v3.1H5.2z" />
    <path d="M8.2 13.6v4.6h7.6v-4.6" />
    <path d="M9.7 18.2h4.6" />
    <path d="M19.2 3v4.8M16.8 5.4h4.8M4.1 4.5v3.8M2.2 6.4H6" />
  </svg>
);

export const RandomRecipeIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 7h2.2c3.8 0 4.4 5.8 8.2 5.8H20" />
    <path d="M16.8 9.6 20 12.8l-3.2 3.2" />
    <path d="M4 17h2.2c1.7 0 2.7-1.1 3.5-2.2" />
    <path d="M15.3 5.2h2.1L20 7.8M15.3 18.8h2.1L20 16.2" />
    <circle cx="4" cy="7" r="1.2" />
    <circle cx="4" cy="17" r="1.2" />
  </svg>
);

export const LeftoversIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="5" y="7" width="14" height="12" rx="2.2" />
    <path d="M5 10h14M9 7V5.5h6V7" />
    <path d="M8.2 14.5a4 4 0 0 0 6.7 2M15.8 13.5a4 4 0 0 0-6.7-2" />
    <path d="m8.8 11.2-1.3.3.3 1.3M15.2 16.8l1.3-.3-.3-1.3" />
  </svg>
);

export const AchievementIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M7 4.5h10v5.2c0 3.2-2.2 5.8-5 5.8s-5-2.6-5-5.8V4.5Z" />
    <path d="M7 6H4.5v2.2A4.3 4.3 0 0 0 8 12.3M17 6h2.5v2.2a4.3 4.3 0 0 1-3.5 4.1" />
    <path d="M12 15.5v3M9 20h6" />
    <path d="m12 6.2.7 1.5 1.6.2-1.2 1.1.3 1.6-1.4-.8-1.4.8.3-1.6-1.2-1.1 1.6-.2.7-1.5Z" />
  </svg>
);

export const MealIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 14.5h16" />
    <path d="M5 14.5a7 7 0 0 1 14 0" />
    <path d="M7 18.5h10" />
    <path d="M9.5 9.2c.6-.8 1.1-1.7 1.1-2.7M13.4 9.2c.6-.8 1.1-1.7 1.1-2.7" />
  </svg>
);
