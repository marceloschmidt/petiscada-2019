const CUSTOMERS_PER_PAGE = 5;
Template.adminCustomers.helpers({
	user: function () {
		return Meteor.user();
	},
	customers() {
		let sort = Template.instance().sort.get();
		return Customers.find({}, { sort });
	},
	adding() {
		return Template.instance().adding.get();
	},
	hasLess() {
		return Template.instance().skip.get() > 0;
	},
	hasMore() {
		return Template.instance().hasMore.get();
	},
	customer() {
		let customer = Customers.findOne({ code: Template.instance().editing.get() || 0 });
		return customer;
	},
	closeCustomer() {
		return Customers.findOne({ code: parseInt(Template.instance().closeCustomer.get()) })
	},
	invoiceOrders() {
		let orders = Template.instance().closeCustomerOrders.get();
		orders = orders.reduce((orders, order) => {
			if (orders && orders[order.item + order.price]) {
				orders[order.item + order.price].quantity++;
				orders[order.item + order.price].subtotal += order.price;
			} else {
				orders[order.item + order.price] = { title: order.title, quantity: 1, price: order.price, subtotal: order.price }
			}
			return orders;
		}, {});
		return Object.values(orders);
	},
	closeCustomerTotal() {
		const customer = Customers.findOne({ code: parseInt(Template.instance().closeCustomer.get()) });
		const newOrder = Template.instance().newOrder.get();
		let newOrderTotal = 0;
		if (newOrder) {
			newOrderTotal = (newOrder.quantity || 1) * (newOrder.price || 0);
		}
		return customer && (customer.total + newOrderTotal);
	},
	add1(index) {
		return index + 1;
	},
	newOrderTotal() {
		const newOrder = Template.instance().newOrder.get();
		if (newOrder) {
			return (newOrder.quantity || 1) * (newOrder.price || 0);
		}
	}
});

Template.adminCustomers.save = (instance) => {
	const data = {
		code: parseInt(instance.find('#code').value) || 0,
		name: instance.find('#name').value,
		table: parseInt(instance.find('#table').value) || 0,
		people: parseInt(instance.find('#people').value) || 0,
		editing: instance.editing.get()
	}

	if (data.code < 1) {
		$('#code').addClass('error');
		setTimeout("$('#code').removeClass('error')", 3000);
		return;
	}

	if (data.name === '') {
		$('#name').addClass('error');
		setTimeout("$('#name').removeClass('error')", 3000);
		return;
	}

	if (data.people < 1) {
		$('#people').addClass('error');
		setTimeout("$('#people').removeClass('error')", 3000);
		return;
	}

	Meteor.call('saveCustomer', data, (err) => {
		if (err) {
			$('#code').addClass('error');
			setTimeout("$('#code').focus()", 500);
			setTimeout("$('#code').removeClass('error')", 3000);
			return;
		} else {
			instance.adding.set(false);
			instance.editing.set(null);
		}
	});
}

Template.adminCustomers.search = (instance) => {
	const code = parseInt(instance.find('#filterCode').value) || 0;
	const name = instance.find('#filterName').value;
	const filter = {};
	if (code > 0) {
		filter.code = code;
	}
	if (name !== '') {
		filter.name = new RegExp(name, 'i');
	}
	instance.filter.set(filter);
}

