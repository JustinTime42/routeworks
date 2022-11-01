

export const removeExtraFields = (item) => {  
    console.log(item.status)  
    return (
        {
            id: item.id,
            cust_name: item.cust_name, 
            service_address: item.service_address || '',
            service_level: item.service_level || null,
            // active: item.active !== undefined ? item.active : true,
            // priority: item.priority !== undefined ? item.priority : false,
            // status: item.status === undefined ? (item.contract_type === 'Hourly') ? "Hourly" : "Waiting" : item.status,
            // temp: item.temp !== undefined ? item.temp : false,
            // new: item.new !== undefined ? item.new : false
            //maybe add temp and new here depending on Sandor's feedback
        }
    )
}

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)
    const [removed] = sourceClone.splice(droppableSource.index, 1)  
    console.log(removeExtraFields(removed))  
    destClone.splice(droppableDestination.index, 0, {...removeExtraFields(removed), status: 'Waiting', active: true}  )
    const result = {}
    result[droppableSource.droppableId] = sourceClone
    result[droppableDestination.droppableId] = destClone
    return result
}

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}

export const onDragEnd = (result, onList, offList) => {
    console.log(result)
    console.log(offList)
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
     console.log({...droppedCard})
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
        }   else return
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

