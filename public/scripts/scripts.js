// // Ik heb de form een class mee gegeven waarbij ik alle formulieren selecteer met de class ratingsFavorieten deze zit in een variable genaamd allRatings
// const allRatings = document.querySelectorAll('.ratingsFavorieten')
// // hier schrijf ik een if statement waarbij ik de variable allRatings oproep waarbij de class .ratingsFavoriten in zit en maak ik een forEach loop mee
// // En maak ik een variable waarbij ik alle input radio oproep
// if(allRatings){
//   allRatings.forEach(function(formRating){
//   const radioButtons = formRating.querySelectorAll('input[type=radio]')
//
//   // hier maak ik een een forEach loop waar ik een nieuwe funcite maak met een eventListener waarbij ik zeg activeer als er een verandering komt in de input radio's
//   radioButtons.forEach(function(radioButton){
//     radioButton.addEventListener('change', function(){
//       // const value = radioButton.value
//
//       // nu haal ik formRating op met de functie submit
//       formRating.submit()
//     })
//   })
//
//
//   })
// }
//
//
// // confirm rating
// var radioStar = document.querySelector("input");
// var element = document.querySelector(".disabled-rating");
//
// input.addEventListener("click", function() {
//   element.classList.toggle(".confirm-rating")
// });


// user parameters for the forms that the code is dry
// using this is neccessary because the 2 forms must have the exact same function
FormsEnhanced('.scorefield', '.showscore','enhanced', '.loading-state');
FormsEnhanced('.notesForm', '.show_notes', 'notesEnhanced', '.loading-state');

// here i define that this is the laoding state
let loading_element = document.querySelector('.loading-state');

// todo uitzoeken waarom de loading state met parameters niet werkt


function FormsEnhanced(specificForm, ShowResultsData, enhancedName, loadingState) {
  // Selecteer alle formulieren
  let forms = document.querySelectorAll(specificForm);

  // Loop door al die formulieren
  forms.forEach(function (form) {
    // Luister naar het submit event
    form.addEventListener('submit', function (event) {
      // Het this object refereert hier naar het formulier zelf

      // Lees de data van het formulier in
      // https://developer.mozilla.org/en-US/docs/Web/API/FormData
      let data = new FormData(this);

      // Voeg een extra eigenschap aan de formulierdata toe
      // Deze gaan we server-side gebruiken om iets anders terug te sturen
      data.append(enhancedName, true);

      // Toon de laadstatus
      loading_element.classList.add('loader');
      // Gebruik een client-side fetch om een POST te doen naar de server
      // Als URL gebruiken we this.action
      // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
      // de loading state blijft hangen op deze fetch maar in de database staat het al
      fetch(this.action, {
        // Als method gebruiken we this.method (waarschijnlijk POST)
        method: this.method,

        // Als body geven de data van het formulier mee (inclusief de extra eigenschap)
        // https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
        body: new URLSearchParams(data),
      })
          .then(function (response) {
            // Als de server een antwoord geeft, krijgen we een stream terug
            // We willen hiervan de text gebruiken, wat in dit geval HTML teruggeeft
            return response.text();
          })
          .then(function (responseHTML) {
            //haal de laoder weg
            loading_element.classList.remove('loader');

            // Update de DOM met de HTML
            if (document.startViewTransition) {
              document.startViewTransition(function () {
                document.querySelector(ShowResultsData).innerHTML = responseHTML;
              });
            } else {
              document.querySelector(ShowResultsData).innerHTML = responseHTML;
            }

            // Scroll naar de bijgewerkte pagina
            const scoreNumbersElement = document.querySelector(ShowResultsData);
            scoreNumbersElement.scrollIntoView({behavior: 'smooth'});
          });

      // Voorkom de standaard submit van de browser
      // Stel dat je hierboven een tikfout hebt gemaakt, of de browser ondersteunt
      // een bepaalde feature hierboven niet (bijvoorbeeld FormData), dan krijg je
      // een error en wordt de volgende regel nooit uitgevoerd. De browser valt dan
      // automatisch terug naar de standaard POST, wat prima is.
      event.preventDefault();
    });
  });
}

// dit moet onder de showresults komen en dan duit de database
//<ul class="output_other_users">
//     <% if (algemeen.length > 0) { %>
//         <% algemeen.forEach(number =>{ %>
//             <li class="show_notes__user"> algemeen: <%= number %></li>
//         <% }) %>
//     <% } else { %>
//         <li class="show_notes__user">U hebt nog geen score op gegeven</li>
//     <% } %>
//
//     <% if (keuken.length > 0) { %>
//         <% keuken.forEach(kitchen_number =>{ %>
//             <li class="show_notes__user"> keuken: <%= kitchen_number %></li>
//         <% }) %>
//     <% } else { %>
//         <li class="show_notes__user"></li>
//     <% } %>
//
//     <% if (badkamer.length > 0) { %>
//         <% badkamer.forEach(kitchen_number =>{ %>
//             <li class="show_notes__user"> Badkamer: <%= kitchen_number %></li>
//         <% }) %>
//     <% } else { %>
//         <li class="show_notes__user"></li>
//     <% } %>
//
//     <% if (tuin.length > 0) { %>
//         <% tuin.forEach(kitchen_number =>{ %>
//             <li class="show_notes__user"> tuin: <%= kitchen_number %></li>
//         <% }) %>
//     <% } else { %>
//         <li class="show_notes__user"></li>
//     <% } %>
// </ul>