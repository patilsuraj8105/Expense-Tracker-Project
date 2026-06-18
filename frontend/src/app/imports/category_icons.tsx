import React from "react";
import { Utensils, Car, Zap, ShoppingBag, Pill, Film, CreditCard } from "lucide-react";

export const CategoryIcons: Record<string, React.ComponentType<any>> = {
  food: Utensils,
  travel: Car,
  bills: Zap,
  utilities: Zap,
  shopping: ShoppingBag,
  health: Pill,
  medical: Pill,
  entertainment: Film,
  others: CreditCard,
};

export function getCategoryIconComponent(category: string) {
  return CategoryIcons[category.toLowerCase()] || CategoryIcons.others;
}

export function CategoryIcon({ category, size = 16, color }: { category: string; size?: number; color?: string }) {
  const IconComponent = getCategoryIconComponent(category);
  return <IconComponent size={size} color={color} />;
}
