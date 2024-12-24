const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// cart items
let cart =  [];

let buttonsDOM = [];

// ! init contentful API
const client = contentful.createClient({
    space: 'ujgpm4wdqcpa',
    environment: 'master',
    accessToken: 'tibxEICMI3eNeyvspFQA8kaFaQRsRm6F2SfB1y6_bCo'
  })


// request products data
class Products{
    async getProducts(){
        try{
            // ! request products data from contentful
           const contentful = await client.getEntries({
                content_type: 'comfyHouseProject'
            })

            // ! request products data from local file
            // const results = await fetch('products.json');
            // const data = await results.json();

            let products = contentful.items;
            products = products.map(item => {
                const {price, title} = item.fields;
                const {id} = item.sys;
                const image = item.fields.image.fields.file.url;
                return {id, title, price, image};
            })
            return products;
        }catch(error){console.log(error)}
    }
}

// display products
class UI{
    displayProdusct(prodactsData){
        let results = ''
        prodactsData.forEach(data => {
            results += `
            <article class="product">
                <div class="img-container">
                    <img src=${data.image} alt="product" class="product-img">
                    <button class="bag-btn" data-id=${data.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to cart
                    </button>
                </div>
                <h3>${data.title}</h3>
                <h4>$${data.price}</h4>
            </article>
            `
        })

        productsDOM.innerHTML = results;
    }

    getAddToCartBtns(){
        const addToCartBtns = [...document.querySelectorAll('.bag-btn')];
        buttonsDOM = addToCartBtns;
        addToCartBtns.forEach(btn => {
            const id = btn.dataset.id;
            const inCart = cart.find(item => item.id === id);
            if(inCart){
                btn.innerText = 'In Cart';
                btn.disabled = true;
            }
            btn.addEventListener('click', e => {
                e.target.innerText = "In Cart";
                e.target.disabled = true;
                const cartItem = {...Storage.getProducts(id), amount: 1};
                cart = [...cart, cartItem];
                Storage.saveCart(cart);
                this.setCartValues(cart);
                this.addCartItem(cartItem);
                this.showCart();
            })
        })
    }

    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
    }

    addCartItem(item){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `
                <img src=${item.image} alt="product">
                <div>
                    <h4>${item.title}</h4>
                    <h5>$${item.price}</h5>
                    <span class="remove-item" data-id=${item.id}>remove</span>
                </div>
                <div>
                    <i class="fa-solid fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                    <i class="fa-solid fa-chevron-down" data-id=${item.id}></i>
                </div>
        `;

        cartContent.appendChild(div);
    }

    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }

    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    
    setupApp(){
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click', this.showCart);
        closeCartBtn.addEventListener('click', this.hideCart);
    }

    populateCart(cart){
        cart.forEach(item => this.addCartItem(item));
    }

    cartLogic(){
        clearCartBtn.addEventListener('click', () => {
            this.clearCart();
        });
        cartContent.addEventListener('click', e => {
            if(e.target.classList.contains('remove-item')){
                this.removeItem(e.target.dataset.id);
                e.target.parentElement.parentElement.remove();
            }else if(e.target.classList.contains('fa-chevron-up')){
                let tempItem = cart.find(item => item.id === e.target.dataset.id);
                tempItem.amount++
                Storage.saveCart(cart);
                this.setCartValues(cart);
                e.target.nextElementSibling.innerText = tempItem.amount;
            }else if(e.target.classList.contains('fa-chevron-down')){
                let tempItem = cart.find(item => item.id === e.target.dataset.id);
                tempItem.amount--
                Storage.saveCart(cart);
                this.setCartValues(cart);
                e.target.previousElementSibling.innerText = tempItem.amount;

                if(tempItem.amount <= 0){
                    e.target.parentElement.parentElement.remove();
                    this.removeItem(e.target.dataset.id);
                }
            }
        })
    }

    clearCart(){
        let cartItem = cart.map(item => item.id);
        cartItem.forEach(id => this.removeItem(id));
        while(cartContent.children.length > 0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }

    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>
                        add to cart`
    }

    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}

// store products in local storage
class Storage{
    static saveData(key, value){
        localStorage.setItem(key, JSON.stringify(value));
    }

    static saveCart(cart){
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    static getProducts(id){
        const products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    }

    static getCart(){
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
    }
}

document.addEventListener('DOMContentLoaded', (e) => {
    const ui = new UI();
    const products = new Products();

    products.getProducts()
    .then(data => {
        ui.setupApp();
        ui.displayProdusct(data)
        Storage.saveData("products", data);
    })
    .then(() => {
        ui.cartLogic();
        ui.getAddToCartBtns();
    })
})
