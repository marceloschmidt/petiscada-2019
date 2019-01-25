Meteor.methods({
	populate_items() {
		const items = [{
				"title": "Brownie Brigadeiro",
				"price": 4,
				"name": "brownie-brigadeiro",
				"excerpt": "Brownie com recheio de brigadeiro",
				"status": ["Aguardando entrega", "Entregue"],
				"type": "desserts"
			}, {
				"title": "Brownie Doce de Leite",
				"price": 4,
				"name": "brownie-doce-de-leite",
				"excerpt": "Brownie com recheio de doce de leite",
				"status": ["Aguardando entrega", "Entregue"],
				"type": "desserts"
			}, {
				"title": "Brownie Sensação",
				"price": 4,
				"name": "brownie-sensacao",
				"excerpt": "Brownie com recheio de morango",
				"status": ["Aguardando entrega", "Entregue"],
				"type": "desserts"
			}, {
				"title": "Coca-Cola",
				"price": 4,
				"name": "cocacola",
				"excerpt": "Coca-Cola Lata",
				"size": "350ml",
				"status": ["Aguardando entrega", "Entregue"],
				"type": "drinks"
			}, {
				"title": "Guaraná",
				"price": 4,
				"name": "guarana",
				"excerpt": "Guaraná Antarctica Lata",
				"size": "350ml",
				"status": ["Aguardando entrega", "Entregue"],
				"type": "drinks"
			}, {
				"title": "Água",
				"price": 3,
				"name": "agua",
				"excerpt": "Água sem gás",
				"size": "500ml",
				"status": ["Aguardando entrega", "Entregue"],
				"type": "drinks"
			}, {
				"title": "Água com Gás",
				"price": 3,
				"name": "agua-com-gas",
				"excerpt": "Água com gás",
				"size": "500ml",
				"status": ["Aguardando entrega", "Entregue"],
				"type": "drinks"
			}, {
				"title": "Limonada Natural",
				"price": 4,
				"name": "limonada",
				"excerpt": "Deliciosa limonada feita na hora",
				"size": "300ml",
				"status": ["Confirmado", "Em produção", "Entregue"],
				"type": "drinks"
			}, {
				"title": "Cerveja",
				"price": 5,
				"name": "cerveja",
				"excerpt": "Cerveja Bud Latinha",
				"size": "350ml",
				"status": ["Aguardando entrega", "Entregue"],
				"type": "drinks"
			}, {
				"title": "Batata Frita",
				"price": 8,
				"name": "batatinha",
				"excerpt": "Batatinhas fritas na hora. Máxima crocância.",
				"status": ["Confirmado", "Em produção", "Aguardando entrega", "Entregue"],
				"type": "foods"
			}, {
				"title": "Pasteis",
				"price": 8,
				"name": "pasteis",
				"excerpt": "6 deliciosos pasteis fritinhos na hora, 3 de queijo e 3 de carne.",
				"status": ["Confirmado", "Em produção", "Aguardando entrega", "Entregue"],
				"type": "foods"
			}, {
				"title": "Nachos",
				"price": 12,
				"name": "nachos",
				"excerpt": "Porção de nachos crocantes acompanhados de molho guacamole e sour cream.",
				"status": ["Confirmado", "Em produção", "Aguardando entrega", "Entregue"],
				"type": "foods"
			}, {
				"title": "Tábua de Frios",
				"price": 12,
				"name": "frios",
				"excerpt": "Queijos, salames, ovos de codorna, pepinos e azeitonas.",
				"status": ["Confirmado", "Em produção", "Aguardando entrega", "Entregue"],
				"type": "foods"
			}];

		for (const item of items) {
			Recipes.insert(item);
		}
	},

	reset_items() {
		Recipes.remove({});
	}
})
