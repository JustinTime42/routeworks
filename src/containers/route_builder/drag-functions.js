

const removeExtraFields = (item) => {    
    return (
        {
            id: item.id,
            cust_name: item.cust_name, 
            address: item.address,
            service_level: item.service_level || false,
            active: item.active,
            priority: false,
            status: item.status || "Waiting",
            //maybe add temp and new here depending on Sandor's feedback
        }
    )
}

const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)
    const [removed] = sourceClone.splice(droppableSource.index, 1)  
    console.log(removeExtraFields(removed))  
    destClone.splice(droppableDestination.index, 0, removeExtraFields(removed)  )
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
    const { source, destination, draggableId } = result

    const id2List = {
        droppable: offList,
        droppable2: onList
    }

    const getList = id => id2List[id]

    //moving the below to the parent function
    const newList = move(
        getList(source.droppableId),
        getList(destination.droppableId),
        source,
        destination
    )

    console.log(newList)
        console.log(newList.droppable2)
        console.log(draggableId)
    // // we're only ever going to care about the dropped card if it's dropped on the active route
     let droppedCard = newList.droppable2.find(item => item.id === draggableId)
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
            console.log(orderedItems)
            // I'm attempting to use array index instead of route_position
            // orderedItems.forEach((item, i) => {
            //     item.route_position = i
            // })
            return (
                {
                    newRoute: orderedItems,
                    scrollPosition: document.getElementById('droppable2scroll').scrollTop,
                    card: droppedCard, 
                    whereTo: 'same',
                }
            )
            // this.setState({selected: orderedItems, scrollPosition: document.getElementById('droppable2scroll').scrollTop})
            // this.onSave(orderedItems)
        }   
    } else {   //if  moving from one list to another
       // newList.droppable2.forEach((item, i) => item.route_position = i) // removed to use array index instead of a separate field
        if ((destination.droppableId === "droppable2")) { //If adding to route
            droppedCard.status="Waiting"
            return (
                {
                    newRoute: newList.droppable2, 
                    scrollPosition: document.getElementById('droppable2scroll').scrollTop, 
                    card: droppedCard,
                    whereTo: 'on',
                }   
            )
            // this.setState({selected: newList.droppable2, scrollPosition: document.getElementById('droppable2scroll').scrollTop})
            // this.onSave(newList.droppable2, droppedCard, 'on') 
            // the below is old and no longer neccessary
            // if (this.state.selected.find(item => item.key === droppedCard.key)) { // if customer already on route 
            //     let rect = document.getElementById(`${droppedCard.key}routecard`).getBoundingClientRect().top
            //     let scrollTop = document.getElementById('droppable2scroll').scrollTop
            //     this.setState({scrollPosition: rect + scrollTop - (window.innerHeight * .3)}) 
            //    // document.getElementById('droppable2scroll').scrollTop = rect + scrollTop - (window.innerHeight * .3)                   
            //     alert(`${droppedCard.cust_name} is already on ${this.props.activeRoute}`)
            //     console.log(`${droppedCard.key}routecard`)
            //     document.getElementById(`${droppedCard.key}routecard`).scrollIntoView(true)

            // } else {
            //     droppedCard.status="Waiting"
            //     this.setState({selected: newList.droppable2, scrollPosition: document.getElementById('droppable2scroll').scrollTop})
            //     this.onSave(newList.droppable2, droppedCard, 'on') 
            // }
        }      
        else if (destination.droppableId === "droppable") {  // removing from route
            let droppedCard = newList.droppable.find(item => item.id === parseInt(result.draggableId.slice(1))) 
            return (
                {
                    newRoute: newList.droppable2,
                    scrollPosition: document.getElementById('droppable2scroll').scrollTop,
                    card: droppedCard,
                    whereTo: 'off'
                }
            ) 
        //    this.setState({selected: newList.droppable2, scrollPosition: document.getElementById('droppable2scroll').scrollTop})
        //     this.onSave(newList.droppable2, droppedCard, 'off')   
           }
    }        
}

// export const getItemStyle = (isDragging, draggableStyle) => ({
//     // some basic styles to make the items look a bit nicer
//     userSelect: 'Waiting',
//     padding: grid * 2,
//     margin: `0 0 ${grid}px 0`,

//     // change background colour if dragging
//     background: isDragging ? '#4E8098' : '#303030',

//     // styles we need to apply on draggables
//     ...draggableStyle
// })

// export const getListStyle = isDraggingOver => ({   
//     padding: grid,
//     height: "85vh", 
//     overflow: "scroll", 
//     width: "90%"
// })

