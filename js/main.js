gsap.registerPlugin(ScrollTrigger)

document.querySelector('#btn').addEventListener('click',() => {
    getRecipe();
    removeHidden();
});

//This uses event delegation to target each anchor text when clicked
document.querySelector('#recipeTitleContainer').addEventListener('click', event => {
    if (event.target.className === 'recipeTitles') {
        showRecipe(event.target.id);
  }
});

//This event listener triggers when a select option is chosen and reorders the recipes
document.querySelector('#orderSelector').addEventListener('change', () => {
    changeRecipeOrder(event);
});

//Including missingIngredientsArray here because at the moment the I need access to 'data' and it ceases to exist after getRecipe to run, so I'm making it global 
let missingIngredientsArray = [];
// This will be pushed to from the  showRecipe() function
let recipeArray = [];

function getRecipe(){
    
    let ingredients = document.querySelector('#ingredient').value


    //Url of spoonacular api, with authentication key(got by making an account). Type in ingredients to get an Array of Recipe titles
    let url =`https://api.spoonacular.com/recipes/complexSearch?&apiKey=e7a6944d818f4661b9a9898bbd4bac4b&includeIngredients=${ingredients}&addRecipeInformation=true&instructionsRequired=true&number=20&fillIngredients=true&addRecipeNutrition=true`
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            console.log(data) //get the response(array) of the api
            console.log(data.results.length) //title of the first recipe
            //Add the the array of recipe objects to the global variable for access later
            recipeArray = data.results;
            console.log(`recipe array before ${recipeArray}`)
            //sort the recipes by least to most missing ingredients
            recipeArray = recipeArray.sort((a,b) => a.missedIngredientCount - b.missedIngredientCount)

            console.log(`recipe array after ${recipeArray}`)
            //This is a function that wraps the titles of the returned recipes in <h2> and <a> tags to input into the dom
            let recipeTitles = function(){
                return recipeArray.map((el, i) => `<div class="recipeContainer"><h2><a href="#" class="recipeTitles" id="${el.id}">${el.title}</a> -- ${el.missedIngredientCount} ingredient${el.missedIngredientCount > 1 ? 's' : ''} missing</h2><button type='button' class='addFav material-symbols-outlined'>star</button></div>`).join('')
            }
            
            document.querySelector('#recipeTitleContainer').innerHTML = recipeTitles()
           
            //This triggers the opacity of the recipe title list to go to 1, it has to be here, 
            //because the elements need to exist first

            gsap.from("#recipeTitleContainer h2", {
                opacity: 0,
                duration: 1,
                stagger:.1
              });
                
            getClickedFav()
            markFavStar(recipeArray)
            })
            .catch(err => {
                console.log(`error ${err}`)
            });
}

function showRecipe(id) {
    //Remove the hiddenRecipe tag from the relevant h2s so they show in the DOM
    removeHiddenResponsive()
    console.log(id)

    //Extract the recipe object from the main array
    let targetRecipe = recipeArray.find(item => item.id == id)
    console.log(`targetRecipe ${targetRecipe}`)
    //Add the image of the target recipe to the DOM
    document.querySelector('img').src = targetRecipe.image;
    //Extract the list of missing ingredients form the target recipe and wrap them in li tags
    let ingredientsList = targetRecipe.extendedIngredients.map(el => el = `<li>${el.name}</li>`).join('');
    //
    console.log(`ingredientsList ${ingredientsList}`)
    //insert the missing ingredients into the DOM
    document.querySelector('#ingredientsList').innerHTML = ingredientsList;
    //Add the recipe title to the DOM
    document.querySelector('#recipeTitle').innerHTML = `${targetRecipe.title}`
    let recipeInstructions = targetRecipe.analyzedInstructions[0].steps.map(el => `<li>${el.number}: ${el.step}</li>`).join('')
    document.querySelector('#recipeInstructions').innerHTML = recipeInstructions;
    
}


