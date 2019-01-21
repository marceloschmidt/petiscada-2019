Template.orders.onCreated(function() {
	this.subscribe('orders', { code: localStorage.getItem('code') });
})

Template.orders.helpers({
	orders() {
		return Orders.find({}, { sort: { createdAt: -1 }});
	},

	total() {
		let orders = Orders.find().fetch();
		return orders.reduce((total, order) => { return total + order.price }, 0)
	}
})
