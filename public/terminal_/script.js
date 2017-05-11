var url = "http://localhost:3000";

$(document).ready(function () {
	getDishes();
	getOrderId();

	var orderItems = [];
	var totalPrice = 0;

	$('.menu').click(function(e){
		if(e.target.className != 'menu-list-item-addBtn') return;

		var obj = {};
		obj['name'] = e.target.parentNode.dataset.name;
		obj['price'] = e.target.parentNode.dataset.price;
		orderItems.push(obj);
		renderOrderItems();
	});

	$('.order-items').click(function(e){
		if(e.target.className != 'menu-list-item-delBtn') return;

		orderItems.splice(e.target.parentNode.dataset.id,1);
		renderOrderItems();
	});

	$('#nav-close-btn').click(function(e){
		closeOrder();
	})

	$('#nav-confirm-btn').click(function(e){
		confirmOrder();
	})

	function renderOrderItems(){
		var f = document.createDocumentFragment();

		for(var i =0; i<orderItems.length; i++){
			var div = document.createElement('div');
			div.className = "menu-list-item";
			div.dataset.price = orderItems[i].price;
			div.dataset.category = orderItems[i].category;
			div.dataset.name = orderItems[i].name;
			div.dataset.id = i;
			div.innerHTML = orderItems[i].name;
			var delBtn = document.createElement('div');
			delBtn.className = "menu-list-item-delBtn";
			div.appendChild(delBtn);
			var price = document.createElement('div');
			price.className = "menu-list-item-price";
			price.innerHTML = orderItems[i].price + " грн";
			div.appendChild(price);
			f.appendChild(div);
		}
		$('.order-items').html(f);
		renderTotalPrice();
	}

	function renderTotalPrice(){
		var sum = 0;
		for(var i =0; i<orderItems.length; i++){
			sum += +orderItems[i].price;
		}
		totalprice = sum;
		$('.nav-totalprice').html("К оплате: " + sum);
	}

	function createMenuList(ar){
		var f = document.createDocumentFragment();
		var cat = {};

		for(var i = 0; i<ar.length; i++){
			cat[ar[i].category] = null;
		}

		for(var j in cat){
			var div_header = document.createElement('div');
			div_header.className = "menu-list-header";
			div_header.innerHTML = j;
			f.appendChild(div_header);
			for(var i = 0; i<ar.length; i++){
				if(ar[i].category == j){
					f.appendChild(createMenuListItem(ar[i]));
				}
			}
		}	
		return f;
	}

	function createMenuListItem(item){
		var d = document.createElement('div');
		d.className = "menu-list-item";
		d.dataset.price = item.price;
		d.dataset.category = item.category;
		d.dataset.name = item.name;
		d.innerHTML = item.name;
		var addBtn = document.createElement('div');
		addBtn.className = "menu-list-item-addBtn";
		d.appendChild(addBtn);
		var price = document.createElement('div');
		price.className = "menu-list-item-price";
		price.innerHTML = item.price + " грн";
		d.appendChild(price);
		return d;
	}

	function obj_size(obj){
		var c=0;
		for(i in obj){
			c++;
		}
		return c;
	}

	function closeOrder(){
		orderItems = [];
		renderOrderItems();
	}

	function confirmOrder(){
		console.log($('#table-id').val());
		if(orderItems.length <= 0) return;
		var msg = "table=orders&id_employer=" + ($('#table-waiter-id').val() || 5) + "&price=" + totalprice +"&id_table=" + ($('#table-id').val() || 3); 
		$.ajax({
			type: "POST",
			data: msg,
			url: url + "/api/addRow",
			success: function(s){
				closeOrder();
				getOrderId();
			}
		});
	}

	function getOrderId(){
		$.ajax({
			type: 'GET',
			url: '/order-id',
			success: function (s) {
				$('.order-label').html('Заказ № ' + s.Auto_increment);
			}
		});
	}

	function getDishes(){
		$.ajax({
			method: 'GET',
			url: '/dishes',
			success: function (s) {
				$('.menu').append(createMenuList(s));
			}
		});
	}

});