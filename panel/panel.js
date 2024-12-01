const {createClient} = window.supabase

let sepaBasePassword = '-hfTRe!V7ETc!J9'

let selectedCategory

const supabseURL = 'https://alrtumkhlqpvtuuyhmcp.supabase.co'

const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscnR1bWtobHFwdnR1dXlobWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI2MDI2ODEsImV4cCI6MjA0ODE3ODY4MX0.sQCFWjSu8GsV4H_ETL5ksak0OevqaQC_geYEXOeZlsg'

const supabase = createClient(supabseURL , supabaseKey)

async function checkPassword(username , password , errorSpan) {
    
    let { data: auth, error } = await supabase.from('auth').select('*')
        
    if (error) {
        console.log('Error fetching Menu :' , error)
    }
    else {
        let isValid = false
        auth.forEach((user) => {
            if (user.username === username && user.password === password) {
                console.log('oke')
                isValid = true
            }
        })
        if (isValid) {
            errorSpan.textContent = 'حله'
            createWholePage()
            localStorage.setItem('u' , username)
            localStorage.setItem('p' , password)
            localStorage.setItem('@()*&^1234' , 'in the past used the cafe menu and logged in!')
        }
        else {
            errorSpan.textContent = 'یه چیزی رو اشتباه وارد کردی!'
        }
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

async function fetchCategories() {
    
    let { data: category, error } = await supabase.from('category').select('*')
        
    if (error) {
        console.log('Error fetching Category :' , error)
    }
    else {
        createMenuHeaders(category)
    }
}

async function addHeaderToDatabase (value) {
    loading(true)
    let {data, error} = await supabase.from('category').insert([{name : value}])

    if (error) {
        console.log('Error adding Category :' , error)
    }
    else {
        location.reload()
        removeOverlay()
    }
}

async function addItemToDatabase (name , price , desc , image) {
    loading(true)
    let imageUrl = ''
    if (image) {
        const imagePath = `menu-images/${Date.now()}-${image.name}`
        let {data , error} = await supabase.storage.from('menu-images').upload(imagePath , image)
        if (error) {
            console.log('Error adding item :' , error)
        }
        else {
            imageUrl = await supabase.storage.from('menu-images').getPublicUrl(imagePath).data.publicUrl
        }
    }
    let categoryId = selectedCategory.id
    let {data, error} = await supabase.from('menu').insert([{name : name , category_id: categoryId , price: price, desc : desc , img: imageUrl}])

    if (error) {
        console.log('Error adding item :' , error)
    }
    else {
        fetchMenu()
        loading(false)
        removeOverlay()
    }
}

async function editItemOnDatabse(name , price , desc ,img , id) {
    loading(true)

    let imageUrl = ''
    if (img) {
        const imagePath = `menu/${Date.now()}-${img.name}`
        let {data , error} = await supabase.storage.from('menu-images').upload(imagePath , img)
        if (error) {
            console.log('Error adding item :' , error)
        }
        else {
            imageUrl = await supabase.storage.from('menu-images').getPublicUrl(imagePath).data.publicUrl
        }
    }


    let categoryId = selectedCategory.id
    let updatedData = {name : name , category_id: categoryId , price: price, desc : desc , img: imageUrl}

    let {data, error} = await supabase.from('menu').update(updatedData).eq('id' , id)

    if (error) {
        console.log('Error editing item :' , error)
    }
    else {
        fetchMenu()
        loading(false)
        removeOverlay()
    }
}

async function removeHeaderFromDatabase (id) {
    let {data , error} = await supabase.from('category').delete().eq('id' , id)

    if (error) {
        console.log('Error deleting category :' , error)
    }
    else {
        removeItemsFromDatabase(id , true)
    }
}

async function removeItemsFromDatabase (id , isFromCategory) {
    loading(true)
    if (isFromCategory) {
        let {data , error} = await supabase.from('menu').delete().eq('category_id' , id)
        if (error) {
            console.log('Error deleting items :' , error)
        }
        else {
            location.reload()
            removeOverlay()
        }
    } else {
        let {data , error} = await supabase.from('menu').delete().eq('id' , id)
        if (error) {
            console.log('Error deleting item :' , error)
        }
        else {
            location.reload()
            removeOverlay()
        }
    }
}

const container = document.getElementById('container')

function ce (elem , className) {
	const e = document.createElement(elem)
	e.classList.add(className)

	return e
}

function loading (isLoading) {
    if (isLoading) {
        const overlay = createOverlay()
        
        const loadingDiv = ce('div' , 'loading')
        loadingDiv.textContent = 'LOADING...'
        overlay.append(loadingDiv)
    }
    else {
        removeOverlay()
    }
}

function createOverlay () {
    const overlay = ce('div' , 'overlay')
    document.body.append(overlay)
    overlay.addEventListener('click' , (e) => {
        if(e.target.classList.contains('overlay')) removeOverlay()
    })
    return overlay
}

function removeOverlay () {
    const overlay = document.querySelector('.overlay')
    if (overlay) overlay.remove()
}

function createWarning (id) {
    const warningDiv = ce('div' , 'warningContainer')

    const nopeBTN = ce('button' , 'nope-btn')
    nopeBTN.textContent = 'نه پاک نکن'
    nopeBTN.addEventListener('click' , removeOverlay)

    const sureBTN = ce('button' , 'sure-btn')
    sureBTN.textContent = 'پاک کن بره'
    sureBTN.addEventListener('click' , () => {
        console.log(id)
        if (id) removeItemsFromDatabase(id , false)
        else removeHeaderFromDatabase(selectedCategory.id)
    })

    warningDiv.append(nopeBTN)
    warningDiv.append(sureBTN)

    return warningDiv
}

function changeMenu (event , menu) {
	value = event.target.value

    if (value === 'یک عنوان انتخاب کن') {
        selectedCategory = ''
        if (document.querySelector('.menuItmes')) {
            document.querySelector('.menuItmes').remove()
        }
        return
    }

    menu.forEach((cate) => {
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

function createMenuHeaders(menu) {

    if (document.querySelector('.menuHeaders')) {
		document.querySelector('.menuHeaders').remove()
	}

	const mainDiv = ce('div' , 'menuHeaders')
    const select = ce('select' , 'selector')
	select.addEventListener('click' , () => {
        changeMenu(event , menu)
    })
    select.dir = 'rtl'

    let defaultValue =  ce('option' , 'menuOption')
    defaultValue.textContent = 'یک عنوان انتخاب کن'
    select.append(defaultValue)

	for (let header of menu) {
		const option = ce('option', 'menuOption')
		option.textContent = header.name

		select.append(option)
	}

    const addBTN = ce('button' , 'add-btn')
    addBTN.textContent = 'اضافه کردن عنوان'
    addBTN.addEventListener('click' , addHeader)

    const removeBTN = ce('button' , 'remove-btn')
    removeBTN.textContent = 'حذف عنوان'
    removeBTN.addEventListener('click' , removeCategory)

    mainDiv.append(removeBTN)
    mainDiv.append(select)
    mainDiv.append(addBTN)

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

    const addItemBTN = ce('button' , 'add-btn')
    addItemBTN.textContent = 'آیتم اضافه کن'
    addItemBTN.addEventListener('click' , addItem)

    mainDiv.append(addItemBTN)

    for (let item of items) {
        
        const itemDiv = ce('div', 'menuOneItem')
        itemDiv.classList.add('f-c')

        const image = ce('img', 'foodImage')
        if (item.img) {
            image.src = item.img
        }
        else {
            image.style.backgroundColor = '#f1f0ee'
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

        const buttonsDiv = ce('div' , 'buttonContainer')
        const editBTN = ce('button' , 'edit-btn')
        editBTN.textContent = 'ادیت کردن'
        editBTN.addEventListener('click' , () => {
            editItem(item.name , item.price , item.desc ,item.img, item.id)
        })

        const removeBTN = ce('button' , 'remove-btn')
        removeBTN.textContent = 'حذف کردن'
        removeBTN.addEventListener('click' , () => {
            removeItem(item.id)
        })

        buttonsDiv.append(editBTN)
        buttonsDiv.append(removeBTN)

		upperDiv.append(title)
		upperDiv.append(price)
		infoDiv.append(upperDiv)

		lowerDiv.append(desc)
		infoDiv.append(lowerDiv)

		itemDiv.append(image)
		itemDiv.append(infoDiv)
        itemDiv.append(buttonsDiv)
		mainDiv.append(itemDiv)
    }
	container.append(mainDiv)
}


function removeCategory () {
    if (selectedCategory) {
        const overlay = createOverlay()
        const warning = createWarning()
    
        overlay.append(warning)
    }
}

function removeItem (id) {
    const overlay = createOverlay()
    const warning = createWarning(id)

    overlay.append(warning)
}

function addItem () {
    const overlay = createOverlay()

    const container = ce('div' , 'inputsContainer')
    
    const nameInput = ce('input' , 'input')
    nameInput.type = 'text'
    nameInput.placeholder = 'اسم آیتم'
    nameInput.dir = 'rtl'
    nameInput.lang = 'fa'

    const priceInput = ce('input' , 'input')
    priceInput.type = 'text'
    priceInput.placeholder = 'قیمت'
    priceInput.dir = 'rtl'
    priceInput.lang = 'fa'

    const descInput = ce('input' , 'input')
    descInput.type = 'text'
    descInput.placeholder = 'توضیحات اگه داشته باشه'
    descInput.dir = 'rtl'
    descInput.lang = 'fa'

    const imageInput = ce('input' , 'input')
    imageInput.type = 'file'
    imageInput.id = 'imageUpload'

    const buttons = ce('div' , 'buttonContainer')
    
    const nopeBTN = ce('button' , 'nope-btn')
    nopeBTN.textContent = 'نه اضافه نکن'
    nopeBTN.addEventListener('click' , removeOverlay)

    const sureBTN = ce('button' , 'sure-btn')
    sureBTN.textContent = 'اضافه کن بره'
    sureBTN.addEventListener('click' ,() => {
        if (nameInput.value.length > 0 &&
            priceInput.value.length > 0
        ) {
            addItemToDatabase(nameInput.value , priceInput.value , descInput.value , imageInput.files[0])
        }
    })

    buttons.append(sureBTN)
    buttons.append(nopeBTN)

    container.append(nameInput)
    container.append(priceInput)
    container.append(descInput)
    container.append(imageInput)

    container.append(buttons)

    overlay.append(container)
}

function editItem (name , price , desc, img , id) {
    const overlay = createOverlay()

    const container = ce('div' , 'inputsContainer')
    
    const nameInput = ce('input' , 'input')
    nameInput.type = 'text'
    nameInput.value = name
    nameInput.dir = 'rtl'
    nameInput.lang = 'fa'

    const priceInput = ce('input' , 'input')
    priceInput.type = 'text'
    priceInput.value = price
    priceInput.dir = 'rtl'
    priceInput.lang = 'fa'

    const descInput = ce('input' , 'input')
    descInput.type = 'text'
    descInput.value = desc
    descInput.dir = 'rtl'
    descInput.lang = 'fa'

    const imageInput = ce('input' , 'input')
    imageInput.type = 'file'
    imageInput.id = 'imageUpload'

    const buttons = ce('div' , 'buttonContainer')
    
    const nopeBTN = ce('button' , 'nope-btn')
    nopeBTN.textContent = 'نه عوض نکن'
    nopeBTN.addEventListener('click' , removeOverlay)

    const sureBTN = ce('button' , 'sure-btn')
    sureBTN.textContent = 'عوض کن بره'
    sureBTN.addEventListener('click' , () => {
        if (nameInput.value.length > 0 &&
            priceInput.value.length > 0
        ) {
		let n = nameInput.value || name
		let p = priceInput.value || price
		let d = descInput.value || desc
		let i = imageInput.files[0] || img
            editItemOnDatabse(n , p , d , i , id)
        }
    })

    buttons.append(sureBTN)
    buttons.append(nopeBTN)

    container.append(nameInput)
    container.append(priceInput)
    container.append(descInput)
    container.append(imageInput)

    container.append(buttons)

    overlay.append(container)
}

function addHeader () {
    const overlay = createOverlay()

    const container = ce('div' , 'inputsContainer')
    
    const nameInput = ce('input' , 'input')
    nameInput.type = 'text'
    nameInput.dir = 'rtl'
    nameInput.lang = 'fa'

    const buttons = ce('div' , 'buttonContainer')
    
    const nopeBTN = ce('button' , 'nope-btn')
    nopeBTN.textContent = 'نه اضافه نکن'
    nopeBTN.addEventListener('click' , removeOverlay)

    const sureBTN = ce('button' , 'sure-btn')
    sureBTN.textContent = 'اضافه کن بره'
    sureBTN.addEventListener('click' , () => {
        if(nameInput.value.length > 0) {
            addHeaderToDatabase(nameInput.value)
        }
    })

    buttons.append(sureBTN)
    buttons.append(nopeBTN)

    container.append(nameInput)

    container.append(buttons)

    overlay.append(container)
}

function createWholePage(menu) {
    container.innerHTML = ''
    createLOGO()
    fetchCategories()
}


// for authinticating

function createLogin () {
    if (localStorage.getItem('u') && localStorage.getItem('p') && localStorage.getItem('@()*&^1234')) {
        createWholePage()
        return
    }
    const loginDiv = ce('div' , 'loginDiv')

    const span = ce('span' , 'loginspan')
    span.textContent = 'login to panel'

    const usernameInput = ce('input' , 'loginput')
    usernameInput.placeholder = 'username'
    
    const passwordInput = ce('input' , 'loginput')
    passwordInput.placeholder = 'password'

    const errorSpan = ce('span' , 'errorspan')

    const btnHolder = ce('div' , 'buttonContainer')

    const forgetBTN = ce('button' , 'nope-btn')
    forgetBTN.textContent = 'forget password?'
    forgetBTN.addEventListener('click' , () => {
        alert('be parham beghoo :DD')
    })

    const loginBTN = ce('button' , 'sure-btn')
    loginBTN.textContent = 'login'
    loginBTN.addEventListener('click' , () => {
        if (usernameInput.value.length > 0 &&
            passwordInput.value.length > 0
        )
        checkPassword(usernameInput.value , passwordInput.value , errorSpan)
    })

    loginDiv.append(span)
    loginDiv.append(usernameInput)
    loginDiv.append(passwordInput)
    loginDiv.append(errorSpan)

    btnHolder.append(loginBTN)
    btnHolder.append(forgetBTN)

    loginDiv.append(btnHolder)

    container.append(loginDiv)
    
}

createLogin()