document.querySelector('#imgSearch').addEventListener('click',analyzeImage)
let imageUrl = `https://cdn.discordapp.com/attachments/478331515093385237/1032250668322390036/unknown.png`
let imageUrlFetch = `https://api.spoonacular.com/food/images/analyze?apiKey=2d7e0ded8af74b1897224317ce6c662c&imageUrl=${imageUrl}`
 function analyzeImage(){
    fetch(imageUrlFetch)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            console.log(data) //get the response(array) of the api
            

            
            
        

                
                
            })
            .catch(err => {
                console.log(`error ${err}`)
            });
}


function removeHidden() {
    let hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach(el => {
        el.classList.remove('hidden')
    });
}

function removeHiddenResponsive() {
    let hiddenElements = document.querySelectorAll('.hiddenResponsive');
    hiddenElements.forEach(el => {
        el.classList.remove('hiddenResponsive')
    });
}

function changeRecipeOrder(event) {
    //This reorders the recipes to go from least to most missing ingredients and adds the number of missing ingredients in the text
    if (event.target.value == 'sortMissingIngredients') {
        recipeArray = recipeArray.sort((a,b) => a.missedIngredientCount - b.missedIngredientCount)
        let recipeTitles = function(){
            
            return recipeArray.map((el, i) =>  `<div class="recipeContainer"><h2><a href="#" class="recipeTitles" id="${el.id}">${el.title}</a> -- ${el.missedIngredientCount} ingredient${el.missedIngredientCount > 1 ? 's' : ''} missing</h2><button type='button' class='addFav material-symbols-outlined'>star</button></div>`).join('')
            
        }
        document.querySelector('#recipeTitleContainer').innerHTML = recipeTitles()
    //This reorders the recipes from least to most price per serving and adds text about the price per serving rounded to two digits
    } else if (event.target.value == 'sortPricePerServing'){
        recipeArray = recipeArray.sort((a,b) => a.pricePerServing - b.pricePerServing)
        let recipeTitles = function(){
            
            return recipeArray.map((el, i) => `<div class="recipeContainer"><h2><a href="#" class="recipeTitles" id="${el.id}">${el.title}</a> -- Price Per Serving: $${(el.pricePerServing / 100).toFixed(2)}</h2><button type='button' class='addFav material-symbols-outlined'>star</button></div>`).join('')

        }
        document.querySelector('#recipeTitleContainer').innerHTML = recipeTitles()
        
    //THis reorders the recipes from most to least protein
    } else if (event.target.value == 'sortProtein') {
        
        recipeArray = recipeArray.sort((a,b) => b.nutrition.nutrients[8].amount - a.nutrition.nutrients[8].amount)
        let recipeTitles = function(){
            
            return recipeArray.map((el, i) => `<div class="recipeContainer"><h2><a href="#" class="recipeTitles" id="${el.id}">${el.title}</a> -- Protein: ${(el.nutrition.nutrients[8].amount).toFixed(2)}g</h2><button type='button' class='addFav material-symbols-outlined'>star</button></div>`).join('')

        }
        document.querySelector('#recipeTitleContainer').innerHTML = recipeTitles()
    } else if (event.target.value == 'sortCarbs') {
        
        recipeArray = recipeArray.sort((a,b) => a.nutrition.nutrients[3].amount - b.nutrition.nutrients[3].amount)
        let recipeTitles = function(){
            
            return recipeArray.map((el, i) => `<div class="recipeContainer"><h2><a href="#" class="recipeTitles" id="${el.id}">${el.title}</a> -- Carbohydrates: ${(el.nutrition.nutrients[3].amount).toFixed(2)}g</h2><button type='button' class='addFav material-symbols-outlined'>star</button></div>`).join('')
            
        }
        document.querySelector('#recipeTitleContainer').innerHTML = recipeTitles()
    } else if (event.target.value == 'sortCalories') {
        
        recipeArray = recipeArray.sort((a,b) => a.nutrition.nutrients[0].amount - b.nutrition.nutrients[0].amount)
        let recipeTitles = function(){
            
            return recipeArray.map((el, i) => `<div class="recipeContainer"><h2><a href="#" class="recipeTitles" id="${el.id}">${el.title}</a> -- Calories: ${(el.nutrition.nutrients[0].amount).toFixed(0)}kcal</h2><button type='button' class='addFav material-symbols-outlined'>star</button></div>`).join('')
            
        }
        document.querySelector('#recipeTitleContainer').innerHTML = recipeTitles()
    }
    markFavStar(recipeArray)
    getClickedFav()
}


