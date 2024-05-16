// Importeerd npm pakket express uit de node_modules map
import express from 'express'

// Importeerd de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// variable voor de index route
const huizenHome = await fetchJson('https://fdnd-agency.directus.app/items/f_houses')
//todo  we hebben 18 huizen totaal die worden nu allemaal weergegeven en daar gaat iets fout

const lists = await fetchJson(`https://fdnd-agency.directus.app/items/f_list/?fields=*.*.*.*`)

const feedback = await fetchJson('https://fdnd-agency.directus.app/items/f_feedback')

const gelukt = 'uw score is toegevoegd';

// this is neccessary for getting the users images
const usersUrl = await fetchJson(`https://fdnd-agency.directus.app/items/f_users/?fields=*.*`)

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
const apiUrl = 'https://fdnd-agency.directus.app/items/'


// Get Route voor de index
app.get('/', async function (request, response) {


    lists.data["5"].description

    // console.log(JSON.stringify(lists.data)+' dit is de lijst')
    console.log(JSON.stringify(lists.data["5"].description) + ' dit is de description van  1 specififke lijst')
    response.render('index', {
        alleHuizen: huizenHome.data,
        alleRatings: feedback.data,
        list: lists.data,
        users: usersUrl.data,
    });
})
// app.get('/notes', function (request, response) {
//     Promise.all([
//         fetchJson('https://fdnd-agency.directus.app/items/f_users/'),
//         fetchJson('https://fdnd-agency.directus.app/items/f_list/')
//     ]).then(([userData, listData]) => {
//         response.render('notes', {data: userData.data, lists: listData.data});
//     });
// });
app.post('/', function (request, response) {
    console.log(request.body)
    response.redirect(300, '/')
})


// http://localhost:8001/lists/7
app.get('/lijsten/:id', async function (request, response) {
    fetchJson(`https://fdnd-agency.directus.app/items/f_list/${request.params.id}?fields=*.*.*.*`)
        // .then is used after the fetchjosn is succesful

        // console.log(JSON.stringify(lists.data.houses["0"].f_houses_id.poster_image.id)+'dit is het ophalen van de image van een huis')
        .then(lists => {
            if (lists.data) {//check if data exist
                response.render('lijsten', //render the ejs file in your views directory
                    {
                        //     here i give the object with the varaible
                        list: lists.data,
                        users: usersUrl.data,
                    });
            } else {
                // if not found
                console.error('No list data found');

            }
        })
});

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


app.get('/score/:id', function (request, response) {
    const feedback = fetchJson(`https://fdnd-agency.directus.app/items/f_feedback/?fields=*.*.*.*`)

    const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?fields=`;
    const houseUrl = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*`;

    // use a promise.all because the tables are not connected to each other
    Promise.all([
        fetchJson(feedbackUrl),
        fetchJson(houseUrl)
    ])
        .then(async (feedback) => {
            const feedbackdetails = feedback[0].data; // Assuming feedback is directly an array of objects
            const house = feedback[1].data; // Assuming house data is in the second response

            console.log(JSON.stringify(feedbackdetails[2].rating))
            response.render('score', {
                house: house,
                feedback: feedbackdetails,
                rating: feedbackdetails[2].rating,//de rating klopt bij het huis maar is nu handmatig gedaan maar dit moet dynamisch
                notities: feedbackdetails[2].note,
                succed: gelukt,
                users: usersUrl.data,
            });
        })
})

