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

app.post('/api/newproperty', (req, res) => {
    const property = req.body
    db('properties')    
    .returning('address')
    .insert({
        address: property.address,
        cust_name: property.cust_name,
        cust_phone: property.cust_phone,
        surface_type: property.surface_type,
        is_new: property.is_new,
        notes: property.notes,
        seasonal: property.seasonal
     })
     .then(address =>  res.json(address))
     .catch(err => res.json("error: " + err))
})

app.post('/api/editproperty', (req, res) => {
    const property = req.body
    db('properties')
    .returning('*')
    .where('key', property.key)
    .update({
        address: property.address,
        cust_name: property.cust_name,
        cust_phone: property.cust_phone,
        surface_type: property.surface_type,
        is_new: property.is_new,
        notes: property.notes,
        seasonal: property.seasonal
    })
    .then(details => res.json(details))
    .catch(err => res.json("error: " + err))
})

app.post('/api/deleteproperty', (req, res) => {
    db('properties')
    .returning('*')
    .where('key', req.body.key)
    .del()
    .then(property => res.json(property))
    .catch(err => res.json(err))
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
            db('properties')
            .returning('address')
            .where('key', item.key)
            .update({
                status: 'Waiting',
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
            .returning('*')
            .where('key', item.key)
            .update({
                route_name: route,
                route_position: i,
                status: item.status || "Waiting",
                address: item.address,
                cust_name: item.cust_name,
                cust_phone: item.cust_phone,
                surface_type: item.surface_type,
                is_new: item.is_new,
                notes: item.notes,
                seasonal: item.seasonal
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
                key: item.key,
                route_name: route
            })
            .update({
                route_name: route_name === route ? "unassigned" : item.route_name,
                route_position: route_name === route ? null : item.route_position,
                status: route_name === route ? null : item.status,
                address: item.address,
                cust_name: item.cust_name,
                cust_phone: item.cust_phone,
                surface_type: item.surface_type,
                is_new: item.is_new,
                notes: item.notes,
                seasonal: item.seasonal
            })
            .then(address => {
                response.remove.push(address)
            })  
            .catch(err => response.err.push(err)) 
        )
    })    
    Promise.all(promises).then(() => res.json(response))
})

app.post('/api/setstatus', (req, res) => {
    let property = req.body.property
    let promises = []
    let response = {
        properties: {},
        serviceLog: {},
        err: []
    }

    promises.push(
        db('properties')
        .returning('*')
        .where('key', req.body.property.key)
        .update({status: req.body.newStatus})
        .then(property => response.properties = property)
        .catch(err => response.err.push(err))
    )

    promises.push(
        db('service_log')
        .returning('*')
        .insert({
            address: property.address,
            route_name: property.route_name,
            status: req.body.newStatus,
            notes: req.body.noteField,
            user_name: req.body.driver,
            tractor: req.body.tractor,
            cust_name: property.cust_name
        })
        .then(property => response.serviceLog = property)
        .catch(err => response.err.push(err))       
    )
    Promise.all(promises).then(() => res.json(response))
    //where req.property.key from properties
    //insert fields to service log including req.newstatus


})
app.get('/api/properties', (req, res) => {
    db.select('*')
    .from('properties')
    .then(data => {
        res.json(data)
    })
});


app.get('/api/getroute/:routeName', (req, res) => {
    const { routeName } = req.params
    db.where('properties.route_name', routeName)
    .select('*') 
    .from('properties')
    .orderBy('route_position')
    .then(data => {
        res.json(data)
    })
});

app.get('/api/getlogs/:date', (req,res) => {
    const { date } = req.params
    db.where('service_log.timestamp', '>', date)
    .select('*')
    .from('service_log')
    .then(data => res.json(data))
})

 app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname+'/client/build/index.html'));
 });

app.listen(process.env.PORT || 5000);