//this lowers whatever is selected by 20 pixels over 3 seconds and bounces it at the end
gsap.to('#searchSection', {
    duration: 3, 
    y: 20,
    ease: "elastic.out(1.9, 0.3)",
    // This stagger is messing up the layout atm
    stagger: 0.2,

})
//This fades the background image to a darker color over 3 seconds
gsap.to('#searchBackgroundImage', {duration: 3, backgroundColor: 'rgba(0,0,0,0.7)'})
//This changes all the font color in the searchSection to white
gsap.to('#searchSection', {duration: 3, color: 'white'})
//This is to change all the backgounds of the boxs form transparent to white
gsap.to('button', {duration: 3, backgroundColor: 'white'})
gsap.to('select', {duration: 3, backgroundColor: 'white'})
gsap.to('input', {duration: 3, backgroundColor: 'white'})


//this timeline might be completely unecessary with the current setup
// const timeline = gsap.timeline({
    
//     paused: true
// });


//this function reduces the opacity of the text in the top section as you scroll down the screen

function init() {

        gsap.to('#searchSectionBody', {opacity: 0, scrollTrigger: {
            trigger: '#searchBackgroundImage',
            start: 'top top-=150',
            end: 'bottom center',
            scrub: true,
            
            
        }});
        gsap.set('#recipeDetails', {scrollTrigger: {
            trigger: '#recipeDetails',
            start: 'top bottom-=20%',
            toggleClass: 'active',
            // markers: true
        }})

}

window.addEventListener('load', function() {
    init();
})

//slide in code

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        } else {
            entry.target.classList.remove('show');
        }
    });
});

const hiddenElements = document.querySelectorAll('.hiddenLeft');
hiddenElements.forEach((el) => observer.observe(el));




// ---------- ADD TO FAVOURITES --------------- // 

// when ingredients are searched a button is created for each recipe to add to favourites
function getClickedFav(){
    const addFavButtons = document.querySelectorAll('.addFav')
        addFavButtons.forEach(favBtn => {
            favBtn.addEventListener('click', function handleClick(event) {
                let recipeId = event.target.previousElementSibling.firstChild.id
                let recipeName = event.target.previousElementSibling.firstChild.textContent
                let fillStar = event.target.classList.add('fillStar')
                addFavRecipe(recipeId, recipeName)
         })
    });
}

// Fetch's favourite recipe from API using the id
function fetchFavRecipe(id){
    
    //Url of spoonacular api, with authentication key(got by making an account). id from clicking on fav element.
    let url =`https://api.spoonacular.com/recipes/${id}/information?apiKey=e7a6944d818f4661b9a9898bbd4bac4b`
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            console.log(data) //gets the recipe object data
            // Makes recipe container titles appear
            removeHiddenResponsive()
            document.querySelector('#recipeTitle').innerHTML = data.title
            document.querySelector('img').src = data.image;

            // creates list of ingredients
            let ingredientsList = data.extendedIngredients.map(el => el = `<li>${el.name}</li>`).join('');
            document.querySelector('#ingredientsList').innerHTML = ingredientsList;

            // creates instructions for recipe
            let recipeInstructions = data.analyzedInstructions[0].steps.map(el => `<li>${el.number}: ${el.step}</li>`).join('')
            document.querySelector('#recipeInstructions').innerHTML = recipeInstructions;
                       
            })
            .catch(err => {
                console.log(`error ${err}`)
            });
}


