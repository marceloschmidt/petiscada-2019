const NOTIFICATION_TIMEOUT = 3000;
const ENTRY_PRICE = 5;
Meteor.methods({
	'buy'(code, orderData) {
		if (code && orderData && orderData.length > 0) {
			if (Meteor.isServer) {
				customer = Customers.findOne({ closed: {$ne: true }, code: parseInt(code) });
			} else {
				customer = true;
			}
			if (customer) {
				for (order of orderData) {
					Orders.insert({ code: customer.code, name: customer.name, table: customer.table, item: order.name, title: order.title, price: order.price, createdAt: new Date(), status: order.status[0], quantity: order.quantity });
					const id = Notifications.insert({ title: `${order.title} foi confirmado.`, action: 'OK', code: customer.code });
					if (Meteor.isServer)
						Meteor.setTimeout(() => Notifications.remove(id), NOTIFICATION_TIMEOUT);
				}
			} else {
				throw new Meteor.Error('cliente-nao-encontrado', `Cliente não encontrado: ${code}`);
			}
		}
	},
	'waiter'(code) {
		let customer;
		if (Meteor.isServer) {
			customer = Customers.findOne({ code: parseInt(code) });
		} else {
			customer = true;
		}
		if (customer) {
			if (!Orders.findOne({ code: customer.code, item: 'waiter', status: 'Solicitado' })) {
				Orders.insert({ code: customer.code, name: customer.name, table: customer.table, createdAt: new Date(), item: 'waiter', title: 'Garçom', price: 0, status: 'Solicitado' });
			}
			const id = Notifications.insert({ title: 'Garçom solicitado. Aguarde.', action: 'OK', code: customer.code});
			if (Meteor.isServer)
				Meteor.setTimeout(() => Notifications.remove(id), NOTIFICATION_TIMEOUT);
		} else {
			throw new Meteor.Error('cliente-nao-encontrado', `Cliente não encontrado: ${code}`);
		}
	},
	'saveCustomer'(data) {
		check(data, {
			code: Match.Where(x => x > 0),
			name: Match.Where(s => s !== ''),
			table: Number,
			people: Match.Where(x => x > 0),
			tickets: Match.Where(x => x >= 0),
			editing: Match.Any
		});

		if (data.editing) {
			let entriesOrder = Orders.findOne({ code: data.editing, item: 'entry' });
			let diffEntries = 0;
			if (entriesOrder) {
				Orders.update({ _id: entriesOrder._id }, { $set: { quantity: parseInt(data.tickets) }});
				diffEntries = (ENTRY_PRICE * data.tickets) - parseFloat(entriesOrder.price) * parseInt(entriesOrder.quantity);
			} else if (data.tickets > 0) {
				Orders.insert({ code: data.code, name: data.name, table: data.table, item: 'entry', title: 'Ingressos', price: ENTRY_PRICE, createdAt: new Date(), status: '', quantity: data.tickets });
				diffEntries = ENTRY_PRICE * data.tickets;
			}
			return Customers.update({ code: data.editing }, { $set: data, $inc: { total: diffEntries } });
		} else {
			if (Customers.findOne({ code: parseInt(data.code) })) {
				throw new Meteor.Error('codigo-existente', `O código já existe: ${data.code}`);
			}
			data.total = 0;
			data.createdAt = new Date();
			return Customers.insert(Object.assign(data, { total: ENTRY_PRICE * parseInt(data.tickets) })) && Orders.insert({ code: data.code, name: data.name, table: data.table, item: 'entry', title: 'Ingressos', price: ENTRY_PRICE, quantity: parseInt(data.tickets), createdAt: new Date(), status: '' });
		}
	},
	'deleteCustomer'(code) {
		return Customers.remove({ code: parseInt(code) }) && Orders.remove({ code: parseInt(code) });
	},
	'deleteOrder'(_id) {
		const order = Orders.findOne({_id});
		return Customers.update({ code: order.code }, { $inc: { total: order.price * order.quantity * -1 } }) && Orders.remove({ _id });
	},
	'closeCustomer'({ code, payType = 'money' }) {
		return Customers.update({ code: parseInt(code) }, { $set: { closed: true, payType } });
	},
	'getOrders'(code) {
		return Orders.find({ code: parseInt(code), item: {$ne: 'waiter'} }, { sort: { createdAt: 1 } }).fetch();
	},
	'cancelOrder'({ orderId, code, price }) {
		return Orders.update({ _id: orderId }, { $set: { status: 'Cancelado' }}) && Customers.update({ code: parseInt(code) }, { $inc: { total: price * -1 } })
	},
	'addItem'({ code, name, table, item, price, quantity }) {
		if (item && quantity > 0) {
			const objItem = Menu.findOne({name: item });
			const customer = Customers.findOne({ code: code });
			if (customer && objItem) {
				return Orders.insert({
					code: parseInt(code),
					name: customer.name,
					table: parseInt(customer.table),
					item: objItem.name,
					title: objItem.title,
					price: parseFloat(objItem.price),
					createdAt: new Date(),
					status: objItem.status[0],
					quantity: parseInt(quantity)
				}) && Customers.update({
					code: code
				}, { $inc: {
					total: parseFloat(objItem.price) * quantity
				}});
			} else if (Meteor.isServer) {
				throw new Meteor.Error('cliente-nao-encontrado', `Cliente não encontrado: ${code}`);
			}
		}
	},
	'moveOrder'(_id, direction) {
		const order = Orders.findOne({ _id });
		if (order) {
			if (order.item === 'waiter') {
				return Orders.update({ _id }, { $set: { status: order.status === 'Solicitado' ? 'Atendido' : 'Solicitado' } });
			}
			const item = Menu.findOne({ name: order.item })
			if (item) {
				const statusIndex = item.status.indexOf(order.status);
				const status = item.status[statusIndex + direction] || null;
				if (status) {
					Orders.update({ _id }, { $set: { status } });
					const id = Notifications.insert({ title: `${order.title} está ${status.toLowerCase()}`, action: 'OK', code: order.code });
					if (Meteor.isServer)
						Meteor.setTimeout(() => Notifications.remove(id), NOTIFICATION_TIMEOUT);
				} else {
					throw new Meteor.Error('Status inválido');
				}
			}
		}
	},
	'getTotalCustomers'() {
		const closed = Customers.find({ closed: true }, { fields: { _id: 1 } }).count();
		const total = Customers.find({}, { fields: { _id: 1 } }).count();
		return { total, closed , open: total - closed, perc: closed / total * 100 };
	}
})

