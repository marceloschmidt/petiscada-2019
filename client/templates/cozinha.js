Template.cozinha.helpers({
	user() {
		return Meteor.user();
	},
	orders() {
		return Orders.find({}, { sort: { createdAt: 1 } });
	},
	quantity() {
		return this.quantity > 1 ? '<strong>' + this.quantity + '</strong>' : 1;
	}
})

Template.cozinha.onCreated(function() {
	this.subscribe('cozinha')
})

Template.cozinha.events({
	'click .move'(e, instance) {
		Meteor.call('moveOrder', this._id, 1);
	}
})
