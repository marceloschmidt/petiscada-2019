Customers = new Mongo.Collection('customers');
WaiterRequests = new Mongo.Collection('waiterRequests');
Orders = new Mongo.Collection('orders');
Notifications = new Mongo.Collection('notifications');
Recipes = new Mongo.Collection('recipes');

Notifications.allow({
	remove() { return true }
})
