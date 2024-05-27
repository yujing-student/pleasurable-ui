

// here i define that this is the laoding state
let loadingElement = document.querySelector('.loading');
let succes = document.querySelector('.successtate');
// de successtae werrkt nog niet

// user parameters for the forms that the code is dry
// using this is neccessary because the 2 forms must have the exact same function
FormsEnhanced('.scorefield', '.showscore','enhanced', '.loading');
FormsEnhanced('.notesForm', '.show_notes', 'notesEnhanced', '.loading');

// updateButtonColor()
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
            console.log('terug!')
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


function updateButtonColor() {
  const checkedLabels = allLabels.filter(label => label.querySelector("input").checked);
  const allChecked = checkedLabels.length === allLabels.length; // Check if all labels are checked

  if (allChecked) {
    button.style.backgroundColor = "green"; // Change button color to green
  } else {
    button.style.backgroundColor = ""; // Reset button color if not all checked
  }
}


function addSuccessCheckmark(buttonSelector, successElementSelector, delay = 1000) {
  const button = document.querySelector(buttonSelector);
  const element = document.querySelector(successElementSelector);

  if (!button || !element) {
    console.error("Error: Button or success element not found.");
    return; // Handle potential errors gracefully
  }

  button.addEventListener("click", function() {


    setTimeout(function() {
      element.classList.add("success");
      element.textContent = "✓";
    }, delay);
  });
}

// Usage:
// addSuccessCheckmark(".NotesForm__button", ".successtate");


// Assuming your selectors are correct
