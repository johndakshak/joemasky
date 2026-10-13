// Response type for GET /shop/contact
// Returns bare phone numbers; the frontend builds the full links.
export interface ShopContact {
  whatsapp: string; // bare number, e.g. "2348012345678"
  phone: string;    // bare number, e.g. "2348012345678"
}

// Response type for GET /order/:publicToken/contact-shop
// Returns fully formed, ready-to-use URLs — use them directly.
export interface OrderContactLinks {
  whatsapp: string; // complete wa.me URL with pre-filled order message
  call: string;     // tel: URI
  sms: string;      // sms: URI with pre-filled order message
}
