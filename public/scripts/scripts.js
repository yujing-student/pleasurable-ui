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





// here i define that this is the laoding state
let loadingElement = document.querySelector('.loading');
let succes = document.querySelector('.successtate');
// de successtae werrkt nog niet

// user parameters for the forms that the code is dry
// using this is neccessary because the 2 forms must have the exact same function
FormsEnhanced('.scorefield', '.showscore','enhanced', '.loading');


FormsEnhanced('.notesForm', '.show_notes', 'notesEnhanced', '.loading');

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
      loadingElement.classList.add('loader');

      // Gebruik een client-side fetch om een POST te doen naar de server
      // Als URL gebruiken we this.action
      // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
      console.log(this)
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
            console.log(' de fetch is gelukt en je ebtn terug!')
            loadingElement.classList.remove('loader');
            succes.classList.add('success')
            succes.textContent = '✓';
            // todo als de loader weg is voeg dan de successtae toe en haal die dan ook weer weg
            // todo het weghalen van de succcestate is met een animatie

            // todo het laten zien en verbegen van de animaite is met keyframes
            // todo de eventlistner die moet al klaar staan op de pagina als de pagina laad
            // todo vervolgens komt er een addeventlistener op de animatie waarin gecheckt word of de animatie klaar is

            // Update de DOM met de HTML
            if (document.startViewTransition) {
              document.startViewTransition(function () {
                document.querySelector(ShowResultsData).innerHTML = responseHTML;
              });
            } else {
              document.querySelector(ShowResultsData).innerHTML = responseHTML;
            }

            // // Scroll naar de bijgewerkte pagina
            const scoreNumbersElement = document.querySelector(ShowResultsData);
            scoreNumbersElement.scrollIntoView({behavior: 'smooth'});

            // succeState.classList.remove('successtate')
          });

      // Voorkom de standaard submit van de browser
      // Stel dat je hierboven een tikfout hebt gemaakt, of de browser ondersteunt
      // een bepaalde feature hierboven niet (bijvoorbeeld FormData), dan krijg je
      // een error en wordt de volgende regel nooit uitgevoerd. De browser valt dan
      // automatisch terug naar de standaard POST, wat prima is.
      event.preventDefault();

      setTimeout(function() {
        succes.classList.remove("success");
        succes.textContent = "";
      }, 2000);


    });
  });
}

// Assuming your selectors are correct
