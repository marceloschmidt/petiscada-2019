Template.orders.onCreated(function() {
	this.subscribe('orders', { code: localStorage.getItem('code') });
})

Template.orders.helpers({
	orders() {
		return Orders.find({}, { sort: { createdAt: -1 }});
	},

	total() {
		let orders = Orders.find().fetch();
		return orders.reduce((total, order) => { return total + (order.price * order.quantity) }, 0)
	},

	quantity() {
		if (this.quantity > 1) {
			return `x ${this.quantity}`;
		}
	},

	price() {
		return this.price * this.quantity;
	},

	preorder() {
		return this.status === 'Pré-compra';
	}
})

Template.orders.events({
	'click .preorder'(e) {
		e.preventDefault();
		Meteor.call('movePreorder', this._id);
	}
})
