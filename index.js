var http = require('http');
const express = require('express');
const app = express();

var server = http.createServer(app);
// const socketIo = require("socket.io");
// const io = socketIo(server, {
//     cors: {
//       origin: '*',
//     }
//   });;
var cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser')
const knex = require('knex')
const pg = require('pg');
const { ESRCH } = require('constants');
// const { Socket } = require('dgram');
const { promises } = require('fs');

const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    }    
})


app.use(cors())
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(bodyParser.json({limit: '50mb'}));
//Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// io.on('connection', socket => {
//     console.log("new user")
//     socket.emit('welcome-msg', "welcome, new user")
//     socket.on('hi', data => console.log(data))
//     socket.on('add-tractor', (tractor, res) => {
//             db('tractors')    
//             .returning('*')
//             .insert({...tractor})
//             .then(newTractor => {
//                 console.log(newTractor)
//                 socket.emit('newTractor', newTractor)
//             }) 
//             .catch(err => socket.emit('err', err))
//     })
// })

/*
The following endpoints (newtractor and deletetractor) are currently implemented as post endpoints. 
convert them to sockets, then implement that change on the front end. Push to demo app and see how that works. 
Use lessons learned to start converting other assets. Save the important and high stakes ones like property and route details for after
familiarity with the technology has been achieved. 
Here is some sample code.Notice how everything is encased in the main io.on() function. with a socket.on function for each 'endpoint...?' 

io.on('connection', (socket) => {
  let addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });
*/


app.get('/api/routelist', (req, res) => {
    db.select('*').from('routes')
    .then(data => {
        res.json(data)
    })  
    .catch(err => res.json(err))
});

app.post('/api/addroute', (req, res) => {
    db('routes')
    .returning('*')
    .insert({...req.body})
    .then(newRoute => {
        res.json(newRoute)
    })
    .catch(err => res.json("error: " + err))
})

app.post('/api/delroute', (req, res) => {
    let response = {
        route: {},
        routeData: {},
        err: []
    }    
    let promises = []
    let { name } = req.body

    promises.push(
        db('routes')
        .returning('*')
        .where('name', name)
        .del()
        .then(route => {
            console.log("routes: ", route[0])
            response.route = route[0]
        }) 
        .catch(err => response.err.push(err))
    )

    promises.push(
        db('route_data')
        .returning('*')
        .where('route_name', name)
        .del()
        .then(route => {
            console.log("routeData: ", route)
            response.routeData = route
        } )
        .catch(err => response.err.push(err))
    )
    Promise.all(promises).then(() => {
        if (response.err.length > 0) {
            res.json(response.err)
        } 
        else res.json(response.route)
    })
    .catch(err => res.json(err))
})

app.post('/api/newproperty', (req, res) => {
    const property = req.body
    db('properties')    
    .returning('*')
    .insert({...property})
    .then(property =>  res.json(property))
    .catch(err => res.json("error: " + err))
})

app.get('/api/custdetail/:key', (req, res) => {
    db.select('*').from('properties')
    .where('key', req.params.key)
    .then(data => {
        res.json(data)
    })  
})

app.post('/api/editproperty', (req, res) => {
    const property = req.body
    db('properties')
    .returning('*')
    .where('key', property.key)
    .update({...property})
    .then(details => res.json(details[0]))
    .catch(err => res.json("error: " + err))
})

app.post('/api/deleteproperty', (req, res) => {
    let response = {
        route_data:[],
        properties:{},
        err: []
    }
    let promises = []
    promises.push(
        db('properties')
        .returning('*')
        .where('key', req.body.key)
        .del()
        .then(property => response.properties = property[0])
        .catch(err => res.json(err))
    )
    promises.push(
        db('route_data')
        .returning('*')
        .where('property_key', req.body.key)
        .del()
        .then(routeEntries => response.route_data = routeEntries)
    )
    Promise.all(promises).then(() => res.json(response))

})

app.post('/api/initroute', (req, res) => {
    const { route, customers} = req.body
    let response = {
        success: [],
        err: []
    } 
    let promises = []
    customers.forEach(item => {
        promises.push(
            db('route_data')
            .returning('*')
            .where({
                property_key: item.key,
                route_name: route,
            })
            .update({   
                status: item.status,
            })
            .then(address => {
                response.success.push(address)
            }) 
            .catch(err => {
                console.log(err)
                response.err.push(err)
            })
        )          
    })
    Promise.all(promises).then(() => res.json(response))    
})

