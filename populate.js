CUSTOMERS = 150;

Meteor.methods({
	populate() {
		const foods = Menu.findOne().fetch();
		for (let i = 0; i < CUSTOMERS; i++) {
			const customer = {
				code: Math.ceil(Math.random() * 1000000),
				name: RandomName(),
				table: Math.ceil(Math.random() * 10),
				people: Math.ceil(Math.random() * 10),
				tickets: Math.ceil(Math.random() * 10),
				createdAt: new Date(),
				closed: _.sample([true,false]),
				payType: _.sample(['money', 'credit', 'debit', 'check'])
			};
			if (customer.people < customer.tickets) {
				customer.people = customer.tickets;
			}
			if (!customer.closed)
				delete customer.payType;
			customer.total = customer.tickets * 5;
			Orders.insert({
				code: customer.code,
				name: customer.name,
				table: customer.table,
				createdAt: new Date(),
				item: 'entry',
				title: 'Ingressos',
				price: 5,
				quantity: customer.tickets,
				status: ''
			});
			const numOrders = _.random(1,20);
			for (let j = 0; j < numOrders; j++) {
				const order = {
					code: customer.code,
					name: customer.name,
					table: customer.table,
					createdAt: new Date(),
					item: _.sample(['batatinha', 'pasteis', 'nachos', 'frios', 'cocacola', 'agua', 'guarana', 'agua-com-gas', 'limonada', 'cerveja', 'brownie-brigadeiro', 'brownie-doce-de-leite', 'brownie-sensacao']),
					title: 'Ingressos',
					price: 5,
					quantity: customer.tickets,
					status: ''
				};
				const item = _.sample(foods);
				order.title = item.title;
				order.price = item.price;
				order.quantity = _.random(1, 3);
				order.status = item.status[0];
				Orders.insert(order);
				customer.total += order.price;
			}
			Customers.insert(customer);
		}
	},

	reset() {
		Customers.remove({});
		Orders.remove({});
	}
})
