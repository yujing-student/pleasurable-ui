// Importeerd npm pakket express uit de node_modules map
import express from 'express'

// Importeerd de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// variable voor de index route
const huizenHome = await fetchJson('https://fdnd-agency.directus.app/items/f_houses')
const feedback = await fetchJson('https://fdnd-agency.directus.app/items/f_feedback')
const users = await fetchJson(`https://fdnd-agency.directus.app/items/f_users/?fields=*.*.`)
const gelukt = 'uw score is toegevoegd';
// this is neccessary for getting the users images
const users_image = users.data.map(avatar => {
    console.log(avatar.avatar.id);
    return {
        id_avatar: avatar.avatar.id,
        width: avatar.avatar.width,
        height: avatar.avatar.height,
        name: avatar.name

    };
});
// hier maak ik een nieuwe express app aan
const app = express()

// Stel ejs in als template engine
app.set('view engine', 'ejs')
// Stel de map met ejs templates in
app.set('views', './views')

// Gebruik de map 'public' voor statische resources
app.use(express.static('public'))

// Zorg dat werken met request data makkelijker wordt
app.use(express.urlencoded({extended: true}))

// 
let ratings = ''

// Get Route voor de index
app.get('/', function (request, response) {
    response.render('index', {
      alleHuizen: huizenHome.data,
      alleRatings : feedback.data,
      ratings: ratings
    });
    // console.log(huizenHome.data);
    // console.log(feedback.data);
    console.log(ratings);
})

app.post('/', function (request, response) { 
  ratings = request.body.star
  console.log(request.body)
  response.redirect(300, '/')
})


app.get('/huis/:id', function (request, response) {
  // request.params.id gebruik je zodat je de exacte huis kan weergeven dit is een routeparmater naar de route van die huis
  const url = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*.*`
  fetchJson(url).then((apiData) => {
    if (apiData.data) {/*als data voer dan dit uit */
      // console.log('data bestaat u gaat nu naar de Detailpage page'+JSON.stringify(apiData))
      // info gebruiken om die te linken aan apidata.data
      response.render('huis', {house: apiData.data});
      // console.log(apiData)
    } else {
      console.log('No data found for house with id: ' + request.params.id);
      //     laat de error zien als de data al niet gevonden word
    }
  })
  .catch((error) => {
      console.error('Error fetching house data:', error);
  });
});


app.get('/test/:id', function (request, response) {
    const feedback = fetchJson(`https://fdnd-agency.directus.app/items/f_feedback/?fields=*.*.*.*`)

    const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?fields=`;
    const houseUrl = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*`;

    // use a promise.all because the tables are not connected to each other
    Promise.all([
        fetchJson(feedbackUrl),
        fetchJson(houseUrl)
    ])
        .then(async (feedback) => {
            const feedbackdetails = feedback[0]; // Assuming feedback is directly an array of objects
            const house = feedback[1]; // Assuming house data is in the second response

            //
            // console.log(JSON.stringify(feedbackdetails))
            // console.log(JSON.stringify(house))
            //
            // // console.log(feedback);
            //
            //
            // console.log(feedback[0].data[0].id+'dit is het id');
            // console.log(feedback[0].data[0].note+'dit is de notitie');
            // console.log(feedback[0].data[0].rating.ligging+'dit is de beoordeling en house is een object met daarin weer keys en values')
            // console.log(feedback[0].data[0].rating.algemeen+'dit is de beoordeling en house is een object met daarin weer keys en values')
            //
            // // feedback["1"].data.id
            // // Render the data with the arrays
            // console.log(JSON.stringify(feedback[0]))
            response.render('test', {
                house: feedback[1].data,
                feedback: feedback[0],
                rating: feedback[0].data[2].rating,//de rating klopt bij het huis maar is nu handmatig gedaan
                users_image: users_image,
                notities: feedback[0].data[2].note,
                succed:gelukt,
            });
        })
})

app.post('/test/:id', async function (request, response) {
//this is the empty object

    const newScore = {
        general: request.body.algemeenNumber,
        kitchen: request.body.keukenNumber,
        bathroom: request.body.badkamerNumber,
        garden: request.body.tuinNumber,
        new: request.body.new,
    };
    const note = {note: request.body.note}
// make the post route
    fetch(`https://fdnd-agency.directus.app/items/f_feedback/?fields=*.*.*.*`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Set appropriate header
        },
        body: JSON.stringify({
            "house": request.params.id,
            "list": 7,
            "user": 5,
            rating: newScore,
            note: note,
        }),
    })
        .then(async (apiResponse) => {
            // if the enhanced is true do this en the render is the partial
            if (request.body.enhanced) {
                response.render('partials/showScore', {
                        result: apiResponse,
                    succed:gelukt,



                        //     todo hier nog een repsonse.bdy met tekst 'uw huis is tegevoegd'
                    }
                )
            }
            // the else is commented because if it is not working the full page is show in the beoordeling

            // else {
            //     response.redirect(303, '/score/' + request.params.id)
            // }

        })
        .catch(error => {
            console.error('Error making POST request:', error);
        });
})

    

// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})