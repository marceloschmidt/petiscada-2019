Template.admin.helpers({
	user() {
		return Meteor.user();
	},
	totalCustomers() {
		return Template.instance().totalCustomers.get();
	},
	totalSales() {
		return Template.instance().totalSales.get();
	},
	totalPeople() {
		return Template.instance().totalPeople.get();
	}
})

Template.admin.getTotalCustomers = (instance) => {
	Meteor.call('getTotalCustomers', (err, total) => {
		if (!err) {
			instance.totalCustomers.set(total);
		}
	})
}

Template.admin.getTotalSales = (instance) => {
	Meteor.call('getTotalSales', (err, sum) => {
		if (!err) {
			instance.totalSales.set(sum);
			c3.generate({
				bindto: '#chart-payments',
				data: {
					columns: [
						['Dinheiro', sum.money],
						['Débito', sum.debit],
						['Crédito', sum.credit],
						['Cheque', sum.check],
					],
					type: 'pie'
				}
			});
		}
	})
}

Template.admin.getTotalOrders = (instance) => {
	Meteor.call('getTotalOrders', (err, orders) => {
		if (!err) {
			let columns = [];
			for (order in orders) {
				columns.push([orders[order]._id, orders[order].count]);
			}
			c3.generate({
				bindto: '#chart-orders',
				data: {
					columns: columns,
					type: 'bar'
				}
			});
		}
	})
}

Template.admin.getTotalPeople = (instance) => {
	Meteor.call('getTotalPeople', (err, sum) => {
		if (!err) {
			instance.totalPeople.set(sum);
		}
	})
}

Template.admin.onCreated(function() {
	this.totalCustomers = new ReactiveVar({ total: 0, closed: 0, open: 0, perc: 0 });
	this.totalSales = new ReactiveVar({ closed: 0, open: 0, total: 0, percOpen: 0, percClosed: 0 });
	this.totalPeople = new ReactiveVar(0);
	this.intervals = [];
	Template.admin.getTotalCustomers(this);
	this.intervals.push(Meteor.setInterval(() => Template.admin.getTotalCustomers(this), 10000));
	Template.admin.getTotalSales(this);
	this.intervals.push(Meteor.setInterval(() => Template.admin.getTotalSales(this), 20000));
	Template.admin.getTotalPeople(this);
	this.intervals.push(Meteor.setInterval(() => Template.admin.getTotalPeople(this), 30000));
	Template.admin.getTotalOrders(this);
	this.intervals.push(Meteor.setInterval(() => Template.admin.getTotalOrders(this), 40000));
})

Template.admin.events({
	'click .login': function (e, instance) {
		e.preventDefault();
		Meteor.loginWithGoogle();
	},
	'click .logout': function (e, instance) {
		e.preventDefault();
		Meteor.logout();
	}
})

Template.admin.onDestroyed(function() {
	for (let i in this.intervals) {
		Meteor.clearInterval(this.intervals[i]);
	}
})
