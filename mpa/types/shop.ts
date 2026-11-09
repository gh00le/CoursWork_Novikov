export interface Category { id: number; name: string; }
export interface Product {
  id: number; name: string; description: string;
  price: string; stock: number; image_url: string | null; category_id: number;
}
export interface CartProduct { id: number; name: string; price: string; image_url: string | null; }
export interface CartItem { id: number; quantity: number; product: CartProduct; }
export interface Cart { id: number; items: CartItem[]; total: string; }
export interface CartCreated { id: number; }
export interface Order { id: number; total_amount: string; status: string; }