app.post('/api/saveroute', (req, res) => {

    const { selected, droppedCard, route, whereTo } = req.body
    let response = 
        {
            selected: [],
            err: [],
            removed: {},
        }
    let promises = []

    if (whereTo === "off") {
        promises.push(
            db('route_data')
            .returning('*')
            .where({
                property_key: droppedCard.property_key,
                route_name: route,
            })
            .del()
            .then(customer => response.removed = customer)
            .catch(err => {
                console.log("route data off", err)
                response.err.push(err)
            })

        )
    } else if (whereTo === "on") {
        promises.push(
            db('route_data')
            .returning('*')
            .insert({...droppedCard, route_name: route})
            .catch(err => {
                console.log("route data on", err)
                response.err.push(err)
            })
        )
    }

    selected.forEach((item, i) => {
        promises.push(
            db('route_data')
            .returning('*')
            .where({
                property_key: item.key,
                route_name: route,
            })
            .update({   
                route_position: item.route_position,
            })
            .then(address => {
                response.selected.push(address)
            }) 
            .catch(err => {
                console.log("route data reorder", err)
                response.err.push(err)
            })
        )       
    })
    
    Promise.all(promises).then(() => {
        console.log(response)
        res.json(response)
    })
})

/* The following are temporary functions for importing/migrating old data. 
//Keep for now

app.get('/api/fixroutes', (req, res) => {
    let { routeName } = req.body
    let response = {
        res: [],
        err: []
    }
    let results = []

    db.select('key', 'route_data').from('properties')
    .then(custList => {
        custList.forEach(cust => {
            if (cust.route_data.length > 0) {
                cust.route_data.forEach(routeEntry => {                
                    results.push({property_key: cust.key, ...routeEntry})
                })
            }   
        })
        db('route_data').returning('*').insert(results)
        .then(data => res.json(data))
        .catch(err => {
            console.log(err)
            res.json(err)
        })
    })
})



// app.post('/api/propertykey', (req, res) => {
//     let response = {
//         res: [],
//         err: []
//     }
//     db.select('*').from('service_log_temp').whereNull('property_key')
//     .then(data => {
//         data.forEach(item => {
//             db.raw(`update service_log_temp set property_key=(select key from properties where cust_name='${item.cust_name.replace(/'/g, "''")}' and address='${item.address}') where key=${item.key}`)
//             .then(res => response.res.push(res))
//             .catch(err => {
//                 console.log(err)
//                 response.err.push(err)                
//             })            
//         })
//     })  
//     .catch(finalErr => {
//         response.err.push(finalErr)
//         res.json(response)
//     })
// })

// app.post('/api/price', (req, res) => {
//     let response = {
//         res: [],
//         err: []
//     }
//     db.select('*').from('service_log_temp').whereNull('price')
//     .then(data => {
//         data.forEach(item => {
//             db.raw(`update service_log_temp set price=(select price from properties where key = ${parseInt(item.property_key)}) where key=${item.key}`) 
//             .then(res => response.res.push(res))
//             .catch(err => {
//                 console.log(err)
//                 response.err.push(err)                
//             })            
//         })
//     })  
//     .catch(finalErr => {
//         response.err.push(finalErr)
//         res.json(response)
//     })

// })

// app.post('/api/earning', (req, res) => {
//     let response = {
//         res: [],
//         err: []
//     }
//     db.select('*').from('service_log_temp').whereNull('driver_earning')
//     .then(data => {
//         data.forEach(item => {
//             db.raw(`update service_log_temp set driver_earning=((select percentage from drivers where name = ${item.user_name}) * .01 * ${item.price}) where key=${item.key}`)
//             .then(res => response.res.push(res))
//             .catch(err => {
//                 console.log(err)
//                 response.err.push(err)                
//             })            
//         })
//     })  
//     .catch(finalErr => {
//         response.err.push(finalErr)
//         res.json(response)
//     })
// })
*/

app.delete('/api/undo/:logKey', (req,res) => {
    const { logKey } = req.params
    let response = {
        err: [],
        service_log: {},
        route_data: {}
    }

    db('service_log')
    .select('route_name', 'property_key')
    .where('key', logKey)
    .then(result => {
        db('route_data')
        .returning('*')
        .update('status', 'Waiting')
        .where({
            route_name: result[0].route_name,
            property_key: result[0].property_key,
        })
        .then(newStatus => {
            response.route_data = newStatus
            db('service_log')
            .returning('*')
            .where('key', logKey)
            .del()
            .then(logEntry => {
                response.service_log = logEntry
                response.route_data = newStatus
            })
            .catch(err => response.err.push(err))
            
        })
        .catch(err => response.err.push(err))
        res.json(response)        
    })
    .catch(err => response.err.push(err))
})

