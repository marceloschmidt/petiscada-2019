Template.balcao.helpers({
	user() {
		return Meteor.user();
	},
	orders() {
		return Orders.find({}, { sort: { createdAt: 1 } });
	}
})

Template.balcao.onCreated(function() {
	this.subscribe('balcao')
})

Template.balcao.events({
	'click .move'(e, instance) {
		Meteor.call('moveOrder', this._id, 1);
	}
})
