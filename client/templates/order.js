Template.order.events({
	'click .js-buy': function(event) {
		event.preventDefault();
		const item = Cart.findOne({ _id: this._id });
		if (item) {
			if (item.removed === true) {
				Cart.update({ _id: this._id }, {$unset: { removed: 1 }, $set: { quantity: 1 }});
			} else if (item.quantity < 9) {
				Cart.update({ _id: this._id }, { $inc: { quantity: 1 }});
			}
		} else {
			const item = this;
			item.quantity = 1;
			Cart.insert(this);
		}
	}
})
