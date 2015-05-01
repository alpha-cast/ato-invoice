var invoicer = angular.module('invoicer', ["xeditable", "angularLocalStorage"]);
invoicer.run(function (editableOptions) {
    editableOptions.theme = 'bs3';
});
var Gst;
(function (Gst) {
    Gst[Gst["Add"] = 0] = "Add";
    Gst[Gst["None"] = 1] = "None";
})(Gst || (Gst = {}));
var LineItem = (function () {
    function LineItem(copyFrom) {
        this.title = "Item";
        this.project = "Project";
        this.desc = "Description";
        this.quantity = 1;
        this.unit_price = 100;
        this.gst = Gst.Add;
        if (copyFrom != null) {
            this.title = copyFrom.title;
            this.project = copyFrom.project;
            this.desc = copyFrom.desc;
            this.quantity = copyFrom.quantity;
            this.unit_price = copyFrom.unit_price;
            this.gst = copyFrom.gst;
        }
    }
    LineItem.prototype.sub_total_gst = function () {
        switch (this.gst) {
            case Gst.Add: return this.sub_total() * 0.1;
            case Gst.None: return 0;
            default: throw Error("this.gst must be " + Gst[Gst.None] + " or " + Gst[Gst.Add]);
        }
    };
    LineItem.prototype.sub_total = function () { return this.quantity * this.unit_price; };
    LineItem.prototype.total = function () { return this.sub_total() + this.sub_total_gst(); };
    return LineItem;
})();
var Contact = (function () {
    function Contact(copyFrom) {
        this.company = "Entity Name";
        this.address = "Address";
        this.phone = "Phone";
        this.email = "email@email.com";
        this.abn = "01 234 567 901";
        if (copyFrom != null) {
            this.company = copyFrom.company;
            this.address = copyFrom.address;
            this.phone = copyFrom.phone;
            this.email = copyFrom.email;
            this.abn = copyFrom.abn;
        }
    }
    return Contact;
})();
var BankDetails = (function () {
    function BankDetails(copyFrom) {
        this.name = "Bank name";
        this.bsb = "012 345";
        this.account = "1234 5678";
        if (copyFrom != null) {
            this.name = copyFrom.name;
            this.bsb = copyFrom.bsb;
            this.account = copyFrom.account;
        }
    }
    return BankDetails;
})();
var Invoice = (function () {
    function Invoice(copyFrom) {
        this.bill_type = "Tax Invoice";
        this.id = "###";
        this.send_date = new Date(Date.now()).toDateString();
        this.from = new Contact();
        this.to = new Contact();
        this.pay_to = new BankDetails();
        this.line_items = [
            new LineItem()
        ];
        if (copyFrom != null) {
            this.bill_type = copyFrom.bill_type;
            this.id = copyFrom.id;
            this.send_date = copyFrom.send_date;
            this.from = new Contact(copyFrom.from);
            this.to = new Contact(copyFrom.to);
            this.pay_to = copyFrom.pay_to;
            this.line_items = new Array();
            if (copyFrom.line_items != null) {
                for (var i = 0; i < copyFrom.line_items.length; i++) {
                    this.line_items.push(new LineItem(copyFrom.line_items[i]));
                }
            }
        }
    }
    Invoice.prototype.sum_sub_totals = function () {
        var li = this.line_items;
        var sum = 0;
        for (var i = 0; i < li.length; i++) {
            sum += li[i].sub_total();
        }
        return sum;
    };
    Invoice.prototype.sum_gst = function () {
        var li = this.line_items;
        var sum = 0;
        for (var i = 0; i < li.length; i++) {
            sum += li[i].sub_total_gst();
        }
        return sum;
    };
    Invoice.prototype.sum_total = function () {
        var li = this.line_items;
        var sum = 0;
        for (var i = 0; i < li.length; i++) {
            sum += li[i].total();
        }
        return sum;
    };
    Invoice.prototype.add_item = function () {
        var item = new LineItem();
        this.line_items.push(item);
        return item;
    };
    Invoice.prototype.remove_item_at = function (index) {
        return this.line_items.splice(index, 1)[0];
    };
    return Invoice;
})();
invoicer.controller('invController', ["$scope", "storage", function ($scope, storage) {
        (function () {
            $scope.invoice = new Invoice(storage.bind($scope, "invoice", { defaultValue: new Invoice() }));
        })();
        $scope.gst_options = [
            { value: Gst.Add, text: Gst[Gst.Add] },
            { value: Gst.None, text: Gst[Gst.None] },
        ];
        $scope.addItem = function () {
            $scope.invoice.line_items.push(this.invoice.temp);
            $scope.invoice.temp = {};
        };
        $scope.show_hidden = { "show-hidden": false };
        $scope.checkModDown = function (event) {
            if (event.keyCode === 17) {
                $scope.show_hidden["show-hidden"] = true;
            }
        };
        $scope.checkModUp = function (event) {
            if (event.keyCode === 17) {
                $scope.show_hidden["show-hidden"] = false;
            }
        };
        $scope.contentLoaded = true;
    }]);
