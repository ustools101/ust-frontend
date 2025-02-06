export default function calculatePrice(weeks:number, platforms:number){
    const basePrice = process.env.NEXT_BASE_PRICE ? Number(process.env.NEXT_BASE_PRICE) : 4000; // Base price for first platform
    const additionalPrice = process.env.NEXT_ADDITIONAL_PRICE ? Number(process.env.NEXT_ADDITIONAL_PRICE) : 2500; // Price for each additional platform
    const additionalPlatforms = platforms - 1;
    const platformTotal = basePrice + (additionalPlatforms > 0 ? additionalPlatforms * additionalPrice : 0);
    
    return platformTotal * weeks;
  };