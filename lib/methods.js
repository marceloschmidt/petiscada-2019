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
					for (let i = 0; i < quantity; i++) {
						Orders.insert({ code: customer.code, name: customer.name, table: customer.table, item: order.name, title: order.title, price: order.price, createdAt: new Date(), status: order.status[0] });
					}
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
	'checkCode'(code) {
		let customer;
		if (Meteor.isServer) {
			customer = Customers.findOne({ code: parseInt(code) });
		} else {
			customer = true;
		}
		if (customer) {
			return true;
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
			editing: Match.Any
		});

		if (data.editing) {
			return Customers.update({ code: data.editing }, { $set: data });
		} else {
			if (Customers.findOne({ code: parseInt(data.code) })) {
				throw new Meteor.Error('codigo-existente', `O código já existe: ${data.code}`);
			}
			data.total = 0;
			data.createdAt = new Date();
			return Customers.insert(data);
		}
	},
	'deleteCustomer'(code) {
		return Customers.remove({ code: parseInt(code) }) && Orders.remove({ code: parseInt(code) });
	},
	'deleteOrder'(_id) {
		const order = Orders.findOne({_id});
		return Customers.update({ code: order.code }, { $inc: { total: order.price * -1 } }) && Orders.remove({ _id });
	},
	'closeCustomer'({ code, payType = 'money' }) {
		code = parseInt(code);
		return Customers.update({ code }, { $set: { closed: true, payType } }) && Orders.update({ code }, { $set: { closed: true } }, { multi: true });
	},
	'reopenCustomer'({ code }) {
		code = parseInt(code);
		return Customers.update({ code }, { $unset: { closed: 1, payType: 1 } }) && Orders.update({ code }, { $unset: { closed: 1 } }, { multi: true });
	},
	'getOrders'(code) {
		return Orders.find({ code: parseInt(code), item: {$ne: 'waiter'} }, { sort: { createdAt: 1 } }).fetch();
	},
	'cancelOrder'({ orderId, code, price }) {
		return Orders.update({ _id: orderId }, { $set: { status: 'Cancelado' }}) && Customers.update({ code: parseInt(code) }, { $inc: { total: price * -1 } })
	},
	'addItem'({ code, item, price, quantity, preorder }) {
		if (item && quantity > 0) {
			const customer = Customers.findOne({ code: code });
			if (customer) {
				if (item === 'entry') {
					price = preorder ? 0 : (price ? price : ENTRY_PRICE);
					for (let i = 0; i < quantity; i++) {
						Orders.insert({ code, name: customer.name, table: customer.table, item, title: 'Ingressos', price, createdAt: new Date(), status: '' })
					}
					return Customers.update({ code }, { $inc: { total: price * quantity } });
				} else {
					const objItem = Menu.findOne({name: item }) || { name: item, title: item, status: [ 'Fechamento' ] };
					price = preorder ? 0 : parseFloat(price || objItem.price);
					for (let i = 0; i < quantity; i++) {
						Orders.insert({
							code: parseInt(code),
							name: customer.name,
							table: parseInt(customer.table),
							item: objItem.name,
							title: objItem.title,
							price,
							createdAt: new Date(),
							status: preorder ? 'Pré-compra' : objItem.status[0]
						})
					}
					return Customers.update({
						code: code
					}, { $inc: {
						total: price * quantity
					}});
				}
			}

			if (Meteor.isServer) {
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
	'movePreorder'(_id) {
		const order = Orders.findOne({ _id });
		if (order && order.status === 'Pré-compra') {
			const item = Menu.findOne({ name: order.item })
			if (item) {
				const status = item.status[0];
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
