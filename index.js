const {createClient} = window.supabase

let selectedCategory

const supabseURL = 'https://alrtumkhlqpvtuuyhmcp.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscnR1bWtobHFwdnR1dXlobWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MDI2ODEsImV4cCI6MjA0ODE3ODY4MX0.sQCFWjSu8GsV4H_ETL5ksak0OevqaQC_geYEXOeZlsg'

const supabase = createClient(supabseURL , supabaseKey)

async function fetchCategories() {
    
    let { data: category, error } = await supabase.from('category').select('*')
        
    if (error) {
        console.log('Error fetching Category :' , error)
    }
    else {
        createMenuHeaders(category)
    }
}

async function fetchMenu() {
    
    let { data: menu, error } = await supabase.from('menu').select('*').eq('category_id' , selectedCategory.id)
        
    if (error) {
        console.log('Error fetching Menu :' , error)
    }
    else {
        createMenuItems(menu)
    }
}

const container = document.getElementById('container')

function ce (elem , className) {
	const e = document.createElement(elem)
	e.classList.add(className)

	return e
}

function changeMenu (event , headers) {
	let value = event.target.dataset.info

	headers.forEach((cate) => {
        if (cate.name === value) {
            selectedCategory = cate
        }
    })

	fetchMenu()
}

function createLOGO () {
	const div = ce('div' , 'imageHoler')
	div.innerHTML = 'باغ </br> کافه'
	container.append(div)
}

function createMenuHeaders(headers) {
	const mainDiv = ce('div' , 'menuHeaders')
	mainDiv.addEventListener('click' , () => {
		changeMenu(event , headers)
	})
	for (let header of headers) {
		const div = ce('div', 'menuOneHeader')
		div.dataset.info = header.name

		const title = ce('span', 'menuTitle')
		title.textContent = header.name
		title.dataset.info = header.name

		div.append(title)

		mainDiv.append(div)
	}
	container.append(mainDiv)


	createLine()
}

function createLine () {
	const div = ce('div', 'line')

	container.append(div)
}

function createMenuItems (items) {
	if (document.querySelector('.menuItmes')) {
		document.querySelector('.menuItmes').remove()
	}
	const mainDiv = ce('div', 'menuItmes')
	
	items.forEach((item) => {
		const itemDiv = ce('div', 'menuOneItem')

		const image = ce('div', 'foodImage')
		if (item.img) {
			image.style.backgroundImage = `url(${item.img})`
		}

		const infoDiv = ce('div', 'menuOneItemInfo')

		const upperDiv = ce('div', 'menuOneItemInfoUpper')
		const title = ce('span' , 'foodTitle')
		title.textContent = item.name

		const price = ce('span' , 'footPrice')
		price.textContent = item.price

		const lowerDiv = ce('div' , 'menuOneItemInfoLower')
		const desc = ce('span' , 'foodDesc')
		desc.textContent = item.desc

		upperDiv.append(title)
		upperDiv.append(price)
		infoDiv.append(upperDiv)

		lowerDiv.append(desc)
		infoDiv.append(lowerDiv)

		if (item.img) {
			itemDiv.append(image)
		}
		itemDiv.append(infoDiv)

		mainDiv.append(itemDiv)
	})
	container.append(mainDiv)
}

function onStartPage () {
	createLOGO()
	fetchCategories()
}

onStartPage()