
 const id2List = {
    droppable: 'filteredItems',
    droppable2: 'selected'
}

export const getList = id => this.state[this.id2List[id]]

export const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)
    const [removed] = sourceClone.splice(droppableSource.index, 1)
    destClone.splice(droppableDestination.index, 0, removed)
    const result = {}
    result[droppableSource.droppableId] = sourceClone
    result[droppableDestination.droppableId] = destClone
    return result
}

export const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}

onDragEnd = result => {
    const { source, destination } = result
    this.props.onSetActiveProperty(this.props.addresses.find(property => property.key === parseInt(result.draggableId.slice(1))))
    const newList = move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination
    )

    if (!destination) {
        return;
    }

    //If only reordering route
    if (source.droppableId === destination.droppableId) {
        if (source.droppableId === 'droppable2') {
            const orderedItems = reorder(
                this.getList(source.droppableId),
                source.index,
                destination.index
            )
            orderedItems.forEach((item, i) => {
                item.route_position = i
            })
            this.setState({selected: orderedItems, scrollPosition: document.getElementById('droppable2scroll').scrollTop})
            this.onSave(orderedItems)
        }   
    } else {   //if  moving from one list to another
        newList.droppable2.forEach((item, i) => item.route_position = i)
        if ((destination.droppableId === "droppable2")) { //If adding to route
            let droppedCard = newList.droppable2.find(item => item.key === parseInt(result.draggableId.slice(1))) 
            if (this.state.selected.find(item => item.key === droppedCard.key)) { // if customer already on route 
                let rect = document.getElementById(`${droppedCard.key}routecard`).getBoundingClientRect().top
                let scrollTop = document.getElementById('droppable2scroll').scrollTop
                this.setState({scrollPosition: rect + scrollTop - (window.innerHeight * .3)}) 
               // document.getElementById('droppable2scroll').scrollTop = rect + scrollTop - (window.innerHeight * .3)                   
                alert(`${droppedCard.cust_name} is already on ${this.props.activeRoute}`)
                console.log(`${droppedCard.key}routecard`)
                document.getElementById(`${droppedCard.key}routecard`).scrollIntoView(true)

            } else {
                droppedCard.status="Waiting"
                this.setState({selected: newList.droppable2, scrollPosition: document.getElementById('droppable2scroll').scrollTop})
                this.onSave(newList.droppable2, droppedCard, 'on') 
            }
        }      
        else if (destination.droppableId === "droppable") {  // removing from route
            let droppedCard = newList.droppable.find(item => item.key === parseInt(result.draggableId.slice(1)))  
           this.setState({selected: newList.droppable2, scrollPosition: document.getElementById('droppable2scroll').scrollTop})
            this.onSave(newList.droppable2, droppedCard, 'off')   
           }
    }        
}

export const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'Waiting',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? '#4E8098' : '#303030',

    // styles we need to apply on draggables
    ...draggableStyle
})

export const getListStyle = isDraggingOver => ({   
    padding: grid,
    height: "85vh", 
    overflow: "scroll", 
    width: "90%"
})

