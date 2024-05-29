// Importeerd npm pakket express uit de node_modules map
import express from 'express'
// Importeerd de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// variable voor de index route
const apiUrl = 'https://fdnd-agency.directus.app/items/'
const huizenHome = await fetchJson(apiUrl + 'f_houses')
const feedbackUrl = await fetchJson(apiUrl + 'f_feedback')
const usersUrl = await fetchJson(apiUrl + `f_users/?fields=*.*`)
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
app.use(express.urlencoded({extended: true}))


// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8001)

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
            users: usersUrl.data,
            ratings: ratings,
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
            user: 5,
            rating: {
                stars: request.body.algemeenNumber,
            },
        }),
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
    }).then((postResponse) => {
        // console.log(postResponse)
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
                response.render('huis', {house: apiData.data})
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
    const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?filter[house][_eq]=${request.params.id}`;
    // hier moet een
    const houseUrl = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*`;

    // deze data blijft staan omdat ikk het niet dynamisch krijg
    const staticData = {
        general: 5,
        kitchen: 5,
        bathroom: 5,
        garden: 5,
    }
    // use a promise.all because the tables are not connected to each other
    Promise.all([
        fetchJson(feedbackUrl),
        fetchJson(houseUrl)
    ])
        // hier word de data omgezet naar een object en met render word het weergegeven
        .then(async (feedback) => {
            response.render('score', {
                house: feedback[1].data,
                feedback: feedback[0].data,
                // rating: feedbackdetails[73].rating,//de rating klopt bij het huis maar is nu handmatig gedaan maar dit moet dynamisch
                succed: gelukt,
                users: usersUrl.data,
                ratings: staticData,
            });
        })
})


app.get('/succes', function (request, response) {
    const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?filter[house][_eq]=${request.params.id}`;
    // hier moet een

    // use a promise.all because the tables are not connected to each other
    Promise.all([
        fetchJson(feedbackUrl),
    ])
        // hier word de data omgezet naar een object en met render word het weergegeven
        .then(async (feedback) => {
            response.render('succes', {
                house: feedback.data,
                feedback: feedback.data,
                // rating: feedbackdetails[73].rating,//de rating klopt bij het huis maar is nu handmatig gedaan maar dit moet dynamisch
                succed: gelukt,
                users: usersUrl.data,
            });
        })
})


app.post('/score/:id', function (request, response) {
//this is the empty object that is going to be filled with the new score
    const newScore = {
        general: request.body.algemeenNumber,
        kitchen: request.body.keukenNumber,
        bathroom: request.body.badkamerNumber,
        garden: request.body.tuinNumber,
        new: request.body.new,
    };

    const noteUser = request.body.note

// make the post route
    fetch(`https://fdnd-agency.directus.app/items/f_feedback/?limit=8000&filter[house][_eq]=${request.params.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            "house": request.params.id,
            "list": 7,
            "user": 5,
            rating: newScore,
            note: noteUser,
        }),
    })

        // hier word de data omgezet naar een object en met render word het weergegeven
        .then(async (apiResponse) => {
            // if the enhanced is true do this en the render is the partial
            // console.log(noteUserg)
            // een or kan ik niet gebruiken omdat ik in de succespartial niet de notes heb
            if (request.body.enhanced) {
                const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?limit=8000&filter[house][_eq]=${request.params.id}`;
                // use a promise.all because the tables are not connected to each other
                console.log('data word pniew opgehaald scores numbers')
                fetchJson(feedbackUrl)
                    // todo zorgen dat de successtate er is want dynamisch weergeven van data en de enhanced is te moeilijk samen
                    .then(async (feedback) => {
                        // console.log(feedback.data)
                        response.render('partials/succes_partial', {
                                result: apiResponse,
                                feedback: feedback.data
                                // feedback hier toevoegen lukt niet ant het omzetten gebeurt in de get route

                            }
                        )
                    })


            }
            // todo navragen waarom deze pagina word ingeladen terwijl dat niet moet en alleen als de html werkt gebruik je dit
            if (request.body.notesEnhanced) {
                const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?limit=8000&filter[house][_eq]=${request.params.id}`;
                fetchJson(feedbackUrl)
                    .then(async (feedback) => {
                        console.log('data word pniew opgehaald notes')

                        response.render('partials/ShowNotes', {
                                result: apiResponse,
                                feedback: feedback.data
                            }
                        )
                    })
            }
            // als deze niet waar zijn doe dan dit
            if (!request.body.enhanced && !request.body.notesEnhanced) {
                console.log('redirecting...');
                response.redirect(303, '/succes');
            }


        })


})





