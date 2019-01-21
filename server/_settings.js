if (typeof Meteor.settings === 'undefined')
  Meteor.settings = {};

_.defaults(Meteor.settings, {});

Accounts.config({
	forbidClientAccountCreation: true
});

ServiceConfiguration.configurations.remove({
	service: 'google'
});

ServiceConfiguration.configurations.insert({
	service: 'google',
	clientId: '1035629989123-nestshlt5n0ugi89cclnvsqob7qf29li.apps.googleusercontent.com',
	secret: 'pmSWKqLCR_HiMSZxzCz2w6jX'
});