// Clear favourite recipes from local storage
function clearAllFavRecipe() {
    localStorage.clear()
    document.querySelector('#favList').textContent = "No favourites selected"
    document.querySelectorAll('.fillStar').forEach(el => el.classList.remove('fillStar'))
}

// clear individual recipe from favs including star fill
function clearSingleFavRecipe(id) {
    let stringId = id.toString()
    let favRecipeArr = JSON.parse(localStorage.getItem('favRecipe'))
    let removed = favRecipeArr.filter(item => item.id !== stringId)
    localStorage.setItem('favRecipe', JSON.stringify(removed))
    event.target.parentElement.remove()
    let element = document.getElementById(id)
    let starFill = element.parentElement.nextSibling.classList.remove('fillStar')
}

// Adds favourite recipe to local storage
function addFavRecipe(recipeId, recipeName) {
    let favRecipeArr = JSON.parse(localStorage.getItem('favRecipe') || "[]")
    console.log(favRecipeArr)
    // create array if no fav recipes exist yet
    if (favRecipeArr === null || favRecipeArr.length === 0) {
        let favArr = []
        document.querySelector('#favList').textContent = ""
        favArr.push({id:recipeId, title: recipeName})
        localStorage.setItem('favRecipe', JSON.stringify(favArr))
        addSingleRecipe()
    } else {
        // checks to see if recipe is already in favs, if not then add
        if(!favRecipeArr.find(el => el.id === recipeId)) {
            favRecipeArr.push({id:recipeId, title: recipeName})
            localStorage.setItem('favRecipe', JSON.stringify(favRecipeArr))
            addSingleRecipe()
        } else {
            alert("Recipe is already in your favourites")
        }
    }
}


// Loads all fav recipes on to the page
function getAllFavRecipe() {
    let getFav = JSON.parse(localStorage.getItem('favRecipe') || "[]")
    if (getFav !== null || getFav !== [] )
        getFav.forEach(item => {
            let favUl = document.querySelector('#favList')
            let favLi = document.createElement("li")
            favLi.classList.add('favRecipe')
            favUl.appendChild(favLi)
                
            favLi.innerHTML += `<a href="#" onclick="fetchFavRecipe(${item.id})" id="${item.id}" class="recipeTitles fav">${item.title}</a><span class="material-symbols-outlined" onclick="clearSingleFavRecipe(${item.id})">delete</span>`
        })
}

// runs on page load/refresh
getAllFavRecipe()

// Adds single recipe to the page
function addSingleRecipe() {
    let getFav = JSON.parse(localStorage.getItem('favRecipe'))
    let newRecipe = getFav.at(-1)
    let favUl = document.querySelector('#favList')
    let favLi = document.createElement("li")
    favLi.classList.add('favRecipe')
    favUl.appendChild(favLi)
        
    favLi.innerHTML = `<a href="#" onclick="fetchFavRecipe(${newRecipe.id})" id="${newRecipe.id}" class="recipeTitles fav" ">${newRecipe.title}</a><span class="material-symbols-outlined" onclick="clearSingleFavRecipe(${newRecipe.id})">delete</span>`
}


// Makes fav button star filled in if the recipe is in favs

function markFavStar(recipeArr) {
    // search id array
    let searchIds = recipeArr.map(el => el.id)

    // fav id array
    let favRecipeArr = JSON.parse(localStorage.getItem('favRecipe'))
    let favIds = favRecipeArr.map(el => Number(el.id))

    //compare each search id to fav id and add star fill class to it
    searchIds.forEach(element => {
        for(let i = 0; i <= favIds.length; i++) {
            if (element === favIds[i]) {
                let recipeDiv = document.getElementById(element)
                let starFill = recipeDiv.parentElement.nextSibling.classList.add('fillStar')
            }
        }
    })
}

