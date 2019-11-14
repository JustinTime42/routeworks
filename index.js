const express = require('express');
var cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser')
const knex = require('knex')
const pg = require('pg')

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    }    
})

const app = express();
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Put all API endpoints under '/api' this is an exampe
app.get('/api/routelist', (req, res) => {

    db.select('*').from('routes')
    .then(data => {
        res.json(data)
    })  
});

app.post('/api/addroute', (req, res) => {
    res.json(req.body.route_name)
    db('routes')
    .returning('route_name')
    .insert({route_name: req.body.route_name})
    .then(routeName => {
        res.json(routeName)
    }) 
})

app.post('/api/saveroute', (req, res) => {
    const add = req.body.selected
    const remove = req.body.unselected
    const route = req.body.route
    let response = 
        {
            add: [],
            remove: [],
            err: []
        }
    let promises = []
    add.forEach((item, i) => {
        promises.push(
            db('properties')
            .returning('address')
            .where('address', item.address)
            .update({
                route_name: route,
                route_position: i
            })
            .then(address => {
                response.add.push(address)            
            }) 
            .catch(err => response.err.push(err))
        )       
    })
    remove.forEach((item, i) => {
        promises.push(
            db('properties')
            .returning('address')
            .where({
                address: item.address,
                route_name: route
            })
            .update({
                route_name: unassigned,
                route_position: null
            })
            .then(address => {
                response.remove.push(address)
            })  
            .catch(err => response.err.push(err)) 
        )
    })    
    Promise.all(promises).then(() => res.json(response))
})

app.get('/api/properties', (req, res) => {
    db.select('*').from('properties')
    .then(data => {
        res.json(data)
    })
});

app.get('/api/getroute/:routeName', (req, res) => {
    const { routeName } = req.params
    db.where('route_name', routeName)
    .from('properties')
    .then(data => {
        res.json(data)
    })
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
 app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname+'/client/build/index.html'));
 });
//app.listen(5000)
app.listen(process.env.PORT || 5000);