Template.adminCustomers.events({
	'click .edit'(e, instance) {
		e.preventDefault();
		instance.adding.set(true);
		instance.editing.set(this.code);
		setTimeout("$('#code').focus()", 100);
	},

	'click .new'(e, instance) {
		e.preventDefault();
		instance.adding.set(true);
		setTimeout(() => { $('#code').focus() }, 100);
	},

	'click .save-new'(e, instance) {
		e.preventDefault();
		Template.adminCustomers.save(instance);
	},

	'click .cancel'(e, instance) {
		e.preventDefault();
		instance.adding.set(false);
		instance.editing.set(null);
	},

	'click .search'(e, instance) {
		e.preventDefault();
		Template.adminCustomers.search(instance);
	},

	'keydown input'(e, instance) {
		if (e.keyCode === 13) {
			e.preventDefault();
			if (instance.adding.get()) {
				Template.adminCustomers.save(instance);
			} else {
				Template.adminCustomers.search(instance);
			}
		}
	},

	'change .sort'(e, instance) {
		let sort = $(e.target).val();
		let sortDirection;
		[sort, sortDirection] = sort.split(':');
		instance.sort.set({ [sort]: parseInt(sortDirection) });
	},

	'click .page-next'(e, instance) {
		if (instance.hasMore.get()) {
			instance.skip.set(instance.skip.get() + CUSTOMERS_PER_PAGE);
		}
	},

	'click .page-prev'(e, instance) {
		const skip = instance.skip.get();
		if (skip > 0) {
			instance.skip.set(skip - CUSTOMERS_PER_PAGE);
		}
	},

	'click .trash'(e, instance) {
		swal({
			title: 'Apagar este cliente?',
			text: 'Você não poderá voltar atrás',
			type: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sim, apagar!',
			cancelButtonText: 'Cancelar'
		}).then((result) => {
			if (result.value) {
				Meteor.call('deleteCustomer', this.code);
			}
		})
	},

	'click .pay'(e, instance) {
		$('#closeCustomerModal').modal('show');
		instance.closeCustomer.set(this.code);
		instance.closeCustomerLoading.set(true);
		Meteor.call('getOrders', this.code, (err, data) => {
			instance.closeCustomerLoading.set(false);
			instance.closeCustomerOrders.set(data);
		});
	},

	'click .do-pay'(e, instance) {
		e.preventDefault();
		const code = instance.closeCustomer.get();
		let payType = 'money';
		if ($(e.currentTarget).hasClass('check-confirm')) {
			payType = 'check';
		} else if ($(e.currentTarget).hasClass('debit-confirm')) {
			payType = 'debit';
		} else if ($(e.currentTarget).hasClass('credit-confirm')) {
			payType = 'credit';
		}
		const newOrder = instance.newOrder.get();
		let newOrderTotal = 0;
		if (newOrder) {
			newOrderTotal = (newOrder.quantity || 1) * (newOrder.price || 0);
		}
		if (newOrderTotal !== 0) {
			Meteor.call('addItem', { code, item: newOrder.item, quantity: parseInt(newOrder.quantity), price: parseFloat(newOrder.price) }, (err) => {
				if (!err) {
					Meteor.call('closeCustomer', { code, payType }, () => {
						instance.newOrder.set({});
						$('#closeCustomerModal input').val('');
						$('#closeCustomerModal').modal('hide');
					});
				}
			})
		} else {
			Meteor.call('closeCustomer', { code, payType }, () => {
				$('#closeCustomerModal input').val('');
				$('#closeCustomerModal').modal('hide');
				instance.newOrder.set({});
			});
		}
	},

	'click .reopen'(e, instance) {
		e.preventDefault();
		const code = instance.closeCustomer.get();
		Meteor.call('reopenCustomer', { code }, () => {
			$('#closeCustomerModal input').val('');
			$('#closeCustomerModal').modal('hide');
			instance.newOrder.set({});
		});
	},

	'click .add-item'(e, instance) {
		e.preventDefault();
		const code = this.code;
		const name = this.name;
		const table = this.table;
		const div = document.createElement('div');
		const component = UI.render(Template['addItem'], div);
		UI.insert(component, div);
		swal({
			html: div.innerHTML,
			showCloseButton: true,
			showCancelButton: true,
			confirmButtonText: '<i class="fa fa-thumbs-up"></i> Adicionar',
			cancelButtonText: '<i class="fa fa-thumbs-down"></i> Cancelar',
		}).then((result) => {
			if (result.value) {
				Meteor.call('addItem', { item: $('#itemName').val(), price: $('#itemPrice').val(), code, name, table });
			}
		});
		setTimeout(() => { $('#itemName').focus(), 500 });
	},

	'blur .new-order-price'(e, instance) {
		const item = $('.new-order-item').val();
		const quantity = $('.new-order-quantity').val();
		const price = $('.new-order-price').val();
		instance.newOrder.set({ item, quantity, price });
	},
})

Template.adminCustomers.onCreated(function () {
	this.adding = new ReactiveVar(false);
	this.editing = new ReactiveVar(null);
	this.sort = new ReactiveVar({ createdAt: -1 });
	this.skip = new ReactiveVar(0);
	this.hasMore = new ReactiveVar(true);
	this.filter = new ReactiveVar({});
	this.closeCustomer = new ReactiveVar();
	this.closeCustomerLoading = new ReactiveVar(false);
	this.closeCustomerOrders = new ReactiveVar([]);
	this.newOrder = new ReactiveVar({});
	this.handler = null;

	Tracker.autorun(() => {
		if (this.handler) this.handler.stop();
		this.handler = this.subscribe('adminCustomers', { filter: this.filter.get(), sort: this.sort.get(), skip: this.skip.get(), limit: CUSTOMERS_PER_PAGE });
	});

	Tracker.autorun(() => {
		this.hasMore.set(Customers.find().count() === CUSTOMERS_PER_PAGE);
	})
})
