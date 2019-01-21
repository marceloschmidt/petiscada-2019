Meteor.publish('notifications', function (code) {
	if (!code) {
		return this.ready();
	}
	return Notifications.find({ code: parseInt(code) }, { sort: { date: -1 } });
});

Meteor.publish('recipes', function () {
	return Recipes.find({ outofstock: { $ne: true } }, { sort: { type: 1 } });
});

Meteor.publish('orders', function ({ code = 0 } = {}) {
	if (code) {
		return Orders.find({ code: parseInt(code), item: { $nin: ['entry','waiter'] } }, { sort: { createdAt: -1 } });
	} else {
		return this.ready();
	}
});

Meteor.publish('customers', function({ filter = {}, sort = { createdAt: -1 }, skip = 0 } = {}) {
	let user = Meteor.users.findOne(this.userId);
	if (user && user.admin) {
		return Customers.find(Object.assign(filter, { closed: { $ne: true } }), { sort, skip, limit: 5 });
	} else {
		return this.ready();
	}
})

Meteor.publish('adminOrders', function ({ filter = {}, sort = { createdAt: -1 }, limit = 0, skip = 0 } = {}) {
	filter = Object.assign({ item: { $ne: 'entry' }, status: { $ne: '' } }, filter);
	let user = Meteor.users.findOne(this.userId);
	if (user && user.admin) {
		return Orders.find(filter, { sort: sort, limit: limit, skip });
	} else {
		return this.ready();
	}
});

Meteor.publish('cozinha', function() {
	let user = Meteor.users.findOne(this.userId);
	if (user && user.admin) {
		return Orders.find({ status: { $in: [ 'Confirmado', 'Em produção' ] } }, { sort: { createdAt: 1 } });
	} else {
		return this.ready();
	}
})

Meteor.publish('balcao', function() {
	let user = Meteor.users.findOne(this.userId);
	if (user && user.admin) {
		return Orders.find({ status: { $in: [ 'Aguardando entrega', 'Solicitado' ] } }, { sort: { createdAt: 1 } });
	} else {
		return this.ready();
	}
})

Meteor.publish('adminCustomers', function ({ filter = { }, sort = { createdAt: -1 }, limit = 0, skip = 0 } = {}) {
	let user = Meteor.users.findOne(this.userId);
	if (user && user.admin) {
		return Customers.find(filter, { sort, limit, skip });
	} else {
		return this.ready();
	}
});

Meteor.publish(null, function() {
  return Meteor.users.find(this.userId, {
    fields: {
			admin: 1,
			services:1
    }
  });
})
