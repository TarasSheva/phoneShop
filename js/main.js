const menuBtn = document.querySelector('.menu-btn')
const closeMenuBtn = document.querySelector('.close-menu')
const menuDOM = document.querySelector('.menu')
const menuOverlay = document.querySelector('.menu-overlay')

const cartBtn = document.querySelector('.cart-btn')
const closeCartBtn = document.querySelector('.close-cart')
const clearCartBtn = document.querySelector('.clear-cart')
const cartDOM = document.querySelector('.cart')
const cartOverlay = document.querySelector('.cart-overlay')
const cartItems = document.querySelector('.cart-items')
const cartTotal = document.querySelector('.cart-total')
const cartContent = document.querySelector('.cart-content')
const productsDOM = document.querySelector('.products-center')

let cart = []
let buttonsDOM = []

class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json')
            let data = await result.json()
            let products = data.items
            products = products.map( item => {
                const {title,price} = item.fields
                const {id} = item.sys
                const image = item.fields.image.fields.file.url
                return {title, price, id, image}
            })
            return products
        } catch (error) {
            console.log(error);
        }
    }
}

class UI {
    darkMode() {
        let date = new Date().getHours()
        if (date > 18 || date < 6) {
            document.body.classList.toggle('dark-mode')
        }
        console.log(date);
    }

    displayProducts(products) {
        let result = ''
        products.forEach(product => {
            result += `
                <article class="product">
                    <div class="img-container">
                        <img src="${product.image}" alt="iphone1" class="product-img">
                        <button class="bag-btn" data-id="${product.id}">
                            <i class="fas fa-shopping-cart"></i>
                            add to cart
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
            `
        })
        productsDOM.innerHTML = result
    }
    getBagButtons() {        
        const buttons = [...document.querySelectorAll('.bag-btn')]
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id
            let inCart = cart.find(item => item.id === id)
            if (inCart) {
                button.innerText = 'In Cart'
                button.disabled = true
            } else {
                button.addEventListener('click', (e) => {
                    e.target.innerText = 'In Cart'
                    e.target.disabled = true

                    let cartItem = {...Storage.getProduct(id), amount: 1}
                    
                    cart = [...cart, cartItem]

                    Storage.saveCart(cart)

                    this.setCartValues(cart)

                    this.addCartItem(cartItem)

                    this.showCart()
                })
            }
        })
    }
    setCartValues(cart) {
        let tempTotal = 0
        let itemTotal = 0
        cart.map(item => {
            tempTotal += item.price * item.amount
            itemTotal += item.amount
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2))
        cartItems.innerText = itemTotal
    }
    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item')
        div.innerHTML = `
            <img src=${item.image} alt="iphone1">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>$${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>
        `
        cartContent.appendChild(div)
    }
    
    showMenu() {
        menuOverlay.classList.add('transparentBcg')
        menuDOM.classList.add('showCart')
    }
    hideMenu() {
        menuOverlay.classList.remove('transparentBcg')
        menuDOM.classList.remove('showCart')
    }
    showCart() { 
        cartOverlay.classList.add('transparentBcg')
        cartDOM.classList.add('showCart')
    }
    hideCart() {
        cartOverlay.classList.remove('transparentBcg')
        cartDOM.classList.remove('showCart')
    }
    setupApp() {
        cart = Storage.getCart()
        this.setCartValues(cart)
        this.populate(cart)
        cartBtn.addEventListener('click', this.showCart)
        closeCartBtn.addEventListener('click', this.hideCart)
        menuBtn.addEventListener('click', this.showMenu)
        closeMenuBtn.addEventListener('click', this.hideMenu)
        this.darkMode()
    }
    populate(cart) {
        cart.forEach(item => this.addCartItem(item))
    }
    cartLogic() {
        clearCartBtn.addEventListener('click', () => {
            this.clearCart()
        })
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target
                let id = removeItem.dataset.id
                cartContent.removeChild(removeItem.parentElement.parentElement)
                this.removeItem(id)
            } else if (event.target.classList.contains('fa-chevron-up')) {
                let addAmount = event.target
                let id = addAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                
                tempItem.amount = tempItem.amount + 1
                console.log(tempItem.amount);
                Storage.saveCart(cart)
                this.setCartValues(cart)
                addAmount.nextElementSibling.innerText = tempItem.amount
            } else if (event.target.classList.contains('fa-chevron-down')) {
                let lowerAmount = event.target
                let id = lowerAmount.dataset.id
                let tempItem = cart.find(item => item.id === id)
                tempItem.amount = tempItem.amount - 1
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart)
                    this.setCartValues(cart)
                    lowerAmount.previousElementSibling.innerText = tempItem.amount
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement)
                    this.removeItem(id)
                }             
            }
        })
    }
    clearCart() {
        let cartItems = cart.map(item => item.id)
        cartItems.forEach(id => this.removeItem(id))
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart()
    }
    removeItem(id) {
        cart = cart.filter(item => item.id !== id)
        this.setCartValues(cart)
        Storage.saveCart(cart)
        let button = this.getSingleButton(id)
        button.disabled = false
        button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id)
    }
}

class Storage {
    static saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'))
        return products.find(product => product.id === id)
    }
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : []
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const ui = new UI()
    const products = new Products()

    ui.setupApp()

    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products)
    }).then(() => {
        ui.getBagButtons()
        ui.cartLogic()
    })
    
})