app.post('/api/setstatus', (req, res) => {
    let { property, route, yards, startTime, endTime, status, priority, work_type, noteField, driver, tractor } = req.body
    let promises = []
    let month = new Date().getMonth() + 1
    let year = new Date().getFullYear().toString().substr(-2)
    yards = (yards !== '0') ? ": " + yards + " yds" : "" 
    let response = {
        route_data: {},
        serviceLog: [],
        property: {},
        err: []
    }

    promises.push(
        db('route_data')
        .returning('*')
        .where({
            property_key: property.key,
            route_name: route,            
        })
        .update({
            status: status,
                        // priority: status === 'Done' ? priority : route_data.priority,

        })
        .then(entry => response.route_data = entry)
        .catch(err => {
            console.log(err)
            response.err.push(err)
        }) 
    )

    promises.push(
        db('service_log')
        .returning('*')
        .insert({
            address: property.address,
            status: status,
            notes: noteField,
            user_name: driver.name,
            route_name: route,
            tractor: tractor,
            cust_name: property.cust_name,
            property_key: property.key,
            price: property.price,
            driver_earning: driver.percentage * .01 * property.value,
            description: status === 'Skipped' ? '' : work_type + yards,
            invoice_number: `A${property.key}${year}${month}`,
            reference: property.address,
            work_type: work_type,
            start_time: startTime,
            end_time: endTime,
        })
        .then(property => response.serviceLog.push(property))
        .catch(err => {
            console.log(err)
            response.err.push(err)
        })       
    ) 

    Promise.all(promises).then(() => res.json(response))
})

app.get('/api/properties', (req, res) => {
    // for now, send all property data. Also request route data everywhere that property data is requested. 
    // eventually, trim this to be just key, cust_name, and address and make another endpoint for all the details
    // that will be queried when a customer is clicked on. 
    //     
    db.select('*')
    .from('properties')
    .then(data => res.json(data))
    .catch(err => res.json(err)) 
})

app.get('/api/contactinfo', (req, res) => {
    let tags = req.query.tags
    let promises = []
    let response = {
        data: [],
        err: []
    }
    if(typeof(tags) === 'string') {
        tags = [tags]
    }
    tags.forEach(tag => {
        promises.push(
            db.select('cust_name', 'address', 'cust_email', 'tags')
            .from('properties')
            .where('tags', 'like', `%${tag}%`)
            .then(data => response.data.push(data))
            .catch(err => response.err.push(err))
        )
    })
    Promise.all(promises).then(() => res.json(response))
})

app.get('/api/drivers', (req, res) => {
    db.select('*')
    .from('drivers')
    .then(data => {
        res.json(data)
    })
})

app.post('/api/newdriver', (req, res) => {
    const driver = req.body
    console.log(driver)
    db('drivers')    
    .returning('*')
    .insert({...driver})
     .then(driver =>  res.json(driver))
     .catch(err => res.json("error: " + err))
})

app.post('/api/editdriver', (req, res) => {
    const driver = req.body
    db('drivers')    
    .returning('*')
    .where('key', driver.key)
    .update({...driver})
     .then(driver =>  res.json(driver))
     .catch(err => res.json("error: " + err))
})

app.post('/api/deletedriver', (req, res) => {
    db('drivers')
    .returning('*')
    .where('key', req.body.key)
    .del()
    .then(property => res.json(property[0]))
    .catch(err => res.json(err))
})

app.get('/api/vehicles', (req, res) => {
    db.select('*')
    .from('tractors')
    .orderBy('name')
    .then(data => res.json(data))
    .catch(err => res.json(err))
})

app.post('/api/newvehicle', (req, res) => {
    console.log(req.body)
    const tractor = req.body
    db('tractors')    
    .returning('*')
    .insert({...tractor})
    .then(tractor =>  res.json(tractor))
    .catch(err => res.json("error: " + err))
})

app.post('/api/deletevehicle', (req, res) => {
    console.log(req.body)
    db('tractors')
    .returning('*')
    .where('name', req.body.name)
    .del()
    .then(tractor => res.json(tractor[0]))
    .catch(err => res.json(err))
})

app.get('/api/vehicletypes', (req, res) => {
    db.select('*')
    .from('vehicle_types')
    .orderBy('name')
    .then(data => res.json(data))
    .catch(err => res.json(err))
})

