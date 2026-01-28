export default function calculatePrice(duration: number, platforms: number) {
  const basePrice = process.env.NEXT_BASE_PRICE ? Number(process.env.NEXT_BASE_PRICE) : 4000;
  const additionalPrice = process.env.NEXT_ADDITIONAL_PRICE ? Number(process.env.NEXT_ADDITIONAL_PRICE) : 2500;
  const additionalPlatforms = platforms - 1;

  // For 3 days duration (represented as 0.5), base price is halved
  const effectiveBasePrice = duration === 0.5 ? basePrice / 2 : basePrice;
  const platformTotal = effectiveBasePrice + (additionalPlatforms > 0 ? additionalPlatforms * additionalPrice : 0);

  // Duration multiplier: 0.5 (3 days) = 1x, otherwise duration * 1x
  const multiplier = duration === 0.5 ? 1 : duration;

  return platformTotal * multiplier;
}