var http = require('http');
const express = require('express');
const app = express();

var server = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(server, {
    cors: {
      origin: '*',
    }
  });;
var cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser')
const knex = require('knex')
const pg = require('pg');
const { ESRCH } = require('constants');
const { Socket } = require('dgram');

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

io.on('connection', socket => {
    console.log("new user")
    socket.emit('welcome-msg', "welcome, new user")
    socket.on('hi', data => console.log(data))
    socket.on('add-tractor', (tractor, res) => {
            db('tractors')    
            .returning('*')
            .insert({...tractor})
            .then(newTractor => {
                console.log(newTractor)
                socket.emit('newTractor', newTractor)
            }) 
            .catch(err => socket.emit('err', err))
    })
})

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
// app.post('/api/newtractor', (req, res) => {
//     console.log(req.body)
//     const tractor = req.body
//     db('tractors')    
//     .returning('*')
//     .insert({...tractor})
//     .then(tractor =>  res.json(tractor))
//     .catch(err => res.json("error: " + err))
// })

app.post('/api/deletetractor', (req, res) => {
    db('tractors')
    .returning('*')
    .where('tractor_name', req.body.tractor_name)
    .del()
    .then(tractor => res.json(tractor))
    .catch(err => res.json(err))
})

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
    .insert({...property, route_data: JSON.stringify(property.route_data)})
     .then(property =>  res.json(property))
     .catch(err => res.json("error: " + err))
})

app.post('/api/editproperty', (req, res) => {
    const property = req.body
    db('properties')
    .returning('*')
    .where('key', property.key)
    .update({...property, route_data: JSON.stringify(property.route_data)})
    .then(details => res.json(details[0]))
    .catch(err => res.json("error: " + err))
})

app.post('/api/deleteproperty', (req, res) => {
    db('properties')
    .returning('*')
    .where('key', req.body.key)
    .del()
    .then(property => res.json(property[0]))
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
                route_data: JSON.stringify(property.route_data),
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
    /*
        Right now, we are sending/recieving massive amounts of unneeded data and it's causing performance and data reliability issues. 
        Change this to receive a simple array of property.key and property.route_data pairs. 
        update properties where key matches the array and update route_data. 
        Look into keeping property status though?
    */
    const add = req.body.selected
    const droppedCard = req.body.droppedCard
    let response = 
        {
            add: [],
            err: []
        }
    let promises = []
    add.forEach((item, i) => {
        promises.push(
            db('properties')
            .returning('*')
            .where('key', item.key)
            // .andWhere('key', '<>', droppedCard.key)?
            .update({
                route_data: JSON.stringify(item.route_data),
            })
            .then(address => {
                response.add.push(address)
            }) 
            .catch(err => response.err.push(err))
        )       
    })
    // remove.forEach((item, i) => {
    //     promises.push(
    //         db('properties')
    //         .returning('address')
    //         .where({
    //             key: item.key,
    //         })
    //         .update({
    //             ...item, 
    //             route_name: item.route_name === route ? "unassigned" : item.route_name,
    //             route_position: item.route_name === route ? null : item.route_position,
    //             status: item.route_name === route ? null : item.status,
    //             // address: item.address,
    //             // cust_name: item.cust_name,
    //             // cust_phone: item.cust_phone,
    //             // surface_type: item.surface_type,
    //             // is_new: item.is_new,
    //             // notes: item.notes,
    //             // seasonal: item.seasonal,
    //             // price: item.price,
    //             // value: item.value,
    //             // temp: item.temp,
    //             // contract_type: item.contract_type,
    //             // price_per_yard: item.price_per_yard,
    //             // inactive: item.inactive,
    //             route_data: JSON.stringify(item.route_data),
    //         })
    //         .then(address => {
    //             response.remove.push(address)
    //         })  
    //         .catch(err => response.err.push(err)) 
    //     )
    // })    
    Promise.all(promises).then(() => res.json(response))
})

//The following are temporary functions for importing old data. 
//Keep for now

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

