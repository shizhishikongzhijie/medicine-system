interface StockInRecord {
    id: number,
    medicine_id: number,
    quantity: number,
    batch_number: string,
    production_date: string,
    expiry_date: string,
    remark: string,
    stock_in_date: string,
    key?: number
}
interface Stock extends StockInRecord{
    medicine_name:string,
}
export type {Stock, StockInRecord}