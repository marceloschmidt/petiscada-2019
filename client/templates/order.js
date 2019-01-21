Template.order.events({
	'click .js-buy': function(event) {
		return Overlay.open('buyOverlay', this);
	}
})
