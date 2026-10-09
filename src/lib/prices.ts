// Official price list (USD at Pi GCV). The server uses this to decide what a guest must pay;
// amounts sent from the browser are never trusted.
export const PI_GCV_USD = 314159;
export const toPiAmount = (usd: number) => Number((usd / PI_GCV_USD).toPrecision(3));

export const ROOM_USD: Record<string, number> = {
  "Savannah Suite": 330,
  "Acacia Family Villa": 543,
  "Kilimanjaro Suite": 410,
  "Manyara Lake Villa": 465,
  "Ngorongoro Crater Suite": 620,
};

export const MENU_USD: Record<string, number> = {
  "Mandazi & Ginger Tea": 7,
  "Chapati & Beans": 6,
  "Garden Omelette": 8.5,
  "Continental Pancakes": 10,
  "Fresh Tropical Fruit Platter": 9,
  "Nyama Choma & Ugali": 22,
  "Mshikaki — Beef Skewers": 17.5,
  "Chicken Pilau": 15,
  "Coconut Fish Curry": 20,
  "Ugali & Sukuma Wiki": 10,
  "Wood-fired Margherita Pizza": 16,
  "Serengeti Beef Burger & Fries": 18,
  "Grilled Chicken Pasta": 17,
  "Caesar Salad": 12,
  "Vegetable Curry & Rice": 13,
  "Kilimanjaro Single-Origin Coffee": 5,
  "Spiced African Chai": 4,
  "Fresh Mango & Passion Juice": 6,
  "Baobab Smoothie": 7,
  "Serengeti Sundowner Cocktail": 12,
};

export const TOUR_USD: Record<string, number> = {
  "Sunrise Game Drive": 124,
  "Hot Air Balloon Safari": 465,
  "Sundowner Bush Walk": 70,
  "Maasai Cultural Visit": 55,
};

export function roomPricePerNight(room: string): number | null {
  const usd = ROOM_USD[room];
  return usd === undefined ? null : toPiAmount(usd);
}
export function roomTotal(room: string, nights: number): number | null {
  const p = roomPricePerNight(room);
  return p === null ? null : +(nights * p).toFixed(6);
}
export function foodTotal(item: string, quantity: number): number | null {
  const usd = MENU_USD[item];
  return usd === undefined ? null : Number((toPiAmount(usd) * quantity).toPrecision(6));
}
export function tourPrice(tour: string): number | null {
  const usd = TOUR_USD[tour];
  return usd === undefined ? null : toPiAmount(usd);
}
export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86400000);
}
