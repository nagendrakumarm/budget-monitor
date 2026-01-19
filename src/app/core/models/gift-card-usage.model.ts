export interface GiftCardUsage {
  id: number;
  gift_card_id: number;
  used_amount: number;
  location?: string;
  note?: string;
  used_at: string;
}