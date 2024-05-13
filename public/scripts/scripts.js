// Ik heb de form een class mee gegeven waarbij ik alle formulieren selecteer met de class ratingsFavorieten deze zit in een variable genaamd allRatings
const allRatings = document.querySelectorAll('.ratingsFavorieten')
// hier schrijf ik een if statement waarbij ik de variable allRatings oproep waarbij de class .ratingsFavoriten in zit en maak ik een forEach loop mee
// En maak ik een variable waarbij ik alle input radio oproep
if(allRatings){
  allRatings.forEach(function(formRating){
  const radioButtons = formRating.querySelectorAll('input[type=radio]')

  // hier maak ik een een forEach loop waar ik een nieuwe funcite maak met een eventListener waarbij ik zeg activeer als er een verandering komt in de input radio's
  radioButtons.forEach(function(radioButton){
    radioButton.addEventListener('change', function(){
      // const value = radioButton.value

      // nu haal ik formRating op met de functie submit
      formRating.submit()
    })
  })

   
  })
}


// confirm rating
var radioStar = document.querySelector("input");
var element = document.querySelector(".disabled-rating");

input.addEventListener("click", function() {
  element.classList.toggle(".confirm-rating")
});

