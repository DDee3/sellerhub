export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProductType = 'stock' | 'preorder' | 'hybrid'
export type ShipmentStatus = 'ordering' | 'in_transit' | 'arrived' | 'delivering' | 'completed'
export type OrderType = 'stock' | 'preorder'
export type PaymentMethod = 'kbz_pay' | 'wave_pay' | 'cash' | 'cod'
export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
export type StockChangeReason = 'import' | 'sale' | 'adjustment' | 'damaged' | 'returned'
export type DealDirection = 'mmk_to_thb' | 'thb_to_mmk'
export type RateDisplayMode = 'mmk_per_thb' | 'thb_per_lakh'

export interface Database {
  public: {
    Tables: {
      shops: {
        Row: {
          id: string
          owner_id: string
          name: string
          rate_display_mode: RateDisplayMode | null
          phone: string | null
          facebook_url: string | null
          telegram_username: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          rate_display_mode?: RateDisplayMode | null
          phone?: string | null
          facebook_url?: string | null
          telegram_username?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          rate_display_mode?: RateDisplayMode | null
          phone?: string | null
          facebook_url?: string | null
          telegram_username?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          id: string
          shop_id: string
          name: string
          phone: string | null
          facebook_name: string | null
          telegram_username: string | null
          address: string | null
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          name: string
          phone?: string | null
          facebook_name?: string | null
          telegram_username?: string | null
          address?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          name?: string
          phone?: string | null
          facebook_name?: string | null
          telegram_username?: string | null
          address?: string | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          id: string
          shop_id: string
          direction: DealDirection
          amount_in: number
          customer_rate: number
          source_rate: number | null
          amount_out: number
          profit_mmk: number | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          direction: DealDirection
          amount_in: number
          customer_rate: number
          source_rate?: number | null
          amount_out: number
          profit_mmk?: number | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          direction?: DealDirection
          amount_in?: number
          customer_rate?: number
          source_rate?: number | null
          amount_out?: number
          profit_mmk?: number | null
          note?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_shop_id_fkey"
            columns: ["shop_id"]
            isOneToOne: false
            referencedRelation: "shops"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: string
          shop_id: string
          name: string
          image_url: string | null
          price: number
          cost_price: number | null
          type: ProductType
          stock_qty: number
          low_stock_alert: number
          deposit_percent: number
          source: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          name: string
          image_url?: string | null
          price: number
          cost_price?: number | null
          type: ProductType
          stock_qty?: number
          low_stock_alert?: number
          deposit_percent?: number
          source?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          name?: string
          image_url?: string | null
          price?: number
          cost_price?: number | null
          type?: ProductType
          stock_qty?: number
          low_stock_alert?: number
          deposit_percent?: number
          source?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          id: string
          shop_id: string
          name: string
          source: string | null
          order_date: string | null
          arrive_date: string | null
          status: ShipmentStatus
          total_cost: number | null
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          name: string
          source?: string | null
          order_date?: string | null
          arrive_date?: string | null
          status: ShipmentStatus
          total_cost?: number | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          name?: string
          source?: string | null
          order_date?: string | null
          arrive_date?: string | null
          status?: ShipmentStatus
          total_cost?: number | null
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          shop_id: string
          customer_id: string
          shipment_id: string | null
          order_type: OrderType
          total_price: number
          deposit_paid: number
          balance_due: number
          payment_method: PaymentMethod
          status: OrderStatus
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          customer_id: string
          shipment_id?: string | null
          order_type: OrderType
          total_price: number
          deposit_paid?: number
          balance_due: number
          payment_method: PaymentMethod
          status: OrderStatus
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          customer_id?: string
          shipment_id?: string | null
          order_type?: OrderType
          total_price?: number
          deposit_paid?: number
          balance_due?: number
          payment_method?: PaymentMethod
          status?: OrderStatus
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          quantity: number
          unit_price: number
          subtotal: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          subtotal?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          id: string
          shop_id: string
          product_id: string
          change: number
          reason: StockChangeReason
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          shop_id: string
          product_id: string
          change: number
          reason: StockChangeReason
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          shop_id?: string
          product_id?: string
          change?: number
          reason?: StockChangeReason
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      product_type: ProductType
      shipment_status: ShipmentStatus
      order_type: OrderType
      payment_method: PaymentMethod
      order_status: OrderStatus
      stock_change_reason: StockChangeReason
    }
  }
}

export type Deal = Database['public']['Tables']['deals']['Row']
export type InsertDeal = Database['public']['Tables']['deals']['Insert']
export type UpdateDeal = Database['public']['Tables']['deals']['Update']
