Customers = new Mongo.Collection('customers');
WaiterRequests = new Mongo.Collection('waiterRequests');
Orders = new Mongo.Collection('orders');
Notifications = new Mongo.Collection('notifications');
Menu = new Mongo.Collection('menu');

Notifications.allow({
	remove() { return true }
})