app.post('/api/setstatus', (req, res) => {
    let property = req.body.property
    let promises = []
    let yards = (req.body.yards !== 0) ? ": " + req.body.yards + " yds" : "" 
    let response = {
        properties: [],
        serviceLog: [],
        err: []
    }

    promises.push(
        db('properties')
        .returning('*')
        .where('key', req.body.property.key)
        .update({route_data: JSON.stringify(property.route_data)})
        .then(property => response.properties.push(property))
        .catch(err => {
            response.err.push(err)
        })
    )

    promises.push(
        db('service_log')
        .returning('*')
        .insert({
            address: property.address,
            status: req.body.status,
            notes: req.body.noteField,
            user_name: req.body.driver.name,
            route_name: req.body.route,
            tractor: req.body.tractor,
            cust_name: property.cust_name,
            property_key: property.key,
            price: property.price,
            driver_earning: req.body.driver.percentage * .01 * property.value,
            description: req.body.work_type + yards,
            invoice_number: `A${property.key}${new Date().getMonth()}${new Date().getFullYear()}`,
            reference: property.address,
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
    db.select('*')
    .from('properties')
    .then(data => {
        res.json(data)
    })
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
    .insert({name: driver.name, percentage: driver.percentage})
     .then(driver =>  res.json(driver))
     .catch(err => res.json("error: " + err))
})

app.post('/api/editdriver', (req, res) => {
    const driver = req.body
    db('drivers')    
    .returning('*')
    .where('key', driver.key)
    .update({name: driver.name, percentage: driver.percentage})
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

app.get('/api/tractors', (req, res) => {
    db.select('*')
    .from('tractors')
    .then(data => {
        res.json(data)
    })
})

// get full list of tags
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

// delete a tag
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

app.get('/api/getroute/:routeName', (req, res) => {
    const { routeName } = req.params
    db.raw(`select * from properties where route_data @> '[{"route_name":"${routeName}"}]';`)
    .then(data => {
        res.json(data.rows)
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
            'service_log.item_code', 'service_log.description', 'service_log.price', 'service_log.timestamp', 'properties.contract_type', 'service_log.notes' 
        ]        

        db('service_log')
        .join('properties', 'service_log.property_key', '=', 'properties.key')
        .select(getFields)
        .whereBetween('service_log.timestamp', [options.start, options.end])
        .whereNotIn('properties.contract_type', ['Monthly', 'Seasonal'])   
        .andWhere('service_log.status', 'Done')
        .then(data => res.json(data))
        .catch(err => res.json(err))
        
    } else {
        db.whereBetween('service_log.timestamp', [options.start, options.end])
        .select('service_log.key', 'service_log.address', 'service_log.route_name', 'service_log.status', 'service_log.timestamp', 'service_log.notes', 
        'service_log.user_name', 'service_log.tractor', 'service_log.cust_name', 'service_log.property_key', 'service_log.price', 'service_log.driver_earning', 
        'service_log.invoice_number', 'service_log.reference', 'service_log.item_code', 'service_log.description', 'properties.value', 'properties.contract_type')
        .from('service_log')
        .join('properties', {'properties.key': 'service_log.property_key'})
        .orderBy('timestamp')
        .then(data => res.json(data))
    }
    


   
  
/*
invoice date and due date will be input by front end through date field in log options. 
Xero Billing
Monthly: 
 select '50' from customers where contract_type='monthly' //this will create a line item per customer with their monthly rate
 select xeroFields replace price with $50  from customers where contract_type='5030'
 select xeroFields from service_log where contract_type = 'per occurrance' or '5030'
 select xeroFields from service_log where contract_type = 'month' or 'seasonal' and work_type = 'sanding'
 

TODO once book keeper provides fields, complete xero option and enable dropdown on client.
xero select properties.cust_name, properties.email, properties.bill_address, properties.bill_address2, 
 properties.bill_city, properties.bill_state, properties.bill_zip, service_log.invoice_number, 
 service_log.invoice_date, service_log.due_date, service_log.description, service_log.
*/

})

app.get('/api/getlogs/:property', (req, res) => {
    const { property } = req.params
    db.where('service_log.property_key', property)
    .select('timestamp', 'property_key', 'address', 'cust_name', 'status', 'notes', 'description', 'user_name' )
    .from('service_log')
    .orderBy('timestamp', 'desc').limit(5)
    .then(data => res.json(data))
})

 app.get('*', (req, res) => {
   res.sendFile(path.join(__dirname+'/client/build/index.html'));
 });

server.listen(process.env.PORT || 5000);