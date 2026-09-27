// Foto que se usa mientras el barbero no tenga una propia
const DEFAULT_LARGE = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=800&fit=crop";
const DEFAULT_SMALL = "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop";

export const barberPhoto = (barber, size = "large") =>
  barber?.photo || (size === "small" ? DEFAULT_SMALL : DEFAULT_LARGE);