if (Meteor.isServer) {
	Meteor.methods({
		'getTotalSales'() {
			return Customers.rawCollection().aggregate([{ $group: { _id: "$payType", sum: { $sum: "$total" } } } ]).toArray().then((res) => {
				let result = { total: 0, closed: 0, open: 0, percOpen: 0, percClosed: 0, money: 0, debit: 0, credit: 0, check: 0 };
				for (let i in res) {
					if (res[i]._id === null) {
						result.open = res[i].sum;
					} else {
						result.closed += res[i].sum;
						result[res[i]._id] += res[i].sum;
					}
				}
				result.total = result.closed + result.open;
				result.percOpen = result.open / result.total * 100;
				result.percClosed = result.closed / result.total * 100;
				return result;
			 })
		},

		'getTotalPeople'() {
			return Customers.rawCollection().aggregate({
				$group: {
					_id: '',
					people: { $sum: '$people' }
				}
			}, {
					$project: {
						_id: 0,
						people: '$people'
					}
				}
			).toArray().then((res) => {
				return res[0] && res[0].people;
			});
		},

		'getTotalOrders'() {
			return Orders.rawCollection().aggregate([{
				$match: {
					item: { $nin: ['entry', 'waiter'] }
				} },
				{ $group: {
					_id: '$title',
					count: { $sum: 1 }
				}
			}]).toArray().then((res) => {
				return res;
			});
		}
	})
}
