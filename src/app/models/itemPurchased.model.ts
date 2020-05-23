
export class itemPurchased {
  public productId: string;
  public quantity: number = 0;
public description:string;
public productName:string
public cost: number;

public updateFrom(src: itemPurchased): void {
  this.productId = src.productId;
  this.quantity = src.quantity;
  this.description = src.description;
  this.productName = src.productName;
  this.cost = src.cost;
}
}
