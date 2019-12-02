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
    db('routes')
    .returning('route_name')
    .insert({route_name: req.body.route_name})
    .then(routeName => {
        res.json(routeName)
    }) 
})

app.post('/api/initroute', (req, res) => {
    const route = req.body.route
    let response = {
        success: [],
        err: []
    } 
    let promises = []
    route.forEach(item => {
        promises.push(
            db('service_log')
            .returning('address')
            .insert({
                address: item.address,
                route_name: item.route_name,
                status: 'waiting',
                timestamp: db.fn.now(),
                notes: item.notes,
                user_name: item.user_name
            })
            .then(address => {
                response.success.push(address)            
            }) 
            .catch(err => response.err.push(err))
        )        
    })
    Promise.all(promises).then(() => res.json(response))
    
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
                route_name: "unassigned",
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
    db.select('*')
    .from('properties')
    .then(data => {
        res.json(data)
    })
});
//Probably don't need this on allproperties, because we just need it displayed on the route. 
//just do the join on the route properties for now and call it good. And don't forget to use MAX() to only get 
//most recent service log entry. 

app.get('/api/getroute/:routeName', (req, res) => {
    const { routeName } = req.params
    db.where('properties.route_name', routeName)
    .select('properties.key', 'properties.address', 'properties.route_name', 'properties.cust_name', 'properties.cust_phone', 'properties.surface_type', 'properties.is_new', 'properties.route_position', 'service_log.status', 'service_log.notes', 'service_log.user_name', {max: 'service_log.timestamp'})
    .from('properties')
    .leftJoin('service_log', 'properties.address', 'service_log.address')
    .groupBy('properties.address')
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