export type ServiceCategory = 'appointment' | 'seminar' | 'agricultural_order' | 'livestream';

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  durationMinutes: number;
  availableDays: string[];
  timeSlots: string[];
  bookingInstructions: string;
  cancellationPolicy: string;
  active: boolean;
  createdAt?: string;
}

export type AppointmentStatus = 'pending_payment' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed';

export interface Appointment {
  id: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  notes?: string;
  price: number;
  platformFee: number;
  totalAmount: number;
  paymentReference?: string;
  paystackReference?: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt?: string;
}

export type SeminarStatus = 'upcoming' | 'cancelled' | 'completed';

export interface Seminar {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  registrationPrice: number;
  date: string;
  time: string;
  venue: string;
  isOnline: boolean;
  registrationDeadline: string;
  capacity: number;
  registeredCount: number;
  status: SeminarStatus;
  createdAt?: string;
}

export interface SeminarRegistration {
  id: string;
  seminarId: string;
  seminarTitle: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  price: number;
  platformFee: number;
  totalAmount: number;
  paymentReference?: string;
  paystackReference?: string;
  status: 'pending_payment' | 'confirmed' | 'cancelled';
  registeredAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrls: string[];
  categoryId: string;
  categoryName: string;
  price: number;
  unitOfSale: string; // e.g., 'Per Seedling', 'Bundle of 10', '50kg Bag'
  stock: number;
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  active: boolean;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'cancelled' | 'refunded';
export type FulfilmentStatus = 'awaiting_fulfilment' | 'ready_for_collection' | 'collected';

export interface OrderLineItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unitOfSale: string;
  total: number;
}

export interface Order {
  id: string;
  orderReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OrderLineItem[];
  subtotal: number;
  platformFee: number;
  totalAmount: number;
  paymentReference?: string;
  paystackReference?: string;
  status: OrderStatus;
  fulfilmentStatus: FulfilmentStatus;
  collectionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type QuoteStatus = 'pending_review' | 'quoted' | 'accepted' | 'declined' | 'withdrawn' | 'expired';
export type LiveStreamPricingType = 'fixed' | 'custom_quote';

export interface LiveStreamBooking {
  id: string;
  enquiryReference: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  eventType: string;
  eventDate: string;
  startTime: string;
  location: string;
  durationHours: number;
  audienceSize?: string;
  preferredPlatform?: string;
  technicalRequirements?: string;
  notes?: string;
  pricingType: LiveStreamPricingType;
  quotedPrice?: number;
  platformFee?: number;
  totalAmount?: number;
  quoteStatus?: QuoteStatus;
  quoteConditions?: string;
  quoteExpiresAt?: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentReference?: string;
  paystackReference?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentRecord {
  id: string;
  internalReference: string;
  paystackReference: string;
  category: ServiceCategory;
  relatedId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  businessAmount: number;
  platformFee: number;
  totalAmountCharged: number;
  currency: 'NGN';
  status: 'pending' | 'verified' | 'failed' | 'refunded';
  splitConfig?: {
    subaccount?: string;
    transaction_charge?: number;
    bearer?: string;
  };
  verifiedAt?: string;
  createdAt: string;
}

export interface RefundRecord {
  id: string;
  paymentReference: string;
  relatedId: string;
  category: ServiceCategory;
  customerName: string;
  customerPhone: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  platformFeeRefunded: boolean;
  requestedAt: string;
  processedAt?: string;
}

export interface NotificationLog {
  id: string;
  type: string;
  recipientPhone?: string;
  recipientEmail?: string;
  relatedReference?: string;
  channel: 'sms' | 'email' | 'both';
  status: 'queued' | 'sent' | 'failed' | 'unconfigured';
  message: string;
  providerReference?: string;
  attemptCount: number;
  error?: string;
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  collectionAddress: string;
  websiteDomain: string;
  logoUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
  };
  platformFeeNgn: number;
  paystackSubaccount: string;
  paystackTestMode: boolean;
  appointmentCancellationHours: number;
  platformFeeRefundable: boolean;
}
