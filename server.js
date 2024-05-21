// Importeerd npm pakket express uit de node_modules map
import express from 'express'
// Importeerd de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// variable voor de index route
const apiUrl = 'https://fdnd-agency.directus.app/items/'
const huizenHome = await fetchJson(apiUrl + 'f_houses')
const feedbackUrl = await fetchJson(apiUrl + 'f_feedback')
const lists = await fetchJson(apiUrl +`f_list/?fields=*.*.*.*`)
const usersUrl = await fetchJson(apiUrl+`f_users/?fields=*.*`)
const gelukt = 'uw score is toegevoegd';
//
// let ratings = ''
let ratings = []

// hier maak ik een nieuwe express app aan
const app = express()

// Stel ejs in als template engine
app.set('view engine', 'ejs')
// Stel de map met ejs templates in
app.set('views', './views')

// Gebruik de map 'public' voor statische resources
app.use(express.static('public'))

// Zorg dat werken met request data makkelijker wordt
app.use(express.urlencoded({ extended: true }))

// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8005)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
    // Toon een bericht in de console en geef het poortnummer door
    console.log(`Application started on http://localhost:${app.get('port')}`)
})
// Get Route voor de index
app.get('/', function (request, response) {
    // fetch data directus table f_feedback
    fetchJson(apiUrl + 'f_feedback').then((BeoordelingData) => {
        // console.log(BeoordelingData)

        response.render('index', {
            alleHuizen: huizenHome.data,
            alleRatings: feedbackUrl.data,
            ratings: ratings,
            users: usersUrl.data,
        })
        // console.log(ratings)
    })
})

app.post('/', function (request, response) {
    console.log(request.body)

    // posten naar directus..
    fetch(`${apiUrl}f_feedback/`, {
        method: 'POST',
        body: JSON.stringify({
            house: request.body.id,
            list: 12,
            user: 7,
            rating: {
                stars: request.body.stars,
            },
        }),
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
    }).then((postResponse) => {
        console.log(postResponse)
        response.redirect(303, '/')
    })
})

app.get('/huis/:id', function (request, response) {
    // request.params.id gebruik je zodat je de exacte huis kan weergeven dit is een routeparmater naar de route van die huis
    const url = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*.*`
    fetchJson(url)
        .then((apiData) => {
            if (apiData.data) {
                /*als data voer dan dit uit */
                // console.log('data bestaat u gaat nu naar de Detailpage page'+JSON.stringify(apiData))
                // info gebruiken om die te linken aan apidata.data
                response.render('huis', { house: apiData.data })
                // console.log(apiData)
            } else {
                console.log('No data found for house with id: ' + request.params.id)
                //     laat de error zien als de data al niet gevonden word
            }
        })
        .catch((error) => {
            console.error('Error fetching house data:', error)
        })
})

app.get('/score/:id', function (request, response) {
    const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?fields=`;
    const houseUrl = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*`;

    // use a promise.all because the tables are not connected to each other
    Promise.all([
        fetchJson(feedbackUrl),
        fetchJson(houseUrl)
    ])
        // todo zorgen dat de successtate er is want dynamisch weergeven van data en de enhanced is te moeilijk samen
        .then(async (feedback) => {
            const feedbackdetails = feedback[0].data; // Assuming feedback is directly an array of objects
            const house = feedback[1].data; // Assuming house data is in the second response
            // Filter feedback based on house ID
            // const filteredFeedback = feedback.filter(item => item.house === house.id);


          // for (const obj of feedbackdetails.data) {
          //     for (const data of feedbackdetails.data) {
          //         if (data.data.rating) {
          //             data.rating.kitchen
          //             data.rating.general
          //             data.rating.bathroom
          //             data.rating.garden
          //         }
          //     }
          //
          // }





            console.log(JSON.stringify(feedbackdetails[2].rating))
            response.render('score', {
                house: house,
                feedback: feedback[0].data,
                rating: feedbackdetails[73].rating,//de rating klopt bij het huis maar is nu handmatig gedaan maar dit moet dynamisch
                notities: feedbackdetails[2].note,
                succed: gelukt,
                users: usersUrl.data,
            });
        })
})

app.post('/score/:id',  function (request, response) {
//this is the empty object
    const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?fields=`;
    const houseUrl = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*`;

    Promise.all([
        fetchJson(feedbackUrl),
        fetchJson(houseUrl)
    ])
    const newScore = {
        general: request.body.algemeenNumber,
        kitchen: request.body.keukenNumber,
        bathroom: request.body.badkamerNumber,
        garden: request.body.tuinNumber,
        new: request.body.new,
    };
    const noteUser = {note: request.body.note}
    console.log(JSON.stringify(newScore))

// make the post route
    fetch(`https://fdnd-agency.directus.app/items/f_feedback/?fields=*.*.*.*`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json', // Set appropriate header
        },
        body: JSON.stringify({
            "house": request.params.id,
            "list": 7,
            "user": 5,
            rating: newScore,
            note: noteUser,
        }),
    })


        .then(async (apiResponse) => {

            // if the enhanced is true do this en the render is the partial
            if (request.body.enhanced) {
                response.render('partials/showScore', {
                        result: apiResponse,
                        succed: gelukt,
                    note: noteUser,
                    // feedback hier toevoegen lukt niet ant het omzetten gebeurt in de get route

                    }
                )
            }
            // the else is commented because if it is not working the full page is show in the beoordeling

            // else {
            //     response.redirect(303, '/score/' + request.params.id)
            // }

        })

})

