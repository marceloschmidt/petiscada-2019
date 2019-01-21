const ORDERS_PER_PAGE = 5;
Template.adminOrders.helpers({
	user: function () {
		return Meteor.user();
	},
	adding() {
		return Template.instance().adding.get();
	},
	orders() {
		let sort = Template.instance().sort.get();
		return Orders.find({}, { sort });
	},
	hasLess() {
		return Template.instance().skip.get() > 0;
	},
	hasMore() {
		return Template.instance().hasMore.get();
	},
});

Template.adminOrders.search = (instance) => {
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

Template.adminOrders.events({
	'click .new'(e, instance) {
		e.preventDefault();
		instance.adding.set(true);
		setTimeout(() => { $('#code').focus() }, 100);
	},

	'click .save-new'(e, instance) {
		e.preventDefault();
		Template.adminOrders.save(instance);
	},

	'click .cancel'(e, instance) {
		e.preventDefault();
		instance.adding.set(false);
	},

	'click .search'(e, instance) {
		e.preventDefault();
		Template.adminOrders.search(instance);
	},

	'keydown input'(e, instance) {
		if (e.keyCode === 13) {
			e.preventDefault();
			if (instance.adding.get()) {
				Template.adminOrders.save(instance);
			} else {
				Template.adminOrders.search(instance);
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
			instance.skip.set(instance.skip.get() + ORDERS_PER_PAGE);
		}
	},

	'click .page-prev'(e, instance) {
		const skip = instance.skip.get();
		if (skip > 0) {
			instance.skip.set(skip - ORDERS_PER_PAGE);
		}
	},

	'click .trash'(e, instance) {
		swal({
			title: 'Apagar este pedido?',
			text: 'Você não poderá voltar atrás',
			type: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sim, apagar!',
			cancelButtonText: 'Cancelar'
		}).then((result) => {
			if (result.value) {
				Meteor.call('deleteOrder', this._id);
			}
		})
	},
})

Template.adminOrders.save = (instance) => {
	const data = {
		code: parseInt($('#code').val()) || 0,
		item: $('#item').find('option:selected').attr('name'),
		quantity: 1
	}

	if (data.code < 1) {
		$('#code').addClass('error');
		setTimeout("$('#code').removeClass('error')", 3000);
		return;
	}

	if (data.item === '') {
		$('#item').addClass('error');
		setTimeout("$('#item').removeClass('error')", 3000);
		return;
	}

	Meteor.call('addItem', data, (err, success) => {
		if (err) {
			$('#code').addClass('error');
			setTimeout("$('#code').focus()", 500);
			setTimeout("$('#code').removeClass('error')", 3000);
			return;
		} else {
			instance.adding.set(false);
		}
	});
}

Template.adminOrders.onCreated(function () {
	this.adding = new ReactiveVar(false);
	this.sort = new ReactiveVar({ createdAt: -1 });
	this.skip = new ReactiveVar(0);
	this.hasMore = new ReactiveVar(true);
	this.filter = new ReactiveVar({});
	this.handler = null;

	Tracker.autorun(() => {
		if (this.handler) this.handler.stop();
		this.handler = this.subscribe('adminOrders', { filter: this.filter.get(), sort: this.sort.get(), skip: this.skip.get(), limit: ORDERS_PER_PAGE });
	});

	Tracker.autorun(() => {
		this.hasMore.set(Orders.find().count() === ORDERS_PER_PAGE);
	})
})
