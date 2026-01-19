export interface GiftCard {
  id: number;
  name: string;
  card_number: string;
  card_pin: string;
  initial_amount: number;
  created_at: string;
}

export interface GiftCardBalance extends GiftCard {
  total_used: number;
  remaining_balance: number;
}