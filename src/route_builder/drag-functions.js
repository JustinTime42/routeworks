
import { addDoc, getDocs, collection, doc, setDoc, deleteDoc, updateDoc } from "firebase/firestore"; 
import { db } from '../firebase'
import axios from 'axios'


export const setItem = (item, collection) => {
  const {id, ...rest} = item
  setDoc(doc(db, collection, id), {...rest})
  .then(() => console.log('success', id))
  .catch(err => console.log(err))
}

// not currently used
export const getLatLng = (address) => {
  return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address='${address.service_address}, ${address.service_city || ""}, ${address.service_state || ""}, ${address.service_zip || ""}'&key=AIzaSyAWlCgbe0nXrdjQ9Fp71KEZDXtNJlwKtEw`)
  .then(function (response) {
    console.log(response)
    let data = response.data.results[0]?.geometry?.location;
    if (data) {
      return {lat: data?.lat, lng: data?.lng}; 
    }
      else return null      
  })
  .catch((error) => {
    console.error(error);
  })
}



// export const migrateCustomers = async(organization) => {
//   const querySnapshot = await getDocs(collection(db, `organizations/${organization}/customer`));
//   querySnapshot.forEach((doc) => {
//       const customer = {...doc.data(), id: doc.id}
//       setItem(getCustFields(customer), `organizations/${organization}/customers`)
//       setItem(getLocationFields(customer), `organizations/${organization}/service_locations`)
//   });
// }


export const removeExtraFields = (item) => { 
    console.log(item)
    return (
        {
            id: item.id,
            cust_name: item.cust_name, 
            service_address: item.service_address || '',
            service_level: item.service_level || null,
            active: item.active !== undefined ? item.active : true,
            priority: item.priority !== undefined ? item.priority : false,
            status: item.status !== undefined ? item.status : "Waiting",
            // status: (item.contract_type === 'Hourly') ? "Hourly" : (item.status === undefined) ? "Waiting" : item.status,
            temp: item.temp !== undefined ? item.temp : false,
            new: item.new !== undefined ? item.new : false,
            // contract_type: item.contract_type,
        }
    )
}

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)
    console.log(source)
    const [removed] = sourceClone.splice(droppableSource.index, 1)  
    console.log(removeExtraFields(removed))  
    destClone.splice(droppableDestination.index, 0, {...removeExtraFields(removed)}  )
    const result = {}
    result[droppableSource.droppableId] = sourceClone
    result[droppableDestination.droppableId] = destClone
    console.log(result)
    return result
}

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}

export const onDragEnd = (result, onList, offList) => {
    const { source, destination, draggableId } = result

    const id2List = {
        droppable: offList,
        droppable2: onList
    }

    const getList = id => id2List[id]

    const newList = move(
        getList(source.droppableId),
        getList(destination.droppableId),
        source,
        destination
    )


    // // we're only ever going to care about the dropped card if it's dropped on the active route < not true...
     let droppedCard = newList[destination.droppableId].find(item => item.id === draggableId)
    if (!destination) {
        return;
    }

    //If only reordering route
    if (source.droppableId === destination.droppableId) {
        if (source.droppableId === 'droppable2') {
             
            const orderedItems = reorder(
                getList(source.droppableId),
                source.index,
                destination.index
            )
            return (
                {
                    newRoute: orderedItems,
                    scrollPosition: document.getElementById('droppable2scroll').scrollTop,
                    card: droppedCard, 
                    whereTo: 'same',
                }
            )
        } else return null
    } else {   //if  moving from one list to another
        if ((destination.droppableId === "droppable2")) { //If adding to route
            console.log(droppedCard)
            //droppedCard.status="Waiting"
            return (
                {
                    newRoute: newList.droppable2, 
                    scrollPosition: document.getElementById('droppable2scroll').scrollTop, 
                    card: droppedCard,
                    whereTo: 'on',
                }   
            )
        }
        else if (destination.droppableId === "droppable") {  // removing from route
            return (
                {
                    newRoute: newList.droppable2,
                    scrollPosition: document.getElementById('droppable2scroll').scrollTop,
                    card: droppedCard,
                    whereTo: 'off'
                }
            )  
           }
    }        
}

export const getLatLng = (address) => {
    return axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address='${address.service_address}, ${address.service_city || ""}, ${address.service_state || ""}, ${address.service_zip || ""}'&key=AIzaSyAWlCgbe0nXrdjQ9Fp71KEZDXtNJlwKtEw`)
    .then(function (response) {
      console.log(response)
      let data = response.data.results[0]?.geometry?.location;
      if (data) {
        return {lat: data?.lat, lng: data?.lng}; 
      }
        else return null      
    })
    .catch((error) => {
      console.error(error);
    })
<<<<<<< HEAD:src/route_builder/drag-functions.js
}
=======
  }
>>>>>>> 8963371246d97180d9ecd0c58988cbdaf9004059:src/route_builder/utils.js