app.post('/score/:id', async function (request, response) {
//this is the empty object
    const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?fields=`;
    const houseUrl = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*`;
    const newScore = {
        general: request.body.algemeenNumber,
        kitchen: request.body.keukenNumber,
        bathroom: request.body.badkamerNumber,
        garden: request.body.tuinNumber,
        new: request.body.new,
    };
    const note = {note: request.body.note}
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
            note: note,
        }),
    })
        .then(async (apiResponse) => {

            // if the enhanced is true do this en the render is the partial
            if (request.body.enhanced) {
                response.render('partials/showScore', {
                        result: apiResponse,
                        succed: gelukt,
                    rating: feedbackdetails[2].rating,//de rating klopt bij het huis maar is nu handmatig gedaan maar dit moet dynamisch
                    notities: feedbackdetails[2].note,
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
app.set('port', process.env.PORT || 8001)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
    // Toon een bericht in de console en geef het poortnummer door
    console.log(`Application started on http://localhost:${app.get('port')}`)
})


// dit word waarschijnlijk niet meer gebruikert
const users_image = usersUrl.data.map(avatar => {
    if (avatar) {
        return {
            id_avatar: avatar.avatar?.id,
            width: avatar.avatar?.width,
            height: avatar.avatar?.height,
            name: avatar.name
        };
    } else {
        // Handle missing avatar data or name gracefully
        console.error("Error processing user:", avatar);
        return null; // Or any placeholder value
    }
});

// oud dit word niet meer gebruikt
app.get('/radio/:id', function (request, response) {
    // fetch data directus table f_feedback
    fetchJson(apiUrl + 'f_feedback').then((BeoordelingData) => {
        // console.log(BeoordelingData)

        response.render('oud/radio', {
            alleHuizen: huizenHome.data,
            alleRatings: feedback.data,
        })
        // console.log(ratings)
    })
})


// <!--    <% feedback.forEach(list => { %>-->
// <!--    <li> <%= list[0].rating.kitchen %></li>-->
//
// <!--    <% }) %>-->

// dit word niet meer gebruikt

app.get('/test/:id', function (request, response) {
    const feedback = fetchJson(`https://fdnd-agency.directus.app/items/f_feedback/?fields=*.*.*.*`)

    const feedbackUrl = `https://fdnd-agency.directus.app/items/f_feedback/?fields=`;
    const houseUrl = `https://fdnd-agency.directus.app/items/f_houses/${request.params.id}/?fields=*.*`;

    Promise.all([
        fetchJson(feedbackUrl),
        fetchJson(houseUrl)
    ])
        .then(async (feedback) => {
            const feedbackdetails = feedback[0].data; // dit s de beoordeling
            const house = feedback[1].data; // dit is het huis die de gebruiker uitgekozen heeft


            const targetHouseId = feedback[1].data.house_nr; // Replace with the actual house ID you want to filter for
            // todo hier moet een foreach loop komen
            feedbackdetails.forEach(function (house, feedback) {
                console.log("huis gegevens:", house);
                console.log("feedback object:", feedback);

                //
                console.log("feedback user:", feedback); //

            });

            //
            // const filteredFeedback = feedbackdetails.filter(feedbackdetails => {
            //     return feedbackdetails[0].house === targetHouseId;
            // });

            // console.log(filteredFeedback);

            // console.log(JSON.stringify(test) + 'dit is de filter')
            // console.log(JSON.stringify(feedbackdetails.data[0]))
            //
            // console.log(JSON.stringify(feedbackdetails[0].house))
            // console.log(JSON.stringify(feedbackdetails[0].note))
            // console.log(JSON.stringify(feedbackdetails[0].rating.ligging))
            // // house
            // console.log(JSON.stringify(feedback[1].data.house_nr))
            // console.log(JSON.stringify(feedback[1].data.id))
            // console.log(JSON.stringify(feedback[1].data.street))
            // console.log(JSON.stringify(feedback[1].data.city))
            response.render('oud/test', {
                house: house,
                feedback: feedbackdetails,
                rating: feedbackdetails[2].rating,//de rating klopt bij het huis maar is nu handmatig gedaan
                notities: feedbackdetails[2].note,
                succed: gelukt,
                users: usersUrl.data,
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
        method: 'post',
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
                response.render('../partials/showScore', {
                        result: apiResponse,
                        succed: gelukt,
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


// dit is voor de sterren raten naar database
app.post('/radio/:id', function (request, response) {
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
        response.redirect(303, '/radio/' + request.params.id)
    })
})