app.post('/api/newvehicletype', (req, res) => {
    const name = req.body
    db('vehicle_types')
    .returning('*')
    .insert({...name})
    .then(newtype => res.json(newtype))
    .catch(err => res.json("error: ", err))
})

app.post('/api/deletevehicletype', (req, res) => {
    console.log(req.body)
    db('vehicle_types')
    .returning('*')
    .where('name', req.body.name)
    .del()
    .then(vehicleType => res.json(vehicleType[0]))
    .catch(err => res.json(err))
})

app.get('/api/alltags', (req, res) => {
    db.select('*')
    .from('tags')
    .then(data => res.json(data.map(tag => Object.values(tag)[0])))
    .catch(err => res.json(err))
})

// create a new tag
app.post('/api/newtag', (req, res) => {
    console.log(req.body)
    db('tags')
    .returning('*')
    .insert({tag_name: req.body.tag_name})
    .then(newTag => res.json(newTag[0].tag_name))
    .catch(err => res.json(err))
})

// delete a tag Not currently in use
app.post('/api/deltag', (req, res) => {
    db('tags')
    .returning('*')
    .where('tag_name', req.body.tag_name)
    .del()
    .then(tag => res.json(tag))
    .catch(err => res.json(err))
})

//get properties who match any of the tags passed in
app.get('/api/filterbytags/', (req, res) => {
    const tags = JSON.parse(req.query.tags)
    let response = 
    {
        customers: [],        
        err: []
    }
    let promises = []
    tags.forEach(tag => {
        promises.push(
            db('properties')
            .where('tags', 'like', `%${tag}%`)
            .then(customers => response.customers.push(customers))
            .catch(err => error.push(err))
        )        
    })  
    Promise.all(promises).then(() => res.json(response)) 
})

app.get('/api/routedata', (req, res) => {
    db('route_data')
    .select('*')
    .then(data => res.json(data))
    .catch(err => res.json(err))
})

app.get('/api/getroute/:routeName', (req, res) => {
    const { routeName } = req.params
    db('route_data')
    .join('properties', 'route_data.property_key', '=', 'properties.key')
    .select('*')
    .where('route_data.route_name', routeName)
    .then(data => {
        res.json(data)
    })
    .catch(err => res.json(err))
})

app.get('/api/getlogs/', (req,res) => {

    const options = req.query 
    if (options.type === 'xero') {
        const getFields =
        [
            'properties.cust_name', 'properties.cust_email', 'properties.bill_address', 'properties.bill_city', 
            'properties.bill_state', 'properties.bill_zip', 'service_log.invoice_number', 'service_log.reference', 
            'service_log.item_code', 'service_log.description', 'service_log.price', 'service_log.timestamp', 'properties.contract_type', 
            'service_log.notes', 'service_log.work_type', 'service_log.address', 'service_log.route_name', 'service_log.status',
            'service_log.user_name', 'service_log.tractor', 'service_log.driver_earning', 'properties.value',
        ]       
        db('service_log')
        .join('properties', 'service_log.property_key', '=', 'properties.key')
        .select(getFields)
        .whereBetween('service_log.timestamp', [options.start, options.end])
        // .whereNotIn('properties.contract_type', ['Monthly', 'Seasonal'])
        // .orWhere('service_log.work_type', '<>', 'Snow Removal')  
        // .andWhere('service_log.status', 'Done')
        .orderBy('service_log.timestamp')
        .then(data => res.json(data))
        .catch(err => res.json(err))        
    } else {
        db.whereBetween('service_log.timestamp', [options.start, options.end])
        .select('service_log.key', 'service_log.address', 'service_log.route_name', 'service_log.status', 'service_log.timestamp', 'service_log.notes', 
        'service_log.user_name', 'service_log.tractor', 'service_log.cust_name', 'service_log.property_key', 'service_log.price', 'service_log.driver_earning', 
        'service_log.invoice_number', 'service_log.reference', 'service_log.item_code', 'service_log.description', 'properties.value', 'properties.contract_type', 'service_log.work_type')
        .from('service_log')
        .join('properties', {'properties.key': 'service_log.property_key'})
        .orderBy('timestamp')
        .then(data => res.json(data))
    }
})

app.get('/api/getlogs/:property', (req, res) => {
    const { property } = req.params
    db.where('service_log.property_key', property)
    .select('timestamp', 'status', 'notes', 'description', 'user_name', 'start_time', 'end_time' )
    .from('service_log')
    .orderBy('timestamp', 'desc')
    .then(data => res.json(data))
})

 app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname+'/client/build/index.html'));
 });

server.listen(process.env.PORT || 5000);