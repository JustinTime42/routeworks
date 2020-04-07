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
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
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
    .returning('*')
    .insert({
        address: property.address,
        cust_name: property.cust_name,
        cust_phone: property.cust_phone,
        surface_type: property.surface_type,
        is_new: property.is_new,
        notes: property.notes,
        seasonal: property.seasonal,
        route_name: "unassigned",
        route_position: null,
        price: property.price,
        temp: property.temp,
        inactive: property.inactive
     })
     .then(property =>  res.json(property))
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
        seasonal: property.seasonal,
        price: property.price,
        temp: property.temp,
        inactive: property.inactive
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
            .returning('*')
            .where('key', item.key)
            .update({
                status: 'Waiting',
            })
            .then(item => {
                response.success.push(item)            
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
                seasonal: item.seasonal,
                price: item.price,
                temp: item.temp,
                inactive: item.inactive
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
            })
            .update({
                route_name: item.route_name === route ? "unassigned" : item.route_name,
                route_position: item.route_name === route ? null : item.route_position,
                status: item.route_name === route ? null : item.status,
                address: item.address,
                cust_name: item.cust_name,
                cust_phone: item.cust_phone,
                surface_type: item.surface_type,
                is_new: item.is_new,
                notes: item.notes,
                seasonal: item.seasonal,
                price: item.price,
                temp: item.temp,
                inactive: item.inactive
            })
            .then(address => {
                response.remove.push(address)
            })  
            .catch(err => response.err.push(err)) 
        )
    })    
    Promise.all(promises).then(() => res.json(response))
})

app.post('/api/propertykey', (req, res) => {
    let response = {
        res: [],
        err: []
    }
    db.select('*').from('service_log_temp').whereNull('property_key')
    .then(data => {
        data.forEach(item => {
            db.raw(`update service_log_temp set property_key=(select key from properties where cust_name='${item.cust_name}') where key=${item.key}`)
            .then(res => response.res.push(res))
            .catch(err => {
                console.log(err)
                response.err.push(err)                
            })            
        })
    })  
    .catch(finalErr => {
        response.err.push(finalErr)
        res.json(response)
    })

})
    //  update service_log 
    //  set price=(select properties.price from properties, service_log where service_log.property_key = properties.key) 
    //  where driver_earning ISNULL
    // select properties.price, property_key, properties.key from properties, service_log where service_log.property_key=249;
    // select properties.price, properties.key, service_log.property_key, service_log.price
    // from 

    
app.post('/api/price', (req, res) => {
    db.select('*').from('service_log_temp')
    .then(data => {
        data.forEach(item => {
            console.log("next item:")
            console.log(item)
            db.raw(`update service_log_temp set price=(select price from properties where key = ${parseInt(item.property_key)}) where key=${item.key}`) 
            .catch(error => {
                console.log(error)
                res.json(error)
            })
            
        })
    })  
})

app.post('/api/earning', (req, res) => {
    db.select('*').from('service_log_temp')
    .then(data => {
        data.forEach(item => {
            console.log("next item:")
            console.log(item)
            db.raw(`update service_log_temp set driver_earning=((select percentage from drivers where name = ${item.user_name}) * .01 * ${item.price}`)
            .catch(error => {
                console.log(error)
                res.json(error)
            })
            
        })
    })  
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
            user_name: req.body.driver.name,
            tractor: req.body.tractor,
            cust_name: property.cust_name,
            property_key: property.key,
            price: property.price,
            driver_earning: req.body.driver.percentage * .01 * property.price,
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

app.get('/api/drivers', (req, res) => {
    db.select('*')
    .from('drivers')
    .then(data => {
        res.json(data)
    })
})

app.post('/api/newdriver', (req, res) => {
    const driver = req.body
    db('drivers')    
    .returning('*')
    .insert({
        name: driver.name,
        percentage: driver.percentage
     })
     .then(driver =>  res.json(driver))
     .catch(err => res.json("error: " + err))
})

app.post('/api/editdriver', (req, res) => {
    const driver = req.body
    db('drivers')    
    .returning('*')
    .where('key', driver.key)
    .update({
        name: driver.name,
        percentage: driver.percentage
     })
     .then(driver =>  res.json(driver))
     .catch(err => res.json("error: " + err))
})

app.post('/api/deletedriver', (req, res) => {
    db('drivers')
    .returning('*')
    .where('key', req.body.key)
    .del()
    .then(property => res.json(property))
    .catch(err => res.json(err))
})


app.get('/api/getroute/:routeName', (req, res) => {
    // need to add a column here, so that's a join? 
    // the column is latest record for that property from service_log table

    // for each property, take the most recent record from service_log
    //WHERE key===key ORDER BY date DESC LIMIT 1;
    //or 
    //select distinct property_key from service_log order by timestamp
    // take above and
    //leftJoin('properties', 'service_log.property_key', 'properties.key'   )
    // const { routeName } = req.params

    //select * from properties, max(service_log.timestamp) where route_name='routeName'
    //leftJoin service_log  
        //on properties.key=service_log.property_key 
        //
    //where 
    db.where('properties.route)')
    // db.where('properties.route_name', routeName)
    // .select('*') 
    // .from('properties')
    // .leftJoin('service_log', () => {
    //     on('properties.key', 'service_log.property_key')
    //     .distinct()
    // })
    // .orderBy('route_position')
    // .then(data => {
    //     res.json(data)
    // })
    // .catch(err => res.json(err))
    const { routeName } = req.params
    db.where('properties.route_name', routeName)
    .select('*') 
    .from('properties')
    .orderBy('route_position')
    .then(data => {
        res.json(data)
    })
    .catch(err => res.json(err))
});

app.get('/api/getlogs/:date', (req,res) => {
    const { date } = req.params
    db.where('service_log.timestamp', '>', date)
    .select('*')
    .from('service_log')
    .then(data => res.json(data))
})

app.get('/api/getlogs/:property', (req, res) => {
    const { property } = req.params
    db.where('service_log.property_key', property.key)
    .select('*')
    .from('service_log')
    .then(data => res.json(data))
})

 app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname+'/client/build/index.html'));
 });

app.listen(process.env.PORT || 5000);