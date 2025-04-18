interface StockInRecord {
    id: number
    medicine_id: number
    quantity: number
    batch_number: string
    production_date: string
    expiry_date: string
    remark: string
    stock_in_date: string
    supplier_id: number
    key?: number
}
interface Stock extends StockInRecord {
    medicine_name: string
    supplier_name: string
}
export type { Stock, StockInRecord }
