var invoicer = angular.module('invoicer', ["xeditable", "angularLocalStorage"]);

invoicer.run(function(editableOptions) {
  editableOptions.theme = 'bs3';
  });

enum Gst { Add, None }

/** A billable item on an invoice. */
class LineItem {
  title: string = "Item";
  project : string = "Project";
  desc: string = "Description";
  /** How many items are being sold. Either hours or agreed upon unit. */
  quantity: number = 1;
  /** The cost per unit, excluding GST. */
  unit_price: number = 100;
  /** Whether GST should be added to the item at 10%. */
  gst: Gst = Gst.Add;

  /** Constructs a new LineItem, optionally copy constructing from parameter.
   * @param copyFrom: Optional object to copy member values from. */
  constructor(copyFrom?) {
    if (copyFrom != null) {
      this.title = copyFrom.title;
      this.project = copyFrom.project;
      this.desc = copyFrom.desc;
      this.quantity = copyFrom.quantity;
      this.unit_price = copyFrom.unit_price;
      this.gst = copyFrom.gst;
    }
  }

  /** Calculate the GST exclusive cost of this item. */
  sub_total_gst() {
    switch (this.gst) {
      case Gst.Add: return this.sub_total() * 0.1;
      case Gst.None: return 0;
      default: throw Error("this.gst must be " + Gst[Gst.None] + " or " + Gst[Gst.Add]);
    }
  }

  /** Calculate the GST for this item. */
  sub_total() { return this.quantity * this.unit_price; }

  /** Calculate the GST inclusive cost of this item. */
  total() { return this.sub_total() + this.sub_total_gst(); }
}

class Contact {
  company = "Entity Name";
  address = "Address";
  phone = "Phone";
  email = "email@email.com";
  abn = "01 234 567 901";

  /** Constructs a new Contact, optionally copy constructing from parameter.
   * @param copyFrom: Optional object to copy member values from. */
  constructor(copyFrom?) {
    if (copyFrom != null) {
      this.company = copyFrom.company;
      this.address = copyFrom.address;
      this.phone = copyFrom.phone;
      this.email = copyFrom.email;
      this.abn = copyFrom.abn;
    }
  }
}

class BankDetails {
  name = "Bank name";
  bsb = "012 345";
  account = "1234 5678";

  /** Constructs a new BankDetails, optionally copy constructing from parameter.
   * @param copyFrom: Optional object to copy member values from. */
  constructor(copyFrom?) {
    if (copyFrom != null) {
      this.name = copyFrom.name;
      this.bsb = copyFrom.bsb;
      this.account = copyFrom.account;
    }
  }
}

class Invoice {
  bill_type = "Tax Invoice";
  /** Unique invoice identifier */
  id = "###";
  /** Date the invoice was sent. */
  send_date = new Date(Date.now()).toDateString();
  /** Contact details for the sender of the invoice */
  from = new Contact();
  /** Contact details for the receiver of the invoice */
  to = new Contact();
  /** Details for client to make payment to */
  pay_to =  new BankDetails();
  /** Billable items on the invoice */
  line_items : LineItem[] = [
      new LineItem()
  ]

  /** Constructs a new Invoice, optionally copy constructing from parameter.
   * @param copyFrom: Optional object to copy member values from. */
  constructor(copyFrom?) {
    if (copyFrom != null) {
      this.bill_type = copyFrom.bill_type;
      this.id = copyFrom.id;
      this.send_date = copyFrom.send_date;
      this.from = new Contact(copyFrom.from);
      this.to = new Contact(copyFrom.to);
      this.pay_to = copyFrom.pay_to;
      this.line_items = new Array<LineItem>();
      if (copyFrom.line_items != null) {
        for (let i = 0; i < copyFrom.line_items.length; i++) {
            this.line_items.push(new LineItem(copyFrom.line_items[i]));
        }
      }
    }
  }

  /** Calculates the amount owed by the client, exluding GST. */
  sum_sub_totals() : number {
    var li = this.line_items;
    var sum = 0;
    for(var i = 0; i < li.length; i++) {
        sum += li[i].sub_total();
    }
    return sum;
  }

  /** Calculates the amount of GST owed by the client. */
  sum_gst() : number {
    var li = this.line_items;
    var sum = 0;
    for(var i = 0; i < li.length; i++) {
        sum += li[i].sub_total_gst();
    }
    return sum;
  }

  /** Calculates the entire amount owed by the client, including GST. */
  sum_total() : number {
    var li = this.line_items;
    var sum = 0;
    for(var i = 0; i < li.length; i++) {
        sum += li[i].total();
    }
    return sum;
  }

  /** Adds a new LineItem to the item list. */
  add_item() : LineItem {
    var item = new LineItem();
    this.line_items.push(item);
    return item;
  }

  /** Removes the LineItem at the list index. */
  remove_item_at(index : number) {
    return this.line_items.splice(index, 1)[0];
  }
}

invoicer.controller('invController',
  ["$scope", "storage", function($scope, storage){

    // Hook up prototypes again for objects which were pulled from storage.
    (() => {
      $scope.invoice = new Invoice(
        storage.bind($scope, "invoice", { defaultValue: new Invoice() }));
    })();


    $scope.gst_options = [
      {value: Gst.Add, text: Gst[Gst.Add]},
      {value: Gst.None, text: Gst[Gst.None]},
    ];

    $scope.addItem = function() {
        $scope.invoice.line_items.push(this.invoice.temp);
        $scope.invoice.temp = {};
    }

    $scope.show_hidden = { "show-hidden": false };

    $scope.checkModDown = function(event) {
      if (event.keyCode === 17) {
        $scope.show_hidden["show-hidden"] = true;
      }
    }

    $scope.checkModUp = function(event) {
      if (event.keyCode === 17) {
        $scope.show_hidden["show-hidden"] = false;
      }
    }

    $scope.contentLoaded = true;

}]);
