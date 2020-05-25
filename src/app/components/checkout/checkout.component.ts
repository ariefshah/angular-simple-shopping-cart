import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,AfterViewChecked
} from "@angular/core";
import {
  CartItem
} from "app/models/cart-item.model";
import {
  DeliveryOption
} from "app/models/delivery-option.model";
import {
  Product
} from "app/models/product.model";
import {
  ShoppingCart
} from "app/models/shopping-cart.model";
import {
  DeliveryOptionsDataService
} from "app/services/delivery-options.service";
import {
  ProductsDataService
} from "app/services/products.service";
import {
  ShoppingCartService
} from "app/services/shopping-cart.service";
import {
  Observable
} from "rxjs/Observable";
import {
  Subscription
} from "rxjs/Subscription";

import {itemPurchased} from "app/models/itemPurchased.model"

import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { from } from "rxjs/observable/from";
import {Router} from '@angular/router';

interface ICartItemWithProduct extends CartItem {
  product: Product;
  totalCost: number;
}
declare let paypal: any;
@Component({
  selector: "app-checkout",
  styleUrls: ["./checkout.component.scss"],
  templateUrl: "./checkout.component.html"
})
export class CheckoutComponent implements AfterViewChecked  , OnInit , OnDestroy {

  public deliveryOptions: Observable < DeliveryOption[] > ;
  public cart: Observable < ShoppingCart > ;
  public cartItems: ICartItemWithProduct[];
  public itemCount: number;

  private products: Product[];
  private cartSubscription: Subscription;

  public constructor(private productsService: ProductsDataService,
    private deliveryOptionService: DeliveryOptionsDataService,
    private shoppingCartService: ShoppingCartService,private router: Router) {}

  public emptyCart(): void {
    this.shoppingCartService.empty();
  }

  public setDeliveryOption(option: DeliveryOption): void {
    this.shoppingCartService.setDeliveryOption(option);
  }


  public ngOnInit(): void {
    this.deliveryOptions = this.deliveryOptionService.all();
    this.cart = this.shoppingCartService.get();
    this.cartSubscription = this.cart.subscribe((cart) => {
      this.itemCount = cart.items.map((x) => x.quantity).reduce((p, n) => p + n, 0);
      this.productsService.all().subscribe((products) => {
        this.products = products;
        this.cartItems = cart.items
          .map((item) => {
            const product = this.products.find((p) => p.id === item.productId);
            return {
              ...item,
              product,
              totalCost: product.price * item.quantity
            };
          });
      });
    });
  }

  addScript: boolean = false;
  paypalLoad: boolean = true;

  finalAmount: number = 1;

public checkout():void{
var t= this.cartItems.map(i=>i.totalCost).reduce((p, n) => p + n, 0);
  console.log(t);
}

  paypalConfig = {
    env: 'production',
    client: {
      sandbox: 'AeF0QdYBlpEQP0kqlhy_SkKyhRZPyWWETIxLRO5LMpYjt3HJ36wfhPAcsDBNVqJeCdjk1lAoRljvjuW7',
      production: 'AU0TBS4N6fsEaF7kOjclwGdN9WkE1BwEmUfoKucfWzklr2Lk1Hoqg8Kv9-QYZrJNvuO6Wi_ZgfYkfgtn'
    },
    commit: true,
    payment: (data, actions) => {
      return actions.payment.create({
        payment: {
          transactions: [{
            amount: {
              total:this.cartItems.map(i=>i.totalCost).reduce((p, n) => p + n, 10).toString(),
              currency: 'AUD',
              details: {
                subtotal: this.cartItems.map(i=>i.totalCost).reduce((p, n) => p + n, 0).toString(),
                shipping: '10',
                    }
            },
            description: 'The payment transaction description.',
            custom: '90048630024435',
            //invoice_number: '12345', Insert a unique invoice number
            payment_options: {
              allowed_payment_method: 'INSTANT_FUNDING_SOURCE'
            },
            soft_descriptor: 'ECHI5786786',
            item_list: {
              items: this.cartItems
              .map((item) => {
                const product = this.products.find((p) => p.id === item.productId);
                return {
                  "name":product.name,
                  "description":"any",
                  "price": product.price ,
                  "quantity":item.quantity,
                  "currency":   "AUD"
                };
              }),
              // shipping_address: {
              //   // recipient_name: 'Brian Robinson',
              //   // line1: '4th Floor',
              //   // line2: 'Unit #34',
              //   // city: 'San Jose',
              //   // country_code: 'US',
              //   // postal_code: '95131',
              //   // phone: '011862212345678',
              //   // state: 'CA'
              // }
            }
          }],
          note_to_payer: 'Contact us for any questions on your order.'}
      })
    },
    onAuthorize: (data, actions) => {
      return actions.payment.execute().then((payment) => {
        //Do something when payment is successful.
        this.router.navigateByUrl('/confirmed');

      })
    }
  };

  ngAfterViewChecked(): void {
    if (!this.addScript) {
      this.addPaypalScript().then(() => {
        paypal.Button.render(this.paypalConfig, '#paypal-checkout-btn');
        this.paypalLoad = false;
      })
    }
  }

  addPaypalScript() {
    this.addScript = true;
    return new Promise((resolve, reject) => {
      let scripttagElement = document.createElement('script');
      scripttagElement.src = 'https://www.paypalobjects.com/api/checkout.js';
      scripttagElement.onload = resolve;
      document.body.appendChild(scripttagElement);
    })
  }
  public ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